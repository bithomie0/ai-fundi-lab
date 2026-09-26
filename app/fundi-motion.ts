import * as THREE from 'three';
import {GLTFLoader, type GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {vertexShader,fragmentShader} from './fundi-motion-shaders';
import {setMotionLayout} from './fundi-motion-layout';
import {activeJourney,buildJourney,type JourneyLeg,type PageRect} from './fundi-journey';
import {advanceMotionScroll,heroMorph} from './fundi-motion-timing';

type Normalization={center:[number,number,number];scale:number;bounds:[number[],number[]]};
type SurfaceMetadata={version:number;count:number;stride:number;head:Normalization;bee:Normalization;bones:string[]};
type Options={anchor:HTMLElement;signal:AbortSignal;onReady:()=>void;onError:()=>void};
const clamp=THREE.MathUtils.clamp;
const smooth=(a:number,b:number,v:number)=>THREE.MathUtils.smootherstep(v,a,b);
const materialList=(mesh:THREE.Mesh)=>Array.isArray(mesh.material)?mesh.material:[mesh.material];

async function binary(path:string,signal:AbortSignal){
  const compressed=typeof DecompressionStream!=='undefined';
  const response=await fetch(path+(compressed?'.gz':''),{signal});
  if(!response.ok)throw new Error(`Model asset unavailable: ${response.status}`);
  let bytes=await response.arrayBuffer();
  const magic=new Uint8Array(bytes,0,Math.min(2,bytes.byteLength));
  if(compressed&&magic[0]===31&&magic[1]===139){
    bytes=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  return bytes;
}

function normalize(model:THREE.Object3D,meta:Normalization){
  const group=new THREE.Group();
  group.scale.setScalar(meta.scale);
  group.position.fromArray(meta.center).multiplyScalar(-meta.scale);
  group.add(model);
  return group;
}

function disposeModel(model:THREE.Object3D){
  const geometries=new Set<THREE.BufferGeometry>();
  const materials=new Set<THREE.Material>();
  const textures=new Set<THREE.Texture>();
  model.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    geometries.add(object.geometry);
    for(const material of materialList(object)){
      materials.add(material);
      for(const value of Object.values(material))if(value instanceof THREE.Texture)textures.add(value);
    }
  });
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
  textures.forEach(t=>{const image=t.source?.data;t.dispose();if(typeof ImageBitmap!=='undefined'&&image instanceof ImageBitmap)image.close()});
}

