"use client";
import {useEffect,useRef} from 'react';

/** Raster artwork, revealed only while moving into view. */
export default function SculptureReveal({reduced}:{reduced:boolean}){
  const section=useRef<HTMLElement>(null),artwork=useRef<HTMLImageElement>(null);
  useEffect(()=>{
    const root=section.current,img=artwork.current;
    if(reduced||!root||!img)return;
    let cancelled=false,cleanup=()=>{};
    // Fetch early, but keep the artwork visually concealed until the entrance.
    Promise.all([import('gsap'),import('gsap/ScrollTrigger'),img.decode()]).then(([{gsap},{ScrollTrigger}])=>{
      if(cancelled)return;
      gsap.registerPlugin(ScrollTrigger);
      delete root.dataset.static;
      root.dataset.animated='true';
      const ctx=gsap.context(()=>{
        const media=gsap.matchMedia();
        media.add({desktop:'(min-width:641px)',mobile:'(max-width:640px)'},context=>{
          const desktop=!!context.conditions?.desktop;
          const reveal=gsap.timeline({scrollTrigger:{
            trigger:root,start:'top 65%',end:'bottom bottom',scrub:.22,invalidateOnRefresh:true
          }});
          reveal.fromTo('.sculpture-art',
            {left:'50%',top:'50%',xPercent:-50,yPercent:-50,x:0,y:0,scale:5.4,rotation:-16},
            {scale:1,rotation:0,duration:.60,ease:'power2.out'},0)
          .fromTo('.sculpture-art',{autoAlpha:0},{autoAlpha:1,duration:.075,ease:'power1.out'},0)
          .to('.sculpture-art',{left:desktop?'72%':'50%',top:desktop?'50%':'32%',scale:desktop?1:.90,duration:.24,ease:'power1.inOut'},.64)
          .fromTo('.sculpture-copy',{autoAlpha:0,y:20,yPercent:desktop?-50:0},{autoAlpha:1,y:0,yPercent:desktop?-50:0,duration:.16,ease:'power1.out'},.88)
          .fromTo('.sculpture-divider',{autoAlpha:0,scaleY:desktop?.5:1,scaleX:desktop?1:.5},{autoAlpha:1,scaleX:1,scaleY:1,duration:.18,ease:'power1.out'},.84)
          .to('.sculpture-copy',{opacity:1,duration:.12},1.04);
        });
      },root);
      let refreshFrame=0;
      const refresh=()=>{
        cancelAnimationFrame(refreshFrame);
        refreshFrame=requestAnimationFrame(()=>{if(!cancelled)ScrollTrigger.refresh()});
      };
      document.fonts.ready.then(()=>{if(!cancelled)refresh()});
      window.addEventListener('fundi-appearance',refresh);
      window.addEventListener('fundi-layout-change',refresh);
      cleanup=()=>{cancelAnimationFrame(refreshFrame);ctx.revert();delete root.dataset.animated;window.removeEventListener('fundi-appearance',refresh);window.removeEventListener('fundi-layout-change',refresh)};
    }).catch(()=>{if(!cancelled)root.dataset.static='true'});
    return()=>{cancelled=true;cleanup();delete root.dataset.static};
  },[reduced]);
  return <section ref={section} id="visuals" className="sculpture-runway" aria-label="Custom visual design">
    <div className="sculpture-sticky"><div className="sculpture-panel">
      <div className="sculpture-art" aria-hidden="true"><img ref={artwork} src="/showcase-sculpture-purple.webp" alt="" width={1254} height={1254} loading="eager" decoding="async" fetchPriority="low"/></div>
      <div className="sculpture-copy"><span className="eyebrow">Custom visuals</span><h2>Ideas,<br/>made visible.</h2><p>Design that belongs to your business.</p></div>
      <span className="sculpture-divider" aria-hidden="true"/>
    </div></div>
  </section>;
}
