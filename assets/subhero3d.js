import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
const canvas=document.getElementById('subgl');
if(canvas){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const grab=document.querySelector('.subgrab');
let renderer,scene,camera,chair,raf;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
  camera=new THREE.PerspectiveCamera(40,1,0.1,100);camera.position.set(0,0.4,11.5);
  const leather=new THREE.MeshPhysicalMaterial({color:0x8a2f27,roughness:0.48,metalness:0.05,clearcoat:0.55,clearcoatRoughness:0.4});
  const chrome=new THREE.MeshStandardMaterial({color:0xd8dde3,metalness:1,roughness:0.15});
  const dark=new THREE.MeshStandardMaterial({color:0x2a2f36,metalness:.6,roughness:.5});
  chair=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.75,0.3,40),chrome);base.position.y=-2.75;chair.add(base);
  const col=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.55,1.7,28),chrome);col.position.y=-1.78;chair.add(col);
  const hyd=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.7,20),dark);hyd.position.y=-0.78;chair.add(hyd);
  const seat=new THREE.Mesh(new THREE.BoxGeometry(2.35,0.5,2.15),leather);seat.position.y=-0.4;chair.add(seat);
  const cush=new THREE.Mesh(new THREE.BoxGeometry(2.06,0.24,1.86),leather);cush.position.y=-0.08;chair.add(cush);
  const backG=new THREE.Group();
  const back=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.5,0.44),leather);back.position.y=1.25;backG.add(back);
  const head=new THREE.Mesh(new THREE.BoxGeometry(1.05,0.62,0.42),leather);head.position.y=2.72;backG.add(head);
  backG.position.set(0,-0.15,-0.98);backG.rotation.x=-0.14;chair.add(backG);
  [-1.4,1.4].forEach(x=>{const arm=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.18,2.1),chrome);arm.position.set(x,0.24,0.05);chair.add(arm);
    const pad=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.16,1.5),leather);pad.position.set(x,0.38,0.12);chair.add(pad);});
  const foot=new THREE.Mesh(new THREE.BoxGeometry(1.75,0.14,0.55),chrome);foot.position.set(0,-1.55,1.55);chair.add(foot);
  chair.rotation.y=0.5;scene.add(chair);
  const key=new THREE.SpotLight(0xffffff,170,60,0.6,0.5);key.position.set(7,10,9);scene.add(key);
  const rim=new THREE.SpotLight(0xc94b2e,90,60,0.7,0.6);rim.position.set(-9,-2,5);scene.add(rim);
  scene.add(new THREE.AmbientLight(0x4a4038,1.05));
  window.__setSceneTheme=(night)=>{renderer.toneMappingExposure=night?1.22:1.04;if(rim)rim.intensity=night?100:82;};
  window.__setSceneTheme(document.documentElement.getAttribute('data-theme')==='night');
  function resize(){const r=canvas.getBoundingClientRect();if(r.width<2){requestAnimationFrame(resize);return;}renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
    const nw=matchMedia('(max-width:820px)').matches;chair.scale.setScalar(nw?0.6:0.78);}
  resize();addEventListener('resize',resize);
  let mx=0,my=0,tx=0,ty=0,t=0,dragAz=0,dragVel=0,dragging=false,lastX=0,didDrag=false;
  addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-0.5);my=(e.clientY/innerHeight-0.5);},{passive:true});
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;dragVel=0;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  addEventListener('pointerup',()=>{dragging=false;});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;dragVel=dx*0.006;dragAz+=dragVel;if(Math.abs(dx)>2&&!didDrag){didDrag=true;if(grab)grab.style.opacity='0';}});
  function loop(){raf=requestAnimationFrame(loop);t+=0.016;
    if(!dragging){dragVel*=0.92;dragAz+=dragVel;}
    tx+=(mx*0.3-tx)*0.05;ty+=(my*0.2-ty)*0.05;
    chair.rotation.y=(reduce?0.5:0.5+t*0.2)+dragAz+tx;chair.rotation.x=-ty*0.15;chair.position.y=0.1+Math.sin(t*0.6)*0.06;
    renderer.render(scene,camera);}
  loop();
}catch(err){console.warn('subhero WebGL fallback',err);canvas.style.display='none';}
}
