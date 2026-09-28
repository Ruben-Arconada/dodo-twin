import * as THREE from 'three';
import type {TechnicalPart} from './technical-layout';

/** Concept volumes and link routes, not fabrication geometry. */
export function createTechnicalAssembly(model:{root:THREE.Group;joints:Record<string,THREE.Object3D>},items:readonly TechnicalPart[]){
 const root=new THREE.Group();root.name='Proposed hardware layout';model.root.add(root);root.visible=false;
 const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
 const pickables:THREE.Object3D[]=[],anchors:Record<string,THREE.Object3D>={};
 const groups:{part:TechnicalPart;group:THREE.Group;offset:THREE.Matrix4;materials:THREE.MeshStandardMaterial[]}[]=[];
 const material=(color:number,metalness=.45,roughness=.38)=>{const m=new THREE.MeshStandardMaterial({color,metalness,roughness});materials.add(m);return m;};
 const steel=material(0x8aa6b5,.7),dark=material(0x263e48),black=material(0x16252c),copper=material(0xe4b775),red=material(0xe97866);
 const box=(parent:THREE.Object3D,size:number[],pos:number[],mat:THREE.Material,id?:string)=>{const geo=new THREE.BoxGeometry(...size as [number,number,number]);geometries.add(geo);const mesh=new THREE.Mesh(geo,mat);mesh.position.set(...pos as [number,number,number]);mesh.castShadow=true;parent.add(mesh);if(id){mesh.userData.partId=id;pickables.push(mesh);}return mesh;};
 const cylinder=(parent:THREE.Object3D,r:number,h:number,pos:number[],mat:THREE.Material,axis='y',id?:string)=>{const geo=new THREE.CylinderGeometry(r,r,h,20);geometries.add(geo);const mesh=new THREE.Mesh(geo,mat);mesh.position.set(...pos as [number,number,number]);if(axis==='x')mesh.rotation.z=Math.PI/2;if(axis==='z')mesh.rotation.x=Math.PI/2;parent.add(mesh);if(id){mesh.userData.partId=id;pickables.push(mesh);}return mesh;};
 const base=new THREE.Group();root.add(base);
 box(base,[.54,.014,.40],[0,-.18,0],dark);
 for(const x of [-.265,.265])for(const z of [-.195,.195])box(base,[.012,.16,.012],[x,-.10,z],steel);
 for(const y of [-.17,-.02]){for(const x of [-.265,.265])box(base,[.012,.012,.40],[x,y,0],steel);for(const z of [-.195,.195])box(base,[.54,.012,.012],[0,y,z],steel);}
 for(let i=0;i<9;i++)box(base,[.003,.065,.008],[-.21+i*.026,-.13,-.19],steel);
 const structure=new THREE.Group();root.add(structure);
 // Fixed load path from the deeper service base to the pelvis, through anchored legs.
 for(const x of [-.061,.061]){cylinder(structure,.008,.395,[x,.025,-.035],steel);box(structure,[.046,.014,.065],[x,-.155,-.035],steel);}
 box(structure,[.18,.017,.055],[0,.22,-.035],steel);
 const colors={motor:0xe9ad50,control:0x58c9d1,power:0xe78a73,sensor:0xb395e5};
 for(const part of items){
  const group=new THREE.Group();group.name=part.name;group.matrixAutoUpdate=false;root.add(group);anchors[part.id]=group;
  const mat=material(colors[part.category],part.category==='motor'?.6:.3);const mats=[mat];
  const [w,h,d]=part.size;
  if(part.id==='ventuno'){
   box(group,[w,.003,d],[0,-h*.32,0],mat,part.id);
   for(const x of [-w*.43,w*.43])for(const z of [-d*.4,d*.4])cylinder(group,.003,.018,[x,-h*.32-.01,z],copper,'y',part.id);
   box(group,[.058,.024,.058],[.012,.002,0],black,part.id);
   for(let i=0;i<8;i++)box(group,[.055,.021,.002],[.012,.015,-.024+i*.007],steel,part.id);
   cylinder(group,.022,.006,[.012,.029,0],black,'y',part.id);
   for(let i=0;i<5;i++){const blade=box(group,[.032,.002,.006],[.012,.033,0],steel,part.id);blade.rotation.y=i*Math.PI/5;}
   box(group,[.018,.014,.017],[-w/2+.005,-.008,d*.23],steel,part.id);
   box(group,[.018,.012,.026],[-w/2+.005,-.009,-d*.26],steel,part.id);
   for(let i=0;i<8;i++)box(group,[.005,.009,.006],[w*.32,-.01,-.031+i*.009],black,part.id);
  }else if(part.category==='motor'){
   box(group,[w,h,d],[0,0,0],mat,part.id);
   box(group,[w*1.22,h*.14,d*1.16],[0,-h*.32,0],black,part.id);
   const axis=part.axis||'x';const shaftPos=[0,0,0];shaftPos[axis==='x'?0:axis==='y'?1:2]=(axis==='x'?w:axis==='y'?h:d)*.56;
   cylinder(group,Math.min(w,d)*.24,.016,shaftPos,steel,axis,part.id);
   for(const x of [-w*.34,w*.34])for(const z of [-d*.34,d*.34])cylinder(group,.002,.003,[x,h*.51,z],steel,'y',part.id);
  }else if(part.id==='estop'){
   box(group,[w,h*.5,d],[0,-h*.15,0],black,part.id);cylinder(group,w*.45,h*.35,[0,h*.2,0],red,'y',part.id);
  }else if(part.id==='perception'){
   box(group,[w,h,d],[0,0,0],mat,part.id);for(const x of [-w*.25,w*.25])cylinder(group,h*.24,.005,[x,0,d*.6],black,'z',part.id);
  }else{
   box(group,[w,h,d],[0,0,0],mat,part.id);
   for(let i=0;i<4;i++)box(group,[w*.12,h*.25,d*.2],[-w*.3+i*w*.2,h*.56,0],black,part.id);
  }
  groups.push({part,group,offset:new THREE.Matrix4().makeTranslation(...part.offset),materials:mats});
 }
 const up=new THREE.Vector3(0,1,0),from=new THREE.Vector3(),to=new THREE.Vector3(),delta=new THREE.Vector3(),inverse=new THREE.Matrix4();
 const rodLinks=[['body_pitch','neck_yaw'],['neck_pitch','head_yaw'],['body_pitch','wing_left'],['body_pitch','wing_right'],['head_pitch','beak']];
 const rods=rodLinks.map(([a,b])=>{const mesh=cylinder(structure,.006,1,[0,0,0],steel);return {a,b,mesh};});
 const wiring=new THREE.Group();root.add(wiring);
 const routeItems=items.filter(p=>p.id!=='ventuno');
 const routes=routeItems.map(part=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(18),3));geometries.add(geo);const mat=new THREE.LineBasicMaterial({color:part.category==='motor'||part.category==='power'?0xe9ad50:0x71d9e4,transparent:true,opacity:.8,depthTest:false});materials.add(mat);const line=new THREE.Line(geo,mat);line.renderOrder=4;wiring.add(line);return {part,line};});
 const temp=new THREE.Matrix4(),point=new THREE.Vector3(),source=new THREE.Vector3();
 function update(options:{visible:boolean;selected:string;showWiring:boolean;showStructure:boolean}){
  root.visible=options.visible;if(!options.visible)return;
  inverse.copy(model.root.matrixWorld).invert();
  for(const item of groups){const parent=item.part.parent==='base'?model.root:model.joints[item.part.parent];if(!parent)continue;temp.multiplyMatrices(inverse,parent.matrixWorld);item.group.matrix.multiplyMatrices(temp,item.offset);for(const mat of item.materials){mat.emissive.setHex(item.part.id===options.selected?colors[item.part.category]:0x000000);mat.emissiveIntensity=item.part.id===options.selected?.42:0;}}
  root.updateMatrixWorld(true);structure.visible=options.showStructure;wiring.visible=options.showWiring;
  for(const rod of rods){const a=model.joints[rod.a],b=model.joints[rod.b];if(!a||!b)continue;a.getWorldPosition(from).applyMatrix4(inverse);b.getWorldPosition(to).applyMatrix4(inverse);delta.copy(to).sub(from);rod.mesh.position.copy(from).add(to).multiplyScalar(.5);rod.mesh.scale.y=delta.length();rod.mesh.quaternion.setFromUnitVectors(up,delta.normalize());}
  if(options.showWiring)for(const route of routes){const sourceId=route.part.category==='motor'?'drivers':route.part.id==='drivers'?'ventuno':'power';(anchors[sourceId]||anchors.ventuno).getWorldPosition(source).applyMatrix4(inverse);anchors[route.part.id].getWorldPosition(point).applyMatrix4(inverse);const a=route.line.geometry.getAttribute('position') as THREE.BufferAttribute;a.setXYZ(0,source.x,source.y,source.z);a.setXYZ(1,source.x,-.04,-.035);a.setXYZ(2,0,-.04,-.035);a.setXYZ(3,0,Math.max(-.04,point.y-.04),-.035);a.setXYZ(4,point.x,point.y,-.035);a.setXYZ(5,point.x,point.y,point.z);a.needsUpdate=true;route.line.geometry.computeBoundingSphere();}
 }
 function dispose(){root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 return {root,pickables,anchors,update,dispose};
}
