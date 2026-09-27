import discovery from './assets/projects/discovery-childcare.jpg';
import greenjack from './assets/projects/greenjack-capital.jpg';
import macarthur from './assets/projects/macarthur-flournoy.jpg';
import dolce from './assets/projects/dolce-flowers.jpg';
import jimi from './assets/projects/jimi-nu.jpg';

// Next returns image metadata; Vite returns a URL. Both publish fingerprinted assets.
const url=(image:string|{src:string})=>typeof image==='string'?image:image.src;
const bundled:Record<string,string>={
  'discovery-childcare':url(discovery),
  'greenjack-capital':url(greenjack),
  'macarthur-flournoy':url(macarthur),
  'dolce-flowers':url(dolce),
  'jimi-nu':url(jimi),
};
export const projectImage=(key:string)=>bundled[key]??`/portfolio/${key}.jpg`;
