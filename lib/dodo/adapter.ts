import { JOINTS, PROTOCOL_VERSION, clamp, type JointConfig, type Pose } from './config.ts';
export interface JointState {position:number;velocity:number;target:number;}
export interface Telemetry {version:string;source:'simulation';time_s:number;positionUnit:'deg';velocityUnit:'deg/s';commanded:Pose;simulated:Pose;measured:null;connected:false;}
export class SimulatedAdapter {
 joints: JointConfig[]; state:Record<string,JointState>;
 constructor(joints=JOINTS){this.joints=joints.map(j=>({...j}));this.state=Object.fromEntries(joints.map(j=>[j.id,{position:j.neutral,velocity:0,target:j.neutral}]))}
 command(pose:Pose){for(const j of this.joints)this.state[j.id].target=clamp(pose[j.id],j.min,j.max);}
 hold(){for(const j of this.joints){const s=this.state[j.id];s.target=s.position;s.velocity=0;}}
 advance(dt:number){
  for(const j of this.joints){
   const s=this.state[j.id],d=s.target-s.position,a=j.maxAcceleration;
   const speed=Math.max(0,Math.sqrt(2*a*Math.abs(d)+(a*dt)**2)-a*dt);
   const desired=Math.sign(d)*Math.min(j.maxVelocity,speed);
   s.velocity+=clamp(desired-s.velocity,-a*dt,a*dt);
   let next=s.position+s.velocity*dt;
   if(Math.abs(d)<1e-10&&Math.abs(s.velocity)<=a*dt&&Math.abs(d)/dt<=j.maxVelocity){next=s.target;s.velocity=d/dt;}
   if(next<j.min||next>j.max){next=clamp(next,j.min,j.max);s.velocity=(next-s.position)/dt;}
   s.position=next;
   if(!Number.isFinite(next))throw new Error('Estado de simulación inválido.');
  }
 }
 settled(){return this.joints.every(j=>Math.abs(this.state[j.id].position-this.state[j.id].target)<1e-9&&Math.abs(this.state[j.id].velocity)<1e-8)}
 pose():Pose {return Object.fromEntries(this.joints.map(j=>[j.id,this.state[j.id].position])) as Pose}
 targets():Pose{return Object.fromEntries(this.joints.map(j=>[j.id,this.state[j.id].target])) as Pose}
 telemetry(time_s:number):Telemetry{return {version:PROTOCOL_VERSION,source:'simulation',time_s,positionUnit:'deg',velocityUnit:'deg/s',commanded:this.targets(),simulated:this.pose(),measured:null,connected:false}}
 reset(){this.state=Object.fromEntries(this.joints.map(j=>[j.id,{position:j.neutral,velocity:0,target:j.neutral}]))}
}
export class PhysicalAdapter {
 readonly connected=false;
 connect():never {throw new Error('Conexión física pendiente de implementar y validar con VENTUNO Q.');}
}
