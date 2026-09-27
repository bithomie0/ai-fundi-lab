/** Balanced spatial correspondence keeps nearby particles travelling together.
 * The artwork is still a raster preview; this does not create a 3D mesh. */
export function matchParticlePositions(a:Float32Array,b:Float32Array,stride=3){
  const count=a.length/stride;
  const left=Uint32Array.from({length:count},(_,i)=>i);
  const right=Uint32Array.from({length:count},(_,i)=>i);
  const match=new Uint32Array(count);
  function split(start:number,end:number,axis:number){
    if(end-start<=1){if(end>start)match[left[start]]=right[start];return}
    left.subarray(start,end).sort((i,j)=>a[i*stride+axis]-a[j*stride+axis]);
    right.subarray(start,end).sort((i,j)=>b[i*stride+axis]-b[j*stride+axis]);
    const middle=(start+end)>>>1;
    split(start,middle,1-axis);split(middle,end,1-axis);
  }
  split(0,count,1);
  return match;
}

export function smootherStep(t:number){const v=Math.max(0,Math.min(1,t));return v*v*v*(v*(v*6-15)+10)}
