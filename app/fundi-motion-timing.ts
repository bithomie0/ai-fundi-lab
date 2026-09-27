/** Keep wheel/page scrolls inside the hero continuous, even after a large input.
 * Navigation to another section (or back to the top) can still settle immediately.
 */
export function advanceMotionScroll(current:number,target:number,heroTop:number,runway:number,height:number,dt:number){
  const inside=(value:number)=>value>=heroTop&&value<heroTop+runway;
  const traversingHero=inside(current)&&inside(target)&&target>heroTop+1;
  if(Math.abs(target-current)>height*1.25&&!traversingHero)return target;
  return current+(target-current)*(1-Math.exp(-5*Math.min(dt,.05)));
}

/** Each particle supplies its own easing; do not ease this input a second time. */
export function heroMorph(progress:number){
  return Math.max(0,Math.min(1,(progress-.0667)/.4));
}
