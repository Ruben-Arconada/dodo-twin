import {JOINTS,neutralPose,PROTOCOL_VERSION} from './config.ts';
import {DEMO_SCENARIO,type Project} from './engine.ts';
export function defaultProject():Project{
 const neutral=neutralPose(),curious={...neutral,neck_yaw:-14,head_yaw:-8,head_pitch:8,neck_pitch:-5},listen={...neutral,neck_yaw:18,head_yaw:11,head_pitch:-8};
 return {version:PROTOCOL_VERSION,scale_m:.7,seed:42,joints:JOINTS.map(j=>({...j})),poses:[{id:'neutral',name:'Postura neutra',pose:neutral},{id:'curious',name:'Mirada curiosa',pose:curious},{id:'listen',name:'Escuchar a la derecha',pose:listen}],sequences:[{id:'hello',name:'Saludo tranquilo',frames:[{name:'Mirada curiosa',pose:curious,hold:1},{name:'Escuchar',pose:listen,hold:1},{name:'Reposo',pose:neutral,hold:1}]}],scenarios:[structuredClone(DEMO_SCENARIO)]};
}
