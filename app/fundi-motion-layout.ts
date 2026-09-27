/** Preserve the visible content when motion changes the hero's scroll distance. */
export function setMotionLayout(state:'loading'|'ready'|null){
  const root=document.documentElement;
  if((root.dataset.fundiMotion??null)===state)return;
  const hero=document.querySelector<HTMLElement>('.hero-runway');
  const before=hero?.getBoundingClientRect();
  const previousHeight=hero?.offsetHeight??0;
  const pageTop=before?before.top+window.scrollY:0;
  if(state)root.dataset.fundiMotion=state;else delete root.dataset.fundiMotion;
  if(hero&&before){
    const change=hero.offsetHeight-previousHeight;
    if(change&&before.bottom<=0){
      window.scrollBy({top:change,behavior:'instant'});
    }else if(change<0&&window.scrollY>pageTop){
      window.scrollTo({top:pageTop,behavior:'instant'});
    }
  }
  // A delayed model load/failure changes every later section's scroll position.
  // Let existing scroll controllers remeasure instead of retaining the 3D runway.
  window.dispatchEvent(new Event('fundi-layout-change'));
}