/** One persistent actor and wing mixer for the whole page. */
export async function createFundiMotion({anchor,signal,onReady,onError}:Options):Promise<()=>void>{
  const root=document.documentElement;
  const hero=anchor.closest<HTMLElement>('.hero-runway');
  if(!hero)throw new Error('Hero anchor missing');
  const loader=new GLTFLoader();
  let head:GLTF|undefined,bee:GLTF|undefined,renderer:THREE.WebGLRenderer|undefined;
  let cleanup=()=>{};
  try{
    const [headBytes,beeBytes,pointBytes,metadataResponse]=await Promise.all([
      binary('/models/chris-head.glb',signal),binary('/models/honeybee.glb',signal),
      binary('/models/fundi-surface.bin',signal),fetch('/models/fundi-surface.json',{signal})
    ]);
    if(!metadataResponse.ok)throw new Error('Model metadata unavailable');
    const metadata=await metadataResponse.json() as SurfaceMetadata;
    if(metadata.version!==1||metadata.stride!==26||pointBytes.byteLength!==metadata.count*52)throw new Error('Incompatible model data');
    if(signal.aborted)return()=>{};
    // Parse sequentially so every allocated resource remains owned on failure.
    head=await loader.parseAsync(headBytes,'');
    bee=await loader.parseAsync(beeBytes,'');
    if(signal.aborted){disposeModel(head.scene);disposeModel(bee.scene);return()=>{}}
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.1;
    let shaderFailed=false;
    renderer.debug.onShaderError=()=>{shaderFailed=true};
    const canvas=renderer.domElement;
    canvas.className='fundi-motion-canvas';canvas.setAttribute('aria-hidden','true');
    document.body.appendChild(canvas);
    const scene=new THREE.Scene();
    const camera=new THREE.OrthographicCamera(-4,4,3,-3,.1,40);
    camera.position.set(0,0,12);
    const actor=new THREE.Group();scene.add(actor);
    const headGroup=normalize(head.scene,metadata.head);actor.add(headGroup);
    // A depth-only copy hides the far side of the bust at rest. It shares the
    // original geometry; it never paints a solid face or a rectangular backdrop.
    const depthMaterial=new THREE.MeshBasicMaterial({colorWrite:false,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2});
    depthMaterial.onBeforeCompile=shader=>{
      // The binary uses float16 positions. Inset the occluder slightly so surface
      // quantisation and breathing cannot randomly hide front-facing particles.
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\ntransformed -= normal * ${.004/metadata.head.scale};`);
    };
    const headDepth=headGroup.clone(true);
    headDepth.traverse(o=>{if(o instanceof THREE.Mesh){o.material=depthMaterial;o.renderOrder=-1}});
    actor.add(headDepth);
    const beeTurn=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(.25,Math.PI+.38,-.10,'YXZ'));
    const beeOrientation=new THREE.Group();beeOrientation.setRotationFromMatrix(beeTurn);
    const beeNormalized=normalize(bee.scene,metadata.bee);beeOrientation.add(beeNormalized);actor.add(beeOrientation);
    let skinned:THREE.SkinnedMesh|undefined;
    bee.scene.traverse(o=>{if(o instanceof THREE.SkinnedMesh){skinned??=o;o.frustumCulled=false}});
    if(!skinned||!bee.animations.length)throw new Error('The bee requires its wing rig');
    const skin=skinned;
    const boneIndices=metadata.bones.map(name=>skin.skeleton.bones.findIndex(b=>b.name===name));
    if(boneIndices.some(i=>i<0))throw new Error('The bee rig does not match the surface weights');
    const mixer=new THREE.AnimationMixer(bee.scene);
    const clip=bee.animations.find(c=>c.name==='Flap')??bee.animations[0];
    mixer.clipAction(clip).play();
    const skeletons=new Set<THREE.Skeleton>();
    bee.scene.traverse(o=>{if(o instanceof THREE.SkinnedMesh)skeletons.add(o.skeleton)});
    const bones=metadata.bones.map(()=>new THREE.Matrix4());
    const canonical=new THREE.Matrix4().makeScale(metadata.bee.scale,metadata.bee.scale,metadata.bee.scale);
    canonical.setPosition(new THREE.Vector3(...metadata.bee.center).multiplyScalar(-metadata.bee.scale));
    const canonicalInverse=canonical.clone().invert();
    const rawWorldInverse=new THREE.Matrix4();
    const geometry=new THREE.BufferGeometry();
    const packed=new Uint16Array(pointBytes);
    const attributes:[string,number,number][]=[['position',0,3],['normal',3,3],['beePosition',6,3],['beeNormal',9,3],['headColor',12,3],['beeColor',15,3],['weightsA',18,4],['weightsB',22,2],['detailSeed',24,2]];
    for(const [name,offset,size] of attributes){
      const values=new Uint16Array(metadata.count*size);
      for(let i=0;i<metadata.count;i++)for(let j=0;j<size;j++)values[i*size+j]=packed[i*metadata.stride+offset+j];
      geometry.setAttribute(name,new THREE.Float16BufferAttribute(values,size));
    }
    geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(),5);
    const uniforms={uBones:{value:bones},uBeeTurn:{value:beeTurn},uMorph:{value:0},uTime:{value:0},uPixelRatio:{value:1},uSize:{value:1.7},uDark:{value:1},uOpacity:{value:1}};
    const material=new THREE.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent:true,depthWrite:false,depthTest:true,toneMapped:false});
    const points=new THREE.Points(geometry,material);points.frustumCulled=false;actor.add(points);
    const hemisphere=new THREE.HemisphereLight(0xffffff,0x5b5063,2.1);scene.add(hemisphere);
    const key=new THREE.DirectionalLight(0xfff5ee,3.4);key.position.set(-3,5,7);scene.add(key);
    const fill=new THREE.DirectionalLight(0xdcc6ef,1.1);fill.position.set(4,1,3);scene.add(fill);
    const rim=new THREE.DirectionalLight(0xffffff,2.6);rim.position.set(2,4,-4);scene.add(rim);
    const solidMaterials:{material:THREE.Material;opacity:number;transparent:boolean;depthWrite:boolean;kind:'head'|'bee'}[]=[];
    for(const [model,kind] of [[head.scene,'head'],[bee.scene,'bee']] as const)model.traverse(o=>{
      if(o instanceof THREE.Mesh)for(const m of materialList(o))solidMaterials.push({material:m,opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite,kind});
    });
    let width=1,height=1,spanX=8,spanY=6,frame=0,last=0,time=0,disposed=false,ready=false;
    let currentScroll=window.scrollY,previousScroll=currentScroll,heroTop=0,runway=1,anchorX=0,anchorY=0,anchorScale=1,small=false;
    let journey:JourneyLeg[]=[];
    const serviceAnchor=document.querySelector<HTMLElement>('[data-bee-anchor="services"]');
    const contactAnchor=document.querySelector<HTMLElement>('[data-bee-anchor="contact"]');
    const pointer=new THREE.Vector2(),pointerTarget=new THREE.Vector2();
    let dark=root.dataset.theme!=='light'?1:0,darkTarget=dark;
    const fadeElements=Array.from(hero.querySelectorAll<HTMLElement>('.hero-fade'));
    const saved=fadeElements.map(el=>({el,opacity:el.style.opacity,visibility:el.style.visibility}));
    const flight=new THREE.CatmullRomCurve3();
    const basePosition=new THREE.Vector3(),flightPosition=new THREE.Vector3(),tangent=new THREE.Vector3();
    const baseRotation=new THREE.Quaternion(),flightRotation=new THREE.Quaternion();
    const forward=new THREE.Vector3(0,0,-1).transformDirection(beeTurn),yaw=new THREE.Quaternion(),bank=new THREE.Quaternion();
    const hoverRotation=new THREE.Quaternion().setFromUnitVectors(forward,new THREE.Vector3(-.75,.04,.65).normalize());
    const portraitRotation=new THREE.Euler(0,0,0,'YXZ');
    const zAxis=new THREE.Vector3(0,0,1),yAxis=new THREE.Vector3(0,1,0);

    function measure(){
      width=window.innerWidth;height=window.innerHeight;small=width<768;
      spanY=6;spanX=spanY*width/height;
      camera.left=-spanX/2;camera.right=spanX/2;camera.top=spanY/2;camera.bottom=-spanY/2;camera.updateProjectionMatrix();
      renderer!.setPixelRatio(Math.min(window.devicePixelRatio||1,small?1.5:1.75));renderer!.setSize(width,height);
      uniforms.uPixelRatio.value=renderer!.getPixelRatio();
      geometry.setDrawRange(0,small?34200:metadata.count);
      const heroRect=hero!.getBoundingClientRect();heroTop=heroRect.top+window.scrollY;
      // The fixed bee continues through the incoming work section. Ending at the
      // sticky range (height minus one viewport) would leave an empty final screen.
      runway=Math.max(height,hero!.offsetHeight);
      const rect=anchor.getBoundingClientRect();
      // The sticky container may already be leaving. Recover the original viewport anchor.
      const stickyOffset=Math.min(0,heroRect.bottom-height);
      anchorX=((rect.left+rect.width/2)/width-.5)*spanX;
      anchorY=(.5-(rect.top+rect.height/2-stickyOffset)/height)*spanY;
      const pixelSize=Math.min(rect.height,rect.width/.98);
      anchorScale=pixelSize/height*spanY/2.8*.88;
      basePosition.set(anchorX,anchorY,0);
      flight.points=[new THREE.Vector3(0,0,0),new THREE.Vector3(spanX*.07,.28,.6),new THREE.Vector3(-spanX*.2,.66,.25),new THREE.Vector3(-spanX*.74,1.3,-1.2)];
      flight.updateArcLengths();
      const bounds=(el:HTMLElement|null):PageRect|null=>{
        if(!el)return null;
        const r=el.getBoundingClientRect();
        return {left:r.left,top:r.top+window.scrollY,width:r.width,height:r.height};
      };
      journey=buildJourney({width,height,maxScroll:Math.max(0,root.scrollHeight-height),services:bounds(serviceAnchor),contact:bounds(contactAnchor)});
    }
    function appearance(){darkTarget=root.dataset.theme!=='light'?1:0;wake()}
    function scroll(){wake()}
    function pointerMove(event:PointerEvent){
      if(event.pointerType!=='mouse')return;
      pointerTarget.set((event.clientX/width-.5)*2,(event.clientY/height-.5)*2);wake();
    }
    function pointerLeave(){pointerTarget.set(0,0)}
    function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0}else wake()}
    function resize(){if(disposed)return;measure();wake()}
    function lost(event:Event){event.preventDefault();cleanup();onError()}
    function wake(){if(!disposed&&!document.hidden&&!frame)frame=requestAnimationFrame(tick)}
    function tick(now:number){
      frame=0;if(disposed||document.hidden)return;
      const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;time+=dt;
      const scrollTarget=window.scrollY;
      currentScroll=advanceMotionScroll(currentScroll,scrollTarget,heroTop,runway,height,dt);
      const velocity=Math.min(Math.abs(currentScroll-previousScroll)/Math.max(dt,.001)/height,3);previousScroll=currentScroll;
      const progress=clamp((currentScroll-heroTop)/runway,0,1);
      const inHero=scrollTarget<heroTop+runway&&scrollTarget+height>heroTop;
      const journeyState=inHero?null:activeJourney(currentScroll,journey,height);
      const visible=inHero||journeyState!==null;
      const morph=journeyState?1:heroMorph(progress);
      const leave=smooth(.5667,.9833,progress);
      const recenter=smooth(.015,.20,progress);
      dark+=(darkTarget-dark)*(1-Math.exp(-8*dt));
      uniforms.uDark.value=dark;uniforms.uMorph.value=morph;uniforms.uTime.value=time;
      const opacity=journeyState?1:1-smooth(.96,1,progress);
      const textFade=1-smooth(0,.0833,progress);
      for(const element of fadeElements){element.style.opacity=String(textFade);element.style.visibility=textFade<.015?'hidden':''}
      basePosition.set(anchorX*(1-recenter),anchorY*(1-recenter),0);
      flight.getPoint(leave,flightPosition);actor.position.copy(basePosition).add(flightPosition);
      actor.position.y+=Math.sin(time*1.6)*.014*smooth(.45,.55,progress);
      // Preserve the visual weight of the portrait while the bee takes shape.
      actor.scale.setScalar(anchorScale*THREE.MathUtils.lerp(1,.98,morph)*THREE.MathUtils.lerp(1,.58,leave));
      pointer.lerp(pointerTarget,1-Math.exp(-4*dt));
      portraitRotation.set(-pointer.y*.06*(1-morph),(pointer.x*.12+Math.sin(time*.35)*.018)*(1-morph),0);
      yaw.setFromEuler(portraitRotation);baseRotation.copy(yaw);
      flight.getTangent(leave,tangent).normalize();flightRotation.setFromUnitVectors(forward,tangent);
      // Bank into the curved exit rather than sliding a fixed bee sideways.
      bank.setFromAxisAngle(zAxis,-.32*Math.sin(leave*Math.PI));flightRotation.multiply(bank);
      actor.quaternion.copy(baseRotation).slerp(flightRotation,leave);
      if(journeyState){
        const {leg,progress:p}=journeyState;
        leg.curve.getPoint(p,flightPosition);leg.curve.getTangent(p,tangent).normalize();
        // Anchor Y follows the actual page; damping changes the flight, not the
        // relationship between the bee and the text around its reserved space.
        const anchorY=(.5-(leg.anchor.top+leg.anchor.height/2-scrollTarget)/height)*spanY;
        actor.position.copy(flightPosition);actor.position.y+=anchorY;
        actor.scale.setScalar(leg.scale*(1+.055*Math.sin(p*Math.PI)));
        flightRotation.setFromUnitVectors(forward,tangent);
        bank.setFromAxisAngle(zAxis,.13*Math.sin(p*Math.PI*2));flightRotation.multiply(bank);
        if(leg.kind==='contact'){
          const settle=smooth(.68,1,p);
          flightRotation.slerp(hoverRotation,settle);
          actor.position.y+=Math.sin(time*1.7)*.035*settle;
          bank.setFromAxisAngle(yAxis,Math.sin(time*1.2)*.025*settle);flightRotation.multiply(bank);
        }
        actor.quaternion.copy(flightRotation);
      }
      const headOpacity=(1-dark)*(1-smooth(0,.16,morph));
      const beeOpacity=(1-dark)*smooth(.87,1,morph);
      headGroup.visible=headOpacity>.002;beeOrientation.visible=beeOpacity>.002;
      headDepth.visible=inHero&&dark>.98&&morph<.015;
      points.visible=opacity>.002;
      uniforms.uOpacity.value=opacity*THREE.MathUtils.lerp((1-headOpacity)*(1-beeOpacity),1,dark);
      uniforms.uSize.value=clamp(actor.scale.x*height/spanY*THREE.MathUtils.lerp(.0105,.013,morph),THREE.MathUtils.lerp(small?.72:.65,.9,morph),THREE.MathUtils.lerp(1.6,2,morph));
      for(const item of solidMaterials){
        const fade=(item.kind==='head'?headOpacity:beeOpacity)*opacity;
        item.material.opacity=item.opacity*fade;
        const transparent=item.transparent||fade<.995;
        if(item.material.transparent!==transparent){item.material.transparent=transparent;item.material.needsUpdate=true}
        item.material.depthWrite=item.depthWrite&&fade>.995;
      }
      // Keep the identical rig advancing in either theme, even when solid meshes are hidden.
      if(visible)mixer.update(dt*((journeyState?.leg.kind==='contact'&&journeyState.progress>.92)?.8:1+velocity*.12));
      scene.updateMatrixWorld(true);
      rawWorldInverse.copy(bee!.scene.matrixWorld).invert();
      for(let i=0;i<6;i++){
        const index=boneIndices[i];
        bones[i].copy(canonical).multiply(rawWorldInverse).multiply(skin.skeleton.bones[index].matrixWorld).multiply(skin.skeleton.boneInverses[index]).multiply(canonicalInverse);
      }
      canvas.style.opacity=ready&&visible?'1':'0';
      if(visible){
        try{renderer!.render(scene,camera)}catch{cleanup();onError();return}
        if(shaderFailed){cleanup();onError();return}
      }
      if(!ready){ready=true;setMotionLayout('ready');canvas.style.opacity=visible?'1':'0';onReady()}
      if(visible||Math.abs(scrollTarget-currentScroll)>.15||Math.abs(dark-darkTarget)>.002)wake();else last=0;
    }
    cleanup=()=>{
      if(disposed)return;disposed=true;cancelAnimationFrame(frame);
      window.removeEventListener('scroll',scroll);window.removeEventListener('resize',resize);
      window.removeEventListener('pointermove',pointerMove);document.removeEventListener('pointerleave',pointerLeave);
      document.removeEventListener('load',resize,true);document.removeEventListener('loadedmetadata',resize,true);
      window.removeEventListener('fundi-appearance',appearance);document.removeEventListener('visibilitychange',visibility);
      canvas.removeEventListener('webglcontextlost',lost);signal.removeEventListener('abort',cleanup);
      resizeObserver.disconnect();setMotionLayout(null);
      for(const {el,opacity,visibility} of saved){el.style.opacity=opacity;el.style.visibility=visibility}
      mixer.stopAllAction();mixer.uncacheRoot(bee!.scene);skeletons.forEach(s=>s.dispose());
      geometry.dispose();material.dispose();depthMaterial.dispose();disposeModel(head!.scene);disposeModel(bee!.scene);
      renderer!.dispose();renderer!.forceContextLoss();canvas.remove();
    };
    const resizeObserver=new ResizeObserver(resize);
    for(const el of [anchor,document.body,serviceAnchor,contactAnchor])if(el)resizeObserver.observe(el);
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',resize);
    window.addEventListener('pointermove',pointerMove,{passive:true});document.addEventListener('pointerleave',pointerLeave);
    document.addEventListener('load',resize,true);document.addEventListener('loadedmetadata',resize,true);
    document.fonts.ready.then(()=>{if(!disposed)resize()});
    window.addEventListener('fundi-appearance',appearance);document.addEventListener('visibilitychange',visibility);
    canvas.addEventListener('webglcontextlost',lost);signal.addEventListener('abort',cleanup,{once:true});
    // The component reserves the scroll distance while the point portrait is visible.
    // Starting to scroll during loading must not disable the whole animation.
    measure();currentScroll=window.scrollY;
    await renderer.compileAsync(scene,camera);
    if(signal.aborted){cleanup();return()=>{}}
    if(shaderFailed)throw new Error('The device could not compile the 3D scene');
    measure();wake();
    return cleanup;
  }catch(error){
    cleanup();
    // Also covers failures before the complete scene cleanup is registered.
    renderer?.domElement.remove();renderer?.dispose();
    if(head)disposeModel(head.scene);if(bee)disposeModel(bee.scene);
    setMotionLayout(null);
    if(!signal.aborted)throw error;
    return()=>{};
  }
}
