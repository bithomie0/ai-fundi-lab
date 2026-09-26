"use client";
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Play,Pause} from 'lucide-react';
import {projectImage} from './project-images';

type Project={name:string;type:string;image:string;description:string;url:string};
const stories:Record<string,{copy:string;scope:string;caseStudy?:string}>={
  kiddo:{copy:'Speak an observation. Turn it into a record that helps tell a child’s story. A practical application for the people doing the caring.',scope:'Product design / Web application',caseStudy:'kiddo'},
  'discovery-childcare':{copy:'Help families get a feel for the care, understand the programs, and take the next step. A welcoming website connected with Google Ads.',scope:'Website / Google Ads'},
  'greenjack-capital':{copy:'Make a complex offering easier to navigate. A focused digital presence for private capital advisory, with a clear path to start a conversation.',scope:'Website / Financial services'},
  'macarthur-flournoy':{copy:'Bring leadership, speaking and writing into one coherent story. A personal website that gives the person and their work room to connect.',scope:'Website / Personal brand'},
  'dolce-flowers':{copy:'Flowers for the finish line, the big day, and everything worth celebrating. A warm digital home that brings the bouquets and their occasions together.',scope:'Website / Floral brand'},
  'jimi-nu':{copy:'An artist’s world, from the first frame. Music, films, tour dates and booking come together in a cinematic experience with its own identity.',scope:'Website / Music & film'},
  'kings-river':{copy:'A digital home for James Weeks’ work, bringing spiritual readings, stories, and The King’s Circle community together.',scope:'Website / Community'},
  'blooms-botanicals':{copy:'A considered home for floral design and plant styling. The work leads; the website gives it room to be seen.',scope:'Website / Brand experience'},
  'hakuna-matata':{copy:'A first website for an established daycare. A clear introduction to its approach, so parents arrive knowing what makes it special.',scope:'Website / Bilingual content',caseStudy:'hakuna-matata'},
  'delta-personal':{copy:'A clear starting point for a nursing recruitment agency, connecting international candidates with the people who need them.',scope:'Website / Service design'},
  'precision-fabricated':{copy:'An online presence that makes manufacturing capabilities easier to understand and helps customers start the right conversation.',scope:'Website / Manufacturing'},
  'st-annis':{copy:'A welcoming place to find worship services, learn about the church, and connect with its community.',scope:'Website / Community'},
  'prisms-platters':{copy:'Food discoveries and travel stories, with a home that gives the photography and writing space to do their work.',scope:'Website / Editorial',caseStudy:'prisms-and-platters'}
};

