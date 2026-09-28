export type JointId = 'body_pitch' | 'neck_yaw' | 'neck_pitch' | 'head_yaw' | 'head_pitch' | 'beak' | 'wing_left' | 'wing_right';
export interface JointConfig { id: JointId; label: string; group: string; parent: JointId | 'base'; axis: 'x'|'y'|'z'; axisSign:1|-1; min: number; max: number; neutral: number; maxVelocity: number; maxAcceleration: number; mechanism: string; }
export type Pose = Record<JointId, number>;
export const JOINTS: JointConfig[] = [
 {id:'body_pitch',label:'Inclinación del cuerpo',group:'Cuerpo',parent:'base',axis:'x',axisSign:1,min:-7,max:7,neutral:0,maxVelocity:8,maxAcceleration:20,mechanism:'Basculación del tronco; transmisión pendiente'},
 {id:'neck_yaw',label:'Giro del cuello',group:'Cuello',parent:'body_pitch',axis:'y',axisSign:1,min:-35,max:35,neutral:0,maxVelocity:30,maxAcceleration:65,mechanism:'Eje de giro en la base del cuello'},
 {id:'neck_pitch',label:'Inclinación del cuello',group:'Cuello',parent:'neck_yaw',axis:'x',axisSign:1,min:-18,max:22,neutral:0,maxVelocity:22,maxAcceleration:55,mechanism:'Cuello articulado; recorrido provisional'},
 {id:'head_yaw',label:'Giro de la cabeza',group:'Cabeza',parent:'neck_pitch',axis:'y',axisSign:1,min:-30,max:30,neutral:0,maxVelocity:40,maxAcceleration:110,mechanism:'Eje de orientación de la cabeza'},
 {id:'head_pitch',label:'Inclinación de la cabeza',group:'Cabeza',parent:'head_yaw',axis:'x',axisSign:1,min:-25,max:28,neutral:0,maxVelocity:35,maxAcceleration:90,mechanism:'Eje de cabeceo'},
 {id:'beak',label:'Apertura del pico',group:'Cabeza',parent:'head_pitch',axis:'x',axisSign:1,min:0,max:24,neutral:0,maxVelocity:45,maxAcceleration:130,mechanism:'Mandíbula inferior móvil'},
 {id:'wing_left',label:'Ala izquierda',group:'Alas',parent:'body_pitch',axis:'z',axisSign:-1,min:-5,max:25,neutral:0,maxVelocity:28,maxAcceleration:75,mechanism:'Eje del ala; signo invertido en el enlace visual'},
 {id:'wing_right',label:'Ala derecha',group:'Alas',parent:'body_pitch',axis:'z',axisSign:-1,min:-25,max:5,neutral:0,maxVelocity:28,maxAcceleration:75,mechanism:'Eje del ala derecha'},
];
export const PROTOCOL_VERSION = '1.0';
export const STEP = 1/120;
export function neutralPose(joints=JOINTS): Pose { return Object.fromEntries(joints.map(j=>[j.id,j.neutral])) as Pose; }
export function finite(value: unknown): value is number { return typeof value==='number' && Number.isFinite(value); }
export function clamp(v:number,min:number,max:number){ return Math.max(min,Math.min(max,v)); }
export function validateJoints(input:unknown):JointConfig[]{
 if(!Array.isArray(input)||input.length!==JOINTS.length) throw new Error('Se necesitan las ocho articulaciones.');
 return JOINTS.map(base=>{
  const found=input.find(x=>x?.id===base.id); if(!found) throw new Error(`Falta ${base.label}.`);
  for(const k of ['min','max','neutral','maxVelocity','maxAcceleration'] as const) if(!finite(found[k])) throw new Error(`Valor inválido: ${base.label}.`);
  if(found.min<base.min||found.max>base.max||found.min>=found.max||found.neutral<found.min||found.neutral>found.max||found.maxVelocity<=0||found.maxVelocity>base.maxVelocity||found.maxAcceleration<=0||found.maxAcceleration>base.maxAcceleration) throw new Error(`Límites fuera de la envolvente provisional: ${base.label}.`);
  return {...base,min:found.min,max:found.max,neutral:found.neutral,maxVelocity:found.maxVelocity,maxAcceleration:found.maxAcceleration};
 });
}
export function validatePose(input:unknown,joints=JOINTS,partial=false):Pose {
 if(!input||typeof input!=='object'||Array.isArray(input)) throw new Error('Postura inválida.');
 const source=input as Record<string,unknown>; const pose=neutralPose(joints);
 if(Object.keys(source).some(k=>!joints.some(j=>j.id===k))) throw new Error('Articulación desconocida.');
 for(const j of joints){const v=source[j.id];if(v===undefined&&partial) continue;if(!finite(v)||v<j.min||v>j.max) throw new Error(`${j.label}: valor fuera de límites.`);pose[j.id]=v;}
 return pose;
}
