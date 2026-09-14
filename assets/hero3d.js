import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
const canvas=document.getElementById('gl');
if(canvas){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroEl=document.getElementById('top'), stageA=document.getElementById('stageA'), stageB=document.getElementById('stageB'), badge=document.getElementById('badge3d'), hprog=document.getElementById('hprog'), grab=document.querySelector('.grab');
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
function narrow(){return matchMedia('(max-width:940px)').matches;}
function progress(){if(!heroEl)return 0;const r=heroEl.getBoundingClientRect();const total=r.height-innerHeight;if(total<=0)return 0;return Math.min(1,Math.max(0,-r.top/total));}
let renderer,scene,camera,pole,stripeTex,raf;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
  camera=new THREE.PerspectiveCamera(38,1,0.1,100);camera.position.set(0,0,9.5);
  stripeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
    g.fillStyle='#f4efe6';g.fillRect(0,0,256,256);g.save();g.translate(128,128);g.rotate(Math.PI/4);
    const band=32;for(let x=-320;x<320;x+=band*3){g.fillStyle='#9e2b25';g.fillRect(x,-320,band,640);g.fillStyle='#243448';g.fillRect(x+band*1.5,-320,band,640);}g.restore();
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,3);t.anisotropy=4;return t;})();
  pole=new THREE.Group();
  const brass=new THREE.MeshStandardMaterial({color:0xb8902f,metalness:1,roughness:0.28});
  const core=new THREE.Mesh(new THREE.CylinderGeometry(0.92,0.92,4.2,64,1,true),new THREE.MeshStandardMaterial({map:stripeTex,roughness:0.42,metalness:0.05}));
  pole.add(core);
  const glass=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.0,4.2,64,1,true),new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:0.06,transmission:1,thickness:0.6,ior:1.45,transparent:true,opacity:.5,clearcoat:1,side:THREE.DoubleSide}));
  pole.add(glass);
  const capGeo=new THREE.CylinderGeometry(1.12,1.12,0.5,64);
  const capTop=new THREE.Mesh(capGeo,brass);capTop.position.y=2.35;pole.add(capTop);
  const capBot=new THREE.Mesh(capGeo,brass);capBot.position.y=-2.35;pole.add(capBot);
  const finGeo=new THREE.SphereGeometry(0.62,40,32);
  const finTop=new THREE.Mesh(finGeo,brass);finTop.position.y=2.85;pole.add(finTop);
  const finBot=new THREE.Mesh(finGeo,brass);finBot.position.y=-2.85;pole.add(finBot);
  const collarGeo=new THREE.TorusGeometry(1.02,0.08,16,64);
  [1.95,-1.95].forEach(y=>{const t=new THREE.Mesh(collarGeo,brass);t.rotation.x=Math.PI/2;t.position.y=y;pole.add(t);});
  pole.rotation.z=0.1;scene.add(pole);
  const shadowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const rg=g.createRadialGradient(64,64,4,64,64,64);rg.addColorStop(0,'rgba(40,28,20,.5)');rg.addColorStop(1,'rgba(40,28,20,0)');g.fillStyle=rg;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(4,2),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,opacity:.5,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-3.4;scene.add(shadow);
  const key=new THREE.SpotLight(0xffffff,160,50,0.6,0.5);key.position.set(6,9,9);scene.add(key);
  const rim=new THREE.SpotLight(0xc94b2e,90,50,0.7,0.6);rim.position.set(-8,-2,5);scene.add(rim);
  scene.add(new THREE.AmbientLight(0x4a4038,1.1));
  window.__setSceneTheme=(night)=>{renderer.toneMappingExposure=night?1.25:1.05;if(rim)rim.intensity=night?100:80;};
  window.__setSceneTheme(document.documentElement.getAttribute('data-theme')==='night');
  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  resize();addEventListener('resize',resize);
  let mx=0,my=0,tx=0,ty=0,t=0,dragAz=0,dragVel=0,dragging=false,lastX=0,didDrag=false;
  addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-0.5);my=(e.clientY/innerHeight-0.5);},{passive:true});
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;dragVel=0;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  addEventListener('pointerup',()=>{dragging=false;});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;dragVel=dx*0.006;dragAz+=dragVel;if(Math.abs(dx)>2&&!didDrag){didDrag=true;if(grab)grab.style.opacity='0';}});
  function loop(){raf=requestAnimationFrame(loop);t+=0.016;const nw=narrow();const p=progress();
    if(!reduce)stripeTex.offset.y-=0.006;
    if(!dragging){dragVel*=0.92;dragAz+=dragVel;}
    tx+=(mx*0.4-tx)*0.05;ty+=(my*0.25-ty)*0.05;
    pole.rotation.y=t*0.25+dragAz+tx*1.2;
    pole.rotation.z=0.1-ty*0.3 + p*0.12;
    const baseX=nw?0:2.6;pole.position.x=baseX;
    pole.position.y=Math.sin(t*0.6)*0.08 + p*1.2;   // gently rises on scroll
    pole.scale.setScalar((nw?0.78:1.05)*(1-0.05*p));
    shadow.position.x=pole.position.x;shadow.material.opacity=(nw?.4:.5)*(1-0.5*p);
    camera.position.z=9.5-0.6*ss(0,1,p);
    // stage cross-fade (desktop scroll story)
    const aOp=1-ss(0.05,0.28,p);
    if(stageA){stageA.style.opacity=aOp;stageA.style.transform='translateY('+(-24*ss(0.05,0.3,p))+'px)';stageA.style.pointerEvents=aOp<0.15?'none':'auto';}
    if(badge)badge.style.opacity=aOp;
    if(stageB){stageB.style.opacity=ss(0.34,0.52,p)*(1-ss(0.92,1,p));stageB.style.transform='translateY(calc(-50% + '+(22*(1-ss(0.34,0.52,p)))+'px))';}
    if(hprog)hprog.style.width=(p*100).toFixed(1)+'%';
    renderer.render(scene,camera);}
  loop();
}catch(err){console.warn('WebGL hero fallback',err);canvas.style.display='none';var fb=document.querySelector('.hero-fb');if(fb)fb.style.display='block';}
}
