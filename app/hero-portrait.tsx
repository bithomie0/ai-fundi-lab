"use client";
import {useEffect,useRef} from 'react';
import manifest from '../public/models/manifest.json';
import {setMotionLayout} from './fundi-motion-layout';

/** A real-model particle still appears immediately, before the GPU scene is ready. */
export default function HeroPortrait(){
  const anchor=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const enabled=manifest.enabled||new URLSearchParams(location.search).get('motion')==='review';
    if(!enabled||!anchor.current)return;
    let controller:AbortController|undefined;
    let dispose:undefined|(()=>void);
    let failed=false;
    let timeout:ReturnType<typeof setTimeout>|undefined;
    const stop=()=>{clearTimeout(timeout);controller?.abort();controller=undefined;dispose?.();dispose=undefined;setMotionLayout(null)};
    const update=()=>{
      const reduced=document.documentElement.dataset.motion==='reduce';
      const connection=(navigator as Navigator&{connection?:{saveData?:boolean}}).connection;
      const eligible=!reduced&&!connection?.saveData&&innerHeight>=500&&innerWidth>=320;
      if(!eligible){stop();return}
      if(controller||failed)return;
      const attempt=new AbortController();controller=attempt;
      setMotionLayout('loading');
      timeout=setTimeout(()=>{failed=true;stop();anchor.current?.setAttribute('data-model','fallback')},20000);
      import('./fundi-motion').then(({createFundiMotion})=>{
        if(attempt.signal.aborted||!anchor.current)return;
        return createFundiMotion({anchor:anchor.current,signal:attempt.signal,
          onReady:()=>{clearTimeout(timeout);anchor.current?.setAttribute('data-model','ready')},
          onError:()=>{clearTimeout(timeout);failed=true;setMotionLayout(null);anchor.current?.setAttribute('data-model','fallback')}});
      }).then(cleanup=>{
        if(attempt.signal.aborted){cleanup?.();return}dispose=cleanup;
      }).catch(error=>{if(!attempt.signal.aborted){failed=true;stop();anchor.current?.setAttribute('data-model','fallback');console.warn('Fundi 3D could not start; keeping the portrait.',error)}});
    };
    update();window.addEventListener('fundi-appearance',update);window.addEventListener('resize',update);
    return()=>{stop();window.removeEventListener('fundi-appearance',update);window.removeEventListener('resize',update)};
  },[]);
  return <div ref={anchor} className="hero-portrait" role="img" aria-label="Chris Conley, The AI Fundi">
    <img className="hero-particle-still" src="/chris-head-particles-1200.webp" srcSet="/chris-head-particles-600.webp 600w, /chris-head-particles-1200.webp 1200w" sizes="(max-width:640px) 84vw, 63vh" alt="" width={1200} height={1200} fetchPriority="high"/>
    <img className="hero-model-solid" src="/chris-builder-model-960.webp" alt="" width={960} height={960} loading="lazy"/>
  </div>;
}
