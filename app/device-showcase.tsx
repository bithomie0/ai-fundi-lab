"use client";
import {useEffect,useRef,useState} from 'react';
import {Play,Pause} from 'lucide-react';

// Each slide owns both device captures and all its identifying content.
const projects=[
  {id:'blooms',name:'Blooms & Botanicals',domain:'bloomsbotanicals.com',desktop:'blooms-botanicals.jpg',mobile:'blooms-botanicals-mobile.jpg',tab:'Websites',title:['A website,','with purpose.'],copy:'A clear path from interest to action.'},
  {id:'kiddo',name:'Kiddo',domain:'kiddo.now',desktop:'kiddo.jpg',mobile:'kiddo-mobile.jpg',tab:'Applications',title:['An app,','built around you.'],copy:'Useful tools for the work you do every day.'}
];
export default function DeviceShowcase({reduced}:{reduced:boolean}){
  const [playing,setPlaying]=useState(true),[active,setActive]=useState(0);
  const [visible,setVisible]=useState(false),[tabVisible,setTabVisible]=useState(true);
  const root=useRef<HTMLDivElement>(null),playback=useRef<HTMLButtonElement>(null);
  const p=projects[active],running=playing&&visible&&tabVisible&&!reduced;
  useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting&&entry.intersectionRatio>=.5),{threshold:.5});
    if(root.current)observer.observe(root.current);
    const onVisibility=()=>setTabVisible(!document.hidden);onVisibility();
    document.addEventListener('visibilitychange',onVisibility);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',onVisibility)};
  },[]);
  useEffect(()=>{if(!running)return;const timer=setTimeout(()=>setActive(i=>(i+1)%projects.length),6000);return()=>clearTimeout(timer)},[running,active]);
  return <section className="film-runway device-showcase" id="showcase" aria-label="Websites and applications showcase">
    <div className="film-sticky"><div className="film-frame" ref={root} data-project={p.id}>
      <div className={'showcase-devices '+(running?'is-playing':'')} aria-hidden="true">
        {projects.map(project=><div key={project.id} className="device-pair" data-active={project.id===p.id}>
          <div className="browser-display"><div className="browser-bar"><i/><i/><i/><span>{project.domain}</span></div><img src={'/portfolio/'+project.desktop} alt="" width={2560} height={1600} loading="lazy"/></div>
          <div className="phone-display"><div className="phone-island"/><div className="phone-screen"><img src={'/portfolio/'+project.mobile} alt="" width={375} height={812} loading="lazy"/></div></div>
        </div>)}
      </div>
      <div className="film-over"><span className="film-label">From an idea to something people use</span><div className="showcase-copy" key={p.id}><span className="showcase-client">{p.name}</span><h2>{p.title[0]}<br/>{p.title[1]}</h2><p>{p.copy}</p></div></div>
      <div className="film-controls" onFocusCapture={e=>{if((e.target as HTMLElement)!==playback.current)setPlaying(false)}}>
        <div className="showcase-tabs" aria-label="Choose a showcase">{projects.map((project,i)=><button key={project.id} aria-pressed={i===active} aria-label={'Show '+project.name+' on desktop and mobile'} onClick={()=>{setPlaying(false);setActive(i)}}><span>0{i+1}</span>{project.tab}</button>)}</div>
        <button ref={playback} className="showcase-playback" aria-label={playing&&!reduced?'Pause showcase':'Play showcase'} onClick={()=>setPlaying(p=>!p)} disabled={reduced}>{playing&&!reduced?<Pause size={18}/>:<Play size={18}/>}</button>
      </div>
    </div></div>
  </section>;
}
