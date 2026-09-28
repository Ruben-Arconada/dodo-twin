import type {DodoEngine} from './engine';
import {validateEnvironment} from './behavior';
export function registerDodoTools(engine:DodoEngine,onChange:()=>void){
 type Tool={name:string;title:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown};
 const context=(document as Document & {modelContext?:{registerTool:(t:Tool,o:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
 if(!context?.registerTool)return()=>{};const lifecycle=new AbortController();
 const tools:Tool[]=[
  {name:'dodo_read_simulation',title:'Leer simulación del dodo',description:'Lee posiciones simuladas y consignas. No hay hardware conectado.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({...engine.telemetry(),status:engine.status,behavior:engine.state})},
  {name:'dodo_set_environment',title:'Cambiar entorno simulado',description:'Configura estímulos virtuales usando los mismos controles del panel Entorno.',inputSchema:{type:'object',properties:{presence:{type:'boolean'},distance:{type:'number',minimum:.1,maximum:5},azimuth:{type:'number',minimum:-60,maximum:60},sound:{type:'number',minimum:0,maximum:1},light:{type:'number',minimum:0,maximum:1}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{engine.stimulus(validateEnvironment(input));onChange();return {environment:engine.environment,source:'simulation'}}},
  {name:'dodo_stop_simulation',title:'Parar simulación',description:'Detiene la simulación virtual y retiene la posición. No controla un robot físico.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:()=>{engine.stop();onChange();return{status:engine.status,pose:engine.adapter.pose()}}},
 ];
 for(const tool of tools)try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
 return()=>lifecycle.abort();
}
