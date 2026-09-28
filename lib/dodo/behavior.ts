import {clamp, neutralPose, type Pose, type JointConfig} from './config.ts';
export interface Environment {presence:boolean;distance:number;azimuth:number;sound:number;light:number;}
export type BehaviorState='reposo'|'curiosidad'|'atención'|'sobresalto'|'recuperación';
export const DEFAULT_ENV:Environment={presence:false,distance:2,azimuth:0,sound:0,light:.65};
export function validateEnvironment(input:unknown):Partial<Environment>{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Estímulo inválido.');
 const result:Partial<Environment>={};
 const bounds={distance:[.1,5],azimuth:[-60,60],sound:[0,1],light:[0,1]};
 for(const [key,value] of Object.entries(input)){
  if(key==='presence'){if(typeof value!=='boolean')throw new Error('Presencia inválida.');result.presence=value;}
  else if(key in bounds){const [min,max]=bounds[key as keyof typeof bounds];if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw new Error(`Estímulo fuera de rango: ${key}.`);Object.assign(result,{[key]:value});}
  else throw new Error(`Estímulo desconocido: ${key}.`);
 }
 return result;
}
export function hash(seed:number,index:number){let n=(seed^Math.imul(index+1,374761393))>>>0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
export function behaviorAt(t:number,seed:number,env:Environment,startleUntil:number,recoveryUntil:number,joints:JointConfig[]):{state:BehaviorState;pose:Pose;blink:number;breath:number}{
 const pose=neutralPose(joints);const n=hash(seed,Math.floor(t/4));
 let state:BehaviorState='reposo';
 if(t<startleUntil)state='sobresalto';else if(t<recoveryUntil)state='recuperación';else if(env.light<.12)state='reposo';else if(env.presence)state=env.distance<1.4?'atención':'curiosidad';else if(env.sound>.18)state='atención';else if(n>.72)state='curiosidad';
 const breath=(Math.sin(t*1.75)+1)/2;
 pose.body_pitch=Math.sin(t*.8)*.7;
 pose.neck_yaw=(n-.5)*10;pose.head_yaw=(hash(seed+3,Math.floor(t/2.7))-.5)*7;pose.head_pitch=Math.sin(t*.9)*1.8;
 if(state==='curiosidad'){pose.neck_pitch=-5;pose.head_pitch=7;pose.head_yaw+=5;}
 if(env.presence&&(state==='atención'||state==='curiosidad')){pose.neck_yaw=env.azimuth*.48;pose.head_yaw=env.azimuth*.35;pose.head_pitch=clamp((2-env.distance)*4,-5,9);}
 if(state==='atención'&&env.sound>.18){pose.head_pitch-=5;pose.neck_pitch=-4;}
 if(state==='sobresalto'){pose.body_pitch=-4;pose.neck_pitch=-14;pose.head_pitch=12;pose.beak=12;pose.wing_left=19;pose.wing_right=-19;}
 if(state==='recuperación'){pose.neck_pitch=-3;pose.head_pitch=3;pose.beak=2;}
 if(env.light<.12){pose.head_pitch+=8;pose.neck_pitch+=4;}
 const blinkPeriod=4.2+hash(seed,77)*1.7;const phase=(t+hash(seed,91)*3)%blinkPeriod;
 const blink=phase<.22?Math.sin(phase/.22*Math.PI):0;
 for(const j of joints)pose[j.id]=clamp(pose[j.id],j.min,j.max);
 return {state,pose,blink,breath};
}
