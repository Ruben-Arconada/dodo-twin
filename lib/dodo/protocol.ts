import {DodoEngine,type Sequence} from './engine.ts';
import {PROTOCOL_VERSION,validatePose} from './config.ts';
import {validateEnvironment} from './behavior.ts';
export function dispatch(engine:DodoEngine,input:unknown){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Mensaje inválido.');
 const m=input as Record<string,unknown>;
 if(m.version!==PROTOCOL_VERSION||typeof m.type!=='string')throw new Error('Versión de protocolo incompatible.');
 switch(m.type){
  case 'get_state':return engine.telemetry();
  case 'set_mode':if(m.mode!=='auto'&&m.mode!=='manual')throw new Error('Modo inválido.');engine.setMode(m.mode);break;
  case 'set_pose':if(m.unit!=='deg')throw new Error('Se requieren grados (deg).');engine.setPose(validatePose(m.positions,engine.adapter.joints));break;
  case 'stimulus':engine.stimulus(validateEnvironment(m.environment));break;
  case 'touch':engine.touch();break;
  case 'pause':if(engine.status==='running')engine.pause();break;
  case 'resume':engine.resume();break;
  case 'stop':engine.stop();break;
  case 'reset':engine.reset();break;
  case 'play_sequence':engine.playSequence(m.sequence as Sequence);break;
  default:throw new Error('Orden desconocida.');
 }
 return {version:PROTOCOL_VERSION,ok:true,status:engine.status,source:'simulation',hardwareConnected:false};
}
