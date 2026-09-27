// Positions, normals, colours and weights come from the actual Blender meshes.
export const vertexShader = /* glsl */ `
attribute vec3 beePosition;
attribute vec3 beeNormal;
attribute vec3 headColor;
attribute vec3 beeColor;
attribute vec4 weightsA;
attribute vec2 weightsB;
attribute vec2 detailSeed;
uniform mat4 uBones[6];
uniform mat4 uBeeTurn;
uniform float uMorph;
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;
uniform float uDark;
varying vec3 vColor;
varying float vAlpha;
float ease(float x) { return x*x*x*(x*(x*6.0-15.0)+10.0); }
void main() {
  float seed = detailSeed.y;
  // The back and shoulders leave first; the face remains recognisable longer.
  float front = smoothstep(-0.1, 0.7, normal.z)*smoothstep(-0.15,0.18,position.y);
  float order = 0.35*seed + 0.65*max(front,detailSeed.x);
  // Keep the face last, with enough travel time to avoid a lingering mask that pops away.
  float t = ease(clamp((uMorph-order*0.48)/0.52, 0.0, 1.0));
  mat4 skin = uBones[0]*weightsA.x + uBones[1]*weightsA.y
    + uBones[2]*weightsA.z + uBones[3]*weightsA.w
    + uBones[4]*weightsB.x + uBones[5]*weightsB.y;
  vec3 target = (uBeeTurn*skin*vec4(beePosition,1.0)).xyz;
  vec3 targetNormal = normalize(mat3(uBeeTurn*skin)*beeNormal);
  vec3 p = mix(position,target,t);
  vec3 n = normalize(mix(normal,targetNormal,t)+vec3(0.00001));
  // A very small curved route prevents a rigid linear collapse, without an explosion.
  p += sin(3.14159265*t)*vec3(sin(seed*23.0)*0.065,cos(seed*31.0)*0.09,sin(seed*17.0)*0.1);
  p += n*sin(uTime*0.7+seed*6.28318)*0.001*(1.0-t)*(1.0-detailSeed.x);
  vec3 vn = normalize(normalMatrix*n);
  float faceVisibility = smoothstep(-0.08,0.28,vn.z);
  float lighting = 0.18+0.82*max(dot(vn,normalize(vec3(-0.65,0.55,1.0))),0.0);
  lighting += 0.08*pow(1.0-abs(vn.z),3.0);
  vec3 colour = mix(headColor,beeColor,t);
  float luma = dot(colour,vec3(0.2126,0.7152,0.0722));
  float shirt = mix(0.25,1.0,smoothstep(-0.22,0.16,position.y));
  float detail = mix(0.075,1.15,smoothstep(0.045,0.60,luma));
  vec3 lavender = vec3(0.90,0.84,1.0);
  vec3 portrait = lavender*detail*lighting*shirt;
  // Dark-mode particles need their own fill; mesh lights do not affect this shader.
  float beeLight = 0.60+0.40*max(dot(vn,normalize(vec3(-0.65,0.55,1.0))),0.0);
  vec3 beeTone = mix(lavender,colour,0.35)*(0.55+0.60*luma)*beeLight;
  vColor = mix(colour*lighting,min(vec3(1.0),mix(portrait,beeTone,t)),uDark);
  // Thin wings must read from both sides as the existing rig flaps.
  float wing = clamp(weightsA.z+weightsA.w+weightsB.x+weightsB.y,0.0,1.0);
  float visibility = mix(faceVisibility,max(0.4,abs(vn.z)),t*wing);
  vAlpha = visibility*mix(0.88,1.0,detailSeed.x);
  gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0);
  gl_PointSize = uPixelRatio*uSize*mix(0.95,1.12,detailSeed.x);
}
`;

export const fragmentShader = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float radius = length(gl_PointCoord-0.5)*2.0;
  float alpha = (1.0-smoothstep(0.55,1.0,radius))*vAlpha*uOpacity;
  if(alpha<0.015) discard;
  // Colours are already display-encoded; use normal alpha rather than additive glow.
  gl_FragColor = vec4(vColor,alpha);
}
`;
