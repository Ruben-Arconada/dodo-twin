import type {CSSProperties} from 'react';
import {Box, Cpu, Download, Focus, SlidersHorizontal} from 'lucide-react';
import {Switch} from '@/components/ui/switch';
import {Slider} from '@/components/ui/slider';
import {PART_CATEGORIES,TECHNICAL_PARTS,type TechnicalViewOptions} from '@/lib/dodo/technical-layout';
import type {DodoEngine,Snapshot} from '@/lib/dodo/engine';
import {downloadJson,type Act} from './panels';
import {docUrl} from '@/lib/dodo/links';

export default function TechnicalPanel({options,onChange,engine,snap,act,onFocus,onControl}:{options:TechnicalViewOptions;onChange:(patch:Partial<TechnicalViewOptions>)=>void;engine:DodoEngine;snap:Snapshot;act:Act;onFocus:()=>void;onControl:()=>void}){
 const selected=TECHNICAL_PARTS.find(p=>p.id===options.selected)||TECHNICAL_PARTS[0];
 const joint=engine.adapter.joints.find(j=>j.id===selected.joint);
 return <aside className="inspector technical-inspector">
  <div className="inspector-title"><span className="eyebrow">DISTRIBUCIÓN INTERIOR</span><span className="technical-status">PROPUESTA 01</span></div>
  <p className="technical-intro">Ocho ejes, ocho accionamientos propuestos. Electrónica en la base fija; mecanismo de párpados y respiración pendiente.</p>
  <div className="technical-layers">{([{key:'exterior',name:'Exterior transparente'},{key:'structure',name:'Bastidor y ejes'},{key:'wiring',name:'Rutas de conexión'},{key:'labels',name:'Identificadores'}] as const).map(layer=><div key={layer.key}><label htmlFor={`tech-${layer.key}`}>{layer.name}</label><Switch id={`tech-${layer.key}`} aria-label={layer.name} checked={options[layer.key]} onCheckedChange={v=>onChange({[layer.key]:v})}/></div>)}</div>
  <section className="part-detail" aria-label="Componente seleccionado" style={{'--part-color':PART_CATEGORIES[selected.category].color} as CSSProperties}>
   <div className="part-detail-heading"><span>{selected.code}</span><strong>{selected.name}</strong><button className="icon-button" aria-label="Centrar componente seleccionado" onClick={onFocus}><Focus size={17}/></button></div>
   <p className="part-location">{selected.location}</p><p>{selected.proposal}</p>
   {joint&&<div className="technical-joint"><div><strong>{joint.label}</strong><output>{snap.targets[joint.id].toFixed(1)} → {snap.pose[joint.id].toFixed(1)}°</output></div><Slider ref={el=>el?.querySelectorAll('[role="slider"]').forEach(n=>n.setAttribute('aria-label',`Probar ${joint.label}`))} aria-label={`Probar ${joint.label}`} min={joint.min} max={joint.max} step={.5} value={[snap.targets[joint.id]]} disabled={snap.status==='stopped'} onValueChange={v=>act(()=>engine.setJoint(joint.id,v[0]))}/><small>Eje {joint.axis.toUpperCase()} · {joint.min}° a {joint.max}° · toma el mando manual</small></div>}
   <div className="part-pending"><strong>Por validar</strong><p>{selected.pending}</p></div>
   <details className="part-envelope"><summary>Reserva de espacio</summary><p>{selected.size.map(v=>Math.round(v*1000)).join(' × ')} mm · X × Y × Z</p><p>{selected.id==='ventuno'?'Placa: 160 × 100 mm según la ficha de Arduino. La altura de reserva de 60 mm es una hipótesis de integración.':'Volumen gráfico orientativo. No es una cota de fabricación ni la medida comprobada de un producto.'}</p>{selected.id==='ventuno'&&<a href="https://docs.arduino.cc/resources/datasheets/ABX00181-datasheet.pdf" target="_blank" rel="noreferrer">Ficha oficial · sección 12 ↗</a>}</details>
  </section>
  <div className="technical-component-list" aria-label="Componentes propuestos">{(Object.keys(PART_CATEGORIES) as (keyof typeof PART_CATEGORIES)[]).map(category=><section key={category}><h2><i style={{background:PART_CATEGORIES[category].color}}/>{PART_CATEGORIES[category].label}</h2>{TECHNICAL_PARTS.filter(p=>p.category===category).map(part=><button key={part.id} className={part.id===selected.id?'selected':''} aria-pressed={part.id===selected.id} onClick={()=>onChange({selected:part.id})}><span>{part.code}</span>{part.name}</button>)}</section>)}</div>
  <div className="technical-note"><Cpu size={19}/><p>La VENTUNO Q está representada de forma esquemática. Motores, controladores y alimentación todavía no tienen modelo comercial asignado.</p></div>
  <button className="outline wide" onClick={()=>downloadJson({schema:'dodo-twin.technical-layout',version:'0.1',status:'proposed-unvalidated',units:'m',axes:{up:'+Y',forward:'+Z'},parts:TECHNICAL_PARTS},'dodo-twin-distribucion-propuesta.json')}><Download size={15}/> Exportar distribución propuesta</button>
  <button className="outline wide" onClick={onControl}><SlidersHorizontal size={15}/> Volver al control de movimiento</button>
  <a className="technical-document" href={docUrl("04-distribucion-tecnica.md")} target="_blank" rel="noreferrer"><Box size={15}/> Criterios de montaje y próximos pasos ↗</a>
 </aside>;
}
