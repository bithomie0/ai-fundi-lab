import {CatmullRomCurve3,MathUtils,Vector3} from 'three';

export type PageRect={left:number;top:number;width:number;height:number};
export type JourneyLayout={width:number;height:number;maxScroll:number;services:PageRect|null;contact:PageRect|null};
export type JourneyLeg={kind:'services'|'contact';start:number;end:number;anchor:PageRect;curve:CatmullRomCurve3;scale:number};

/** Paths are built from reserved, measured spaces, never from text coordinates. */
export function buildJourney(layout:JourneyLayout):JourneyLeg[]{
  const {width,height,maxScroll,services,contact}=layout;
  const unit=6/height,half=width*unit/2;
  const legs:JourneyLeg[]=[];
  if(services&&services.height>0){
    const size=Math.min(services.height*.74,width*.31,190),radius=size*unit;
    legs.push({kind:'services',anchor:services,
      start:services.top+services.height/2-height*.90,
      end:services.top+services.height/2-height*.10,
      scale:size*unit/3.25,
      curve:new CatmullRomCurve3([
        new Vector3(-half-radius,0,-.25),new Vector3(-half*.48,.07,.22),
        new Vector3(half*.15,-.06,.5),new Vector3(half*.6,.04,.18),
        new Vector3(half+radius,0,-.3)
      ],false,'centripetal')});
  }
  if(contact&&contact.height>0){
    const size=Math.min(contact.width*.72,contact.height*.72,300),radius=size*unit;
    const x=(contact.left+contact.width/2-width/2)*unit;
    const start=contact.top+contact.height/2-height*.95;
    const end=Math.max(start+height*.12,Math.min(contact.top+contact.height/2-height*.52,maxScroll));
    legs.push({kind:'contact',anchor:contact,start,end,scale:size*unit/3.25,
      curve:new CatmullRomCurve3([
        new Vector3(half+radius,.12,-.35),new Vector3(x+radius*.35,.10,.12),
        new Vector3(x,0,.25)
      ],false,'centripetal')});
  }
  return legs;
}

export function activeJourney(scroll:number,legs:JourneyLeg[],viewportHeight:number):{leg:JourneyLeg;progress:number}|null{
  for(const leg of legs){
    const end=leg.kind==='contact'?leg.anchor.top+leg.anchor.height+viewportHeight*.1:leg.end;
    if(scroll>=leg.start&&scroll<=end){
      return {leg,progress:MathUtils.smootherstep(scroll,leg.start,leg.end)};
    }
  }
  return null;
}