export default function WorkGallery({projects,reduced}:{projects:Project[];reduced:boolean}){
  const [active,setActive]=useState(0);
  const touch=useRef<number|null>(null);
  const root=useRef<HTMLElement>(null);
  const playback=useRef<HTMLButtonElement>(null);
  const stage=useRef<HTMLDivElement>(null);
  const remaining=useRef(3500);
  const [hasAdvanced,setHasAdvanced]=useState(false);
  const interval=hasAdvanced?5000:3500;
  const [playing,setPlaying]=useState(true);
  const [hovered,setHovered]=useState(false);
  const [visible,setVisible]=useState(false);
  const [tabVisible,setTabVisible]=useState(true);
  const running=playing&&!hovered&&visible&&tabVisible&&!reduced;
  useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting&&entry.intersectionRatio>=.6),{threshold:.6});
    if(stage.current)observer.observe(stage.current);
    const onVisibility=()=>setTabVisible(!document.hidden);
    onVisibility();document.addEventListener('visibilitychange',onVisibility);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',onVisibility)};
  },[]);
  useEffect(()=>{remaining.current=interval},[active,interval]);
  useEffect(()=>{
    if(!running)return;
    const started=performance.now();
    const timer=setTimeout(()=>{setHasAdvanced(true);setActive(i=>(i+1)%projects.length)},remaining.current);
    return()=>{clearTimeout(timer);remaining.current=Math.max(0,remaining.current-(performance.now()-started))};
  },[running,active,interval,projects.length]);
  const hover={onPointerEnter:(e:React.PointerEvent)=>{if(e.pointerType==='mouse')setHovered(true)},onPointerLeave:()=>setHovered(false)};
  const p=projects[active],story=stories[p.image];
  const select=(n:number)=>{setPlaying(false);setHasAdvanced(true);setActive((n+projects.length)%projects.length)};
  const distance=(i:number)=>{let d=(i-active+projects.length)%projects.length;if(d>projects.length/2)d-=projects.length;return d};
  return <section ref={root} data-rotating={running} data-playing={playing&&!reduced} style={{'--project-interval':`${interval}ms`} as CSSProperties} onFocusCapture={e=>{if(e.target!==playback.current)setPlaying(false)}} id="work" className="work-section work-gallery" aria-label="Selected projects" aria-roledescription="carousel"><span id="portfolio"/>
    <div className="shell work-heading"><div><div className="eyebrow">Selected work / 01—{String(projects.length).padStart(2,'0')}</div><h2>Recent builds.</h2></div><p>Real businesses.<br/>{' '}Made to work in the real world.</p></div>
    <div className="work-composition">
      <div {...hover} className="project-story" key={p.name} aria-live={running?'off':'polite'}>
        <span className="project-kind">{p.type}</span><h3>{p.name}</h3><p>{story.copy}</p>
        <span className="project-scope">{story.scope}</span>
        <div className="project-actions"><a href={p.url} target="_blank" rel="noopener noreferrer">Explore the website <ArrowUpRight size={16}/></a>{story.caseStudy&&<a className="story-link" href={'/case-studies/'+story.caseStudy+'.html'}>Read the story</a>}</div>
      </div>
      <div ref={stage} className="project-stage" tabIndex={0} aria-label="Project previews. Use the left and right arrow keys to browse."
        onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();select(active+1)}if(e.key==='ArrowLeft'){e.preventDefault();select(active-1)}}}
        onTouchStart={e=>touch.current=e.touches[0].clientX}
        onTouchEnd={e=>{if(touch.current===null)return;const delta=e.changedTouches[0].clientX-touch.current;if(Math.abs(delta)>45)select(active+(delta<0?1:-1));touch.current=null}}>
        {projects.map((project,i)=>{const d=distance(i);return <div key={project.image} className="project-preview" data-position={Math.max(-2,Math.min(2,d))} aria-hidden={d<0||d>1} style={{visibility:Math.abs(d)>2?'hidden':undefined,zIndex:10-Math.abs(d)}}>
          {d===0?<a {...hover} className="project-screen" href={project.url} target="_blank" rel="noopener noreferrer" aria-label={'Visit '+project.name+' website (opens in a new tab)'}><img src={projectImage(project.image)} alt={project.name+' website homepage'} width={2560} height={1600}/><span className="preview-open"><ArrowUpRight size={20}/></span></a>:<button {...hover} className="project-screen" tabIndex={d===1?0:-1} onClick={()=>select(i)} aria-label={'Show '+project.name}><img src={projectImage(project.image)} alt="" width={2560} height={1600} loading="lazy"/></button>}
          <div className="screen-caption"><span>{project.name}</span><span>{project.url.replace(/^https?:\/\/(www\.)?/,'').replace(/\/$/,'')}</span></div>
        </div>})}
      </div>
    </div>
    <div {...hover} className="shell gallery-controls"><div className="gallery-count"><span>{String(active+1).padStart(2,'0')}</span><span className="count-rule"/>{String(projects.length).padStart(2,'0')}</div><div className="gallery-pagination" aria-label="Choose a project">{projects.map((project,i)=><button key={project.name} aria-label={'Select '+project.name} aria-current={i===active?'true':undefined} onClick={()=>select(i)}><span key={active}/></button>)}</div><div className="gallery-arrows"><button ref={playback} className="gallery-playback" disabled={reduced} aria-label={playing&&!reduced?'Pause automatic project rotation':'Play automatic project rotation'} title={reduced?'Automatic rotation is off with reduced motion':'First change after 3½ seconds, then every 5 seconds; browsing pauses rotation'} onClick={()=>setPlaying(p=>!p)}>{playing&&!reduced?<Pause size={16}/>:<Play size={16}/>}</button><button aria-label="Previous project" onClick={()=>select(active-1)}><ArrowLeft size={20}/></button><button aria-label="Next project" onClick={()=>select(active+1)}><ArrowRight size={20}/></button></div></div>
  </section>
}
