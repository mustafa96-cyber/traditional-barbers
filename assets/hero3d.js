import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
const canvas=document.getElementById('gl');
if(canvas){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroEl=document.getElementById('top'), stageA=document.getElementById('stageA'), stageB=document.getElementById('stageB'), badge=document.getElementById('badge3d'), hprog=document.getElementById('hprog'), grab=document.querySelector('.grab');
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
function narrow(){return matchMedia('(max-width:940px)').matches;}
function progress(){if(!heroEl)return 0;const r=heroEl.getBoundingClientRect();const total=r.height-innerHeight;if(total<=0)return 0;return Math.min(1,Math.max(0,-r.top/total));}
let renderer,scene,camera,chair,raf;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
  camera=new THREE.PerspectiveCamera(38,1,0.1,100);camera.position.set(0,0.4,11);
  const leather=new THREE.MeshPhysicalMaterial({color:0x8a2f27,roughness:0.48,metalness:0.05,clearcoat:0.55,clearcoatRoughness:0.4});
  const chrome=new THREE.MeshStandardMaterial({color:0xd8dde3,metalness:1,roughness:0.15});
  const dark=new THREE.MeshStandardMaterial({color:0x2a2f36,metalness:.6,roughness:.5});
  chair=new THREE.Group();
  // base + column
  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.75,0.3,48),chrome);base.position.y=-2.75;chair.add(base);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.1,0.09,16,48),chrome);ring.rotation.x=Math.PI/2;ring.position.y=-2.4;chair.add(ring);
  const col=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.55,1.7,32),chrome);col.position.y=-1.78;chair.add(col);
  const hyd=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.7,24),dark);hyd.position.y=-0.78;chair.add(hyd);
  // seat
  const seat=new THREE.Mesh(new THREE.BoxGeometry(2.35,0.5,2.15),leather);seat.position.y=-0.4;chair.add(seat);
  const cush=new THREE.Mesh(new THREE.BoxGeometry(2.06,0.24,1.86),leather);cush.position.y=-0.08;chair.add(cush);
  const seam=new THREE.Mesh(new THREE.BoxGeometry(2.06,0.02,0.04),dark);seam.position.set(0,0.06,0);chair.add(seam);
  // backrest (tilted)
  const backG=new THREE.Group();
  const back=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.5,0.44),leather);back.position.y=1.25;backG.add(back);
  const backc=new THREE.Mesh(new THREE.BoxGeometry(1.9,2.2,0.2),leather);backc.position.set(0,1.25,0.28);backG.add(backc);
  const head=new THREE.Mesh(new THREE.BoxGeometry(1.05,0.62,0.42),leather);head.position.y=2.72;backG.add(head);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.35,16),chrome);neck.position.y=2.4;backG.add(neck);
  backG.position.set(0,-0.15,-0.98);backG.rotation.x=-0.14;chair.add(backG);
  // armrests
  [-1.4,1.4].forEach(x=>{
    const arm=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.18,2.1),chrome);arm.position.set(x,0.24,0.05);chair.add(arm);
    const pad=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.16,1.5),leather);pad.position.set(x,0.38,0.12);chair.add(pad);
    const post=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.6,16),chrome);post.position.set(x,-0.1,0.7);chair.add(post);
    const post2=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.6,16),chrome);post2.position.set(x,-0.1,-0.55);chair.add(post2);
  });
  // footrest
  const foot=new THREE.Mesh(new THREE.BoxGeometry(1.75,0.14,0.55),chrome);foot.position.set(0,-1.55,1.55);chair.add(foot);
  const grooves=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.16,0.06),dark);grooves.position.set(0,-1.47,1.75);chair.add(grooves);
  const fbar=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,1.7,16),chrome);fbar.rotation.z=Math.PI/2;fbar.position.set(0,-1.38,1.55);chair.add(fbar);
  chair.rotation.y=0.5;scene.add(chair);
  // contact shadow
  const shadowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const rg=g.createRadialGradient(64,64,4,64,64,64);rg.addColorStop(0,'rgba(40,28,20,.55)');rg.addColorStop(1,'rgba(40,28,20,0)');g.fillStyle=rg;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(6,4),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,opacity:.5,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-3.0;scene.add(shadow);
  const key=new THREE.SpotLight(0xffffff,170,60,0.6,0.5);key.position.set(7,10,9);scene.add(key);
  const rim=new THREE.SpotLight(0xc94b2e,90,60,0.7,0.6);rim.position.set(-9,-2,5);scene.add(rim);
  scene.add(new THREE.AmbientLight(0x4a4038,1.05));
  window.__setSceneTheme=(night)=>{renderer.toneMappingExposure=night?1.22:1.04;if(rim)rim.intensity=night?100:82;};
  window.__setSceneTheme(document.documentElement.getAttribute('data-theme')==='night');
  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  resize();addEventListener('resize',resize);
  let mx=0,my=0,tx=0,ty=0,t=0,dragAz=0,dragVel=0,dragging=false,lastX=0,didDrag=false;
  addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-0.5);my=(e.clientY/innerHeight-0.5);},{passive:true});
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;dragVel=0;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  addEventListener('pointerup',()=>{dragging=false;});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;dragVel=dx*0.006;dragAz+=dragVel;if(Math.abs(dx)>2&&!didDrag){didDrag=true;if(grab)grab.style.opacity='0';}});
  function loop(){raf=requestAnimationFrame(loop);t+=0.016;const nw=narrow();const p=progress();
    if(!dragging){dragVel*=0.92;dragAz+=dragVel;}
    tx+=(mx*0.4-tx)*0.05;ty+=(my*0.2-ty)*0.05;
    chair.rotation.y=(reduce?0.5:0.5+t*0.18)+dragAz+tx*0.8;
    chair.rotation.x=-ty*0.15;
    const baseX=nw?0:2.5;chair.position.x=baseX;
    chair.position.y=(nw?-0.2:0.1)+Math.sin(t*0.6)*0.06;
    chair.scale.setScalar((nw?0.62:0.82)*(1-0.04*p));
    shadow.position.x=chair.position.x;shadow.material.opacity=(nw?.35:.5)*(1-0.4*p);
    camera.position.z=11-0.8*ss(0,1,p);camera.position.y=0.4+0.2*p;
    const aOp=1-ss(0.06,0.24,p);
    if(stageA){stageA.style.opacity=aOp;stageA.style.transform='translateY('+(-20*ss(0.05,0.26,p))+'px)';stageA.style.pointerEvents=aOp<0.15?'none':'auto';}
    if(badge)badge.style.opacity=aOp;
    if(stageB){stageB.style.opacity=ss(0.14,0.32,p)*(1-ss(0.92,1,p));stageB.style.transform='translateY(calc(-50% + '+(22*(1-ss(0.34,0.52,p)))+'px))';}
    if(hprog)hprog.style.width=(p*100).toFixed(1)+'%';
    renderer.render(scene,camera);}
  loop();
}catch(err){console.warn('WebGL hero fallback',err);canvas.style.display='none';var fb=document.querySelector('.hero-fb');if(fb)fb.style.display='block';}
}
