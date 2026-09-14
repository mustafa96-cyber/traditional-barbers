import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
const canvas=document.getElementById('subgl');
if(canvas){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const grab=document.querySelector('.subgrab');
let renderer,scene,camera,pole,stripeTex,raf;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
  camera=new THREE.PerspectiveCamera(40,1,0.1,100);camera.position.set(0,0,9.5);
  stripeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
    g.fillStyle='#f4efe6';g.fillRect(0,0,256,256);g.save();g.translate(128,128);g.rotate(Math.PI/4);
    const band=32;for(let x=-320;x<320;x+=band*3){g.fillStyle='#9e2b25';g.fillRect(x,-320,band,640);g.fillStyle='#243448';g.fillRect(x+band*1.5,-320,band,640);}g.restore();
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,3);t.anisotropy=4;return t;})();
  pole=new THREE.Group();
  const brass=new THREE.MeshStandardMaterial({color:0xb8902f,metalness:1,roughness:0.28});
  pole.add(new THREE.Mesh(new THREE.CylinderGeometry(0.92,0.92,4.2,48,1,true),new THREE.MeshStandardMaterial({map:stripeTex,roughness:0.42,metalness:0.05})));
  pole.add(new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.0,4.2,48,1,true),new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness:0.06,transmission:1,thickness:0.6,ior:1.45,transparent:true,opacity:.5,clearcoat:1,side:THREE.DoubleSide})));
  const capGeo=new THREE.CylinderGeometry(1.12,1.12,0.5,48);
  [2.35,-2.35].forEach(y=>{const m=new THREE.Mesh(capGeo,brass);m.position.y=y;pole.add(m);});
  [2.85,-2.85].forEach(y=>{const m=new THREE.Mesh(new THREE.SphereGeometry(0.62,32,24),brass);m.position.y=y;pole.add(m);});
  pole.rotation.z=0.1;scene.add(pole);
  const key=new THREE.SpotLight(0xffffff,160,50,0.6,0.5);key.position.set(6,9,9);scene.add(key);
  const rim=new THREE.SpotLight(0xc94b2e,90,50,0.7,0.6);rim.position.set(-8,-2,5);scene.add(rim);
  scene.add(new THREE.AmbientLight(0x4a4038,1.1));
  window.__setSceneTheme=(night)=>{renderer.toneMappingExposure=night?1.25:1.05;if(rim)rim.intensity=night?100:80;};
  window.__setSceneTheme(document.documentElement.getAttribute('data-theme')==='night');
  function resize(){const r=canvas.getBoundingClientRect();if(r.width<2){requestAnimationFrame(resize);return;}renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
    const nw=matchMedia('(max-width:820px)').matches;pole.scale.setScalar(nw?0.7:0.95);}
  resize();addEventListener('resize',resize);
  let mx=0,my=0,tx=0,ty=0,t=0,dragAz=0,dragVel=0,dragging=false,lastX=0,didDrag=false;
  addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-0.5);my=(e.clientY/innerHeight-0.5);},{passive:true});
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;dragVel=0;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  addEventListener('pointerup',()=>{dragging=false;});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;dragVel=dx*0.006;dragAz+=dragVel;if(Math.abs(dx)>2&&!didDrag){didDrag=true;if(grab)grab.style.opacity='0';}});
  function loop(){raf=requestAnimationFrame(loop);t+=0.016;
    if(!reduce)stripeTex.offset.y-=0.006;
    if(!dragging){dragVel*=0.92;dragAz+=dragVel;}
    tx+=(mx*0.3-tx)*0.05;ty+=(my*0.2-ty)*0.05;
    pole.rotation.y=t*0.28+dragAz+tx;pole.rotation.z=0.1-ty*0.3;pole.position.y=Math.sin(t*0.6)*0.08;
    renderer.render(scene,camera);}
  loop();
}catch(err){console.warn('subhero WebGL fallback',err);canvas.style.display='none';}
}
