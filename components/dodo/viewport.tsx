import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {createDodo} from '@/lib/dodo/model';
import {createTechnicalAssembly} from '@/lib/dodo/technical-model';
import {TECHNICAL_PARTS,PART_CATEGORIES,type TechnicalViewOptions} from '@/lib/dodo/technical-layout';
import {JOINTS,type JointId} from '@/lib/dodo/config';
import type {DodoEngine} from '@/lib/dodo/engine';
export interface SceneSettings {
 background:'studio'|'night'|'white';light:number;skeleton:boolean;
 camera:'threequarter'|'front'|'side';cameraRevision:number;focusRevision:number;
 frame:'free'|'landscape'|'portrait';technical?:TechnicalViewOptions;
}
export default function Viewport({engine,settings,onStats,onCanvas,onSelectPart}:{engine:DodoEngine;settings:SceneSettings;onStats:(fps:number)=>void;onCanvas:(canvas:HTMLCanvasElement|null)=>void;onSelectPart?:(id:string)=>void}){
 const mount=useRef<HTMLDivElement>(null),current=useRef(settings);current.current=settings;
 const callbacks=useRef({onStats,onCanvas,onSelectPart});callbacks.current={onStats,onCanvas,onSelectPart};
 const [error,setError]=useState('');
 useEffect(()=>{
  const element=mount.current;if(!element)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});}
  catch{setError('Este navegador no ha podido iniciar el visor 3D. Activa WebGL o abre la aplicación en un navegador compatible.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  element.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Dodo 3D articulado. Arrastra para girar; usa la rueda o dos dedos para acercar.');renderer.domElement.setAttribute('role','img');callbacks.current.onCanvas(renderer.domElement);
  const scene=new THREE.Scene();scene.background=new THREE.Color('#dce2e3');scene.fog=new THREE.Fog('#dce2e3',3,8);
  const camera=new THREE.PerspectiveCamera(35,1,.01,20);camera.position.set(1.1,.72,1.4);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.34,.04);controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=.55;controls.maxDistance=3;controls.maxPolarAngle=Math.PI*.49;controls.enablePan=true;
  const hemi=new THREE.HemisphereLight(0xe3efff,0x6b6251,2.2);scene.add(hemi);
  const key=new THREE.DirectionalLight(0xffedcf,4);key.position.set(-1.3,2,1.3);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-1;key.shadow.camera.right=1;key.shadow.camera.top=1;key.shadow.camera.bottom=-1;key.shadow.normalBias=.002;key.shadow.bias=-.0002;scene.add(key);
  const rim=new THREE.DirectionalLight(0xccdfff,3);rim.position.set(1,1,-1);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(0,.4,2);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xc8cfd0,roughness:.96}));floor.rotation.x=-Math.PI/2;floor.position.y=-.032;floor.receiveShadow=true;scene.add(floor);
  const plinth=new THREE.Mesh(new THREE.CylinderGeometry(.33,.345,.028,96),new THREE.MeshStandardMaterial({color:0x354044,roughness:.68,metalness:.1}));plinth.position.y=-.016;plinth.receiveShadow=true;plinth.castShadow=true;scene.add(plinth);
  const grid=new THREE.GridHelper(2,40,0x8d9c9f,0xaab6b8);grid.position.y=-.031;const gm=grid.material as THREE.Material;gm.transparent=true;gm.opacity=.35;scene.add(grid);
  const model=createDodo();scene.add(model.root);
  if(import.meta.env.DEV)Object.assign(window,{__dodo:{THREE,model,scene,camera,controls,renderer}});
  const skin: {mesh:THREE.Mesh;material:THREE.Material|THREE.Material[];ghost:THREE.Material|THREE.Material[];shadow:boolean}[]=[];
  const ghostMaterials=new Map<THREE.Material,THREE.Material>();
  const ghost=(original:THREE.Material)=>{let material=ghostMaterials.get(original);if(!material){const m=original.clone() as THREE.MeshStandardMaterial;m.transparent=true;m.opacity=.085;m.depthWrite=false;m.color?.set('#9bccd3');m.wireframe=false;material=m;ghostMaterials.set(original,m);}return material;};
  model.root.traverse(node=>{if(node instanceof THREE.Mesh){skin.push({mesh:node,material:node.material,ghost:Array.isArray(node.material)?node.material.map(ghost):ghost(node.material),shadow:node.castShadow});}});
  const assembly=createTechnicalAssembly(model,TECHNICAL_PARTS);
  const rest:Partial<Record<JointId,THREE.Euler>>={};for(const j of JOINTS)if(model.joints[j.id])rest[j.id]=model.joints[j.id].rotation.clone();
  const labels=document.createElement('div');labels.className='technical-annotations';labels.setAttribute('aria-label','Componentes en el modelo 3D');element.appendChild(labels);
  const leaders=document.createElementNS('http://www.w3.org/2000/svg','svg');leaders.classList.add('technical-leaders');labels.appendChild(leaders);
  const markers=TECHNICAL_PARTS.map(part=>{const button=document.createElement('button');button.type='button';button.className='technical-marker';button.textContent=part.code;button.title=part.name;button.setAttribute('aria-label',`Seleccionar ${part.code}: ${part.name}`);button.style.setProperty('--marker-color',PART_CATEGORIES[part.category].color);button.addEventListener('click',()=>callbacks.current.onSelectPart?.(part.id));labels.appendChild(button);const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('stroke',PART_CATEGORIES[part.category].color);line.setAttribute('stroke-width','1');leaders.appendChild(line);return {part,button,line};});
  const pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster();let downX=0,downY=0;
  const pointerDown=(event:PointerEvent)=>{downX=event.clientX;downY=event.clientY;};
  const pointerUp=(event:PointerEvent)=>{if(!current.current.technical||Math.hypot(event.clientX-downX,event.clientY-downY)>5)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(assembly.pickables,false)[0];if(hit?.object.userData.partId)callbacks.current.onSelectPart?.(hit.object.userData.partId);};
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
  const listener=()=>{let w=element.clientWidth,h=element.clientHeight;const ratio=current.current.frame==='portrait'?9/16:current.current.frame==='landscape'?16/9:0;if(ratio){if(w/h>ratio)w=h*ratio;else h=w/ratio;}if(w&&h){camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}};const resize=new ResizeObserver(listener);resize.observe(element);listener();
  const projected=new THREE.Vector3(),focusPoint=new THREE.Vector3(),direction=new THREE.Vector3();
  let frame=0,frames=0,report=performance.now(),lastCamera=-1,lastFocus=settings.focusRevision,lastFrame=current.current.frame,dead=false,lastTechnical=false,lastExterior=true,lastLabels=0;
  const animate=(now:number)=>{
   if(dead)return;const state=engine.snapshot(),set=current.current,tech=set.technical;
   if(lastFrame!==set.frame){lastFrame=set.frame;listener();}model.skeleton.visible=!tech&&set.skeleton;
   for(const j of JOINTS){const node=model.joints[j.id],base=rest[j.id];if(node&&base){node.rotation.copy(base);node.rotation[j.axis]+=THREE.MathUtils.degToRad(state.pose[j.id])*j.axisSign;}}
   model.updateVisuals?.({blink:state.blink,breath:state.breath});
   if(!!tech!==lastTechnical||!!tech?.exterior!==lastExterior){for(const item of skin){item.mesh.material=tech?item.ghost:item.material;item.mesh.visible=tech?tech.exterior:true;item.mesh.castShadow=tech?false:item.shadow;}lastTechnical=!!tech;lastExterior=!!tech?.exterior;}
   // Material switching follows updateVisuals, which also updates a few lid meshes.
   if(tech&&!tech.exterior)for(const item of skin)item.mesh.visible=false;
   model.root.updateMatrixWorld(true);
   assembly.update({visible:!!tech,selected:tech?.selected||'',showWiring:tech?.wiring??false,showStructure:tech?.structure??false});
   if(set.cameraRevision!==lastCamera){lastCamera=set.cameraRevision;const p=set.camera==='front'?[0,.53,tech?2.05:1.7]:set.camera==='side'?[tech?1.95:1.6,.53,.02]:tech?[1.25,.8,1.65]:[1.1,.72,1.4];camera.position.set(...p as [number,number,number]);controls.target.set(0,tech ? .23 : .34,.04);}
   if(set.focusRevision!==lastFocus){lastFocus=set.focusRevision;if(tech&&assembly.anchors[tech.selected]){assembly.anchors[tech.selected].getWorldPosition(focusPoint);direction.copy(camera.position).sub(controls.target).normalize().multiplyScalar(tech.selected==='ventuno'||tech.selected==='drivers' ? .53 : .34);camera.position.copy(focusPoint).add(direction);controls.target.copy(focusPoint);}}
   controls.minDistance=tech ? .12 : .55;
   const dark=!!tech||set.background==='night',white=!tech&&set.background==='white';const bg=tech?0x10212a:dark?0x151b20:white?0xf2f2ee:0xdce2e3;scene.background=new THREE.Color(bg);(scene.fog as THREE.Fog).color.setHex(bg);(floor.material as THREE.MeshStandardMaterial).color.setHex(tech?0x172e38:dark?0x1c242b:white?0xe5e6e1:0xc8cfd0);grid.visible=!!tech||(!white&&!dark);grid.position.y=tech?-.188:-.031;floor.position.y=tech?-.19:-.032;plinth.visible=!tech;
   key.intensity=set.light*4;hemi.intensity=tech?2.4:dark?1.2:2.2;controls.update();renderer.render(scene,camera);
   labels.hidden=!tech||!tech.labels;
   if(tech?.labels&&now-lastLabels>70){lastLabels=now;const w=element.clientWidth,h=element.clientHeight;const occupied:{x:number;y:number}[]=[];const sorted=[...markers].sort((a,b)=>Number(b.part.id===tech.selected)-Number(a.part.id===tech.selected));for(const marker of sorted){const anchor=assembly.anchors[marker.part.id];if(!anchor)continue;anchor.getWorldPosition(projected);projected.project(camera);const visible=projected.z>=-1&&projected.z<=1&&Math.abs(projected.x)<1.1&&Math.abs(projected.y)<1.1;marker.button.hidden=!visible;marker.line.style.display=visible?'':'none';if(!visible)continue;const ax=(projected.x+1)*w/2,ay=(1-projected.y)*h/2;let x=Math.max(23,Math.min(w-23,ax)),y=Math.max(20,Math.min(h-22,ay));const candidates=[[0,0],[-45,0],[45,0],[-68,-28],[68,-28],[-90,0],[90,0],[-48,30],[48,30],[0,-32],[0,32],[-80,58],[80,58]];for(const [dx,dy] of candidates){const cx=Math.max(23,Math.min(w-23,ax+dx)),cy=Math.max(20,Math.min(h-22,ay+dy));if(!occupied.some(p=>Math.abs(p.x-cx)<42&&Math.abs(p.y-cy)<27)){x=cx;y=cy;break;}}occupied.push({x,y});marker.line.setAttribute('x1',String(ax));marker.line.setAttribute('y1',String(ay));marker.line.setAttribute('x2',String(x));marker.line.setAttribute('y2',String(y));marker.button.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;marker.button.setAttribute('aria-pressed',String(marker.part.id===tech.selected));}}
   frames++;if(now-report>1000){callbacks.current.onStats(Math.round(frames*1000/(now-report)));report=now;frames=0;}frame=requestAnimationFrame(animate);
  };frame=requestAnimationFrame(animate);
  return()=>{
   dead=true;cancelAnimationFrame(frame);resize.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);callbacks.current.onCanvas(null);labels.remove();assembly.dispose();
   for(const item of skin)item.mesh.material=item.material;ghostMaterials.forEach(m=>m.dispose());model.dispose();
   scene.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(m=>{for(const value of Object.values(m))if(value instanceof THREE.Texture)value.dispose();m.dispose();});}});grid.geometry.dispose();gm.dispose();renderer.dispose();renderer.domElement.remove();
  };
 },[engine]);
 return <div className="viewport-mount" ref={mount}>{error&&<div role="alert" className="webgl-error">{error}</div>}</div>;
}
