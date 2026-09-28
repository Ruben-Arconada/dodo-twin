import type {JointId} from './config';

export type PartCategory = 'motor' | 'control' | 'power' | 'sensor';
export interface TechnicalPart {
 id: string;
 code: string;
 name: string;
 category: PartCategory;
 parent: JointId | 'base';
 offset: [number, number, number];
 size: [number, number, number];
 axis?: 'x' | 'y' | 'z';
 joint?: JointId;
 location: string;
 proposal: string;
 pending: string;
}

export const PART_CATEGORIES: Record<PartCategory, {label:string;color:string}> = {
 control:{label:'Control',color:'#73dbe3'},
 motor:{label:'Accionamientos',color:'#efb95e'},
 power:{label:'Alimentación',color:'#f39483'},
 sensor:{label:'Sensores',color:'#bda2f6'},
};

// Metres, Y up, Z forward. Sizes reserve space; VENTUNO PCB X/Z is documented,
// but its 60 mm overall height allowance is provisional, including cooling space.
export const TECHNICAL_PARTS: TechnicalPart[] = [
 {id:'ventuno',code:'E01',name:'Arduino VENTUNO Q',category:'control',parent:'base',offset:[-.115,-.075,.01],size:[.160,.060,.100],location:'Bandeja izquierda de la base fija',proposal:'Placa de 160 × 100 mm sobre separadores, accesible para USB, red y mantenimiento. La base reduce masa móvil y permite organizar la refrigeración activa.',pending:'La altura oficial de 25,8 mm excluye disipador y ventilador. La reserva de 60 mm es provisional: comprobar altura real refrigerada, taladros, flujo de aire y conectores antes de fabricar.'},
 {id:'drivers',code:'E02',name:'Controladores de motores',category:'control',parent:'base',offset:[.12,-.07,-.045],size:[.095,.032,.085],location:'Bandeja derecha, separada del ordenador',proposal:'Interfaz de accionamiento entre el microcontrolador y los ocho ejes. Puede ser un controlador externo o la electrónica integrada de actuadores inteligentes.',pending:'Elegir después del tipo de motor: bus, etapas de potencia, niveles eléctricos y realimentación. No representa una placa comercial seleccionada.'},
 {id:'power',code:'P01',name:'Distribución de alimentación',category:'power',parent:'base',offset:[.12,-.095,.115],size:[.1,.036,.066],location:'Zona frontal derecha de la base',proposal:'Reserva para entrada de alimentación, conversión, fusibles y distribución separada hacia lógica y accionamientos. La fuente principal se decidirá después.',pending:'Tensiones, corrientes, potencia, protecciones y disipación sin dimensionar. Los motores no se alimentan desde los GPIO.'},
 {id:'estop',code:'P02',name:'Parada física',category:'power',parent:'base',offset:[-.23,-.045,.13],size:[.036,.04,.036],location:'Borde accesible de la base',proposal:'Pulsador local para la futura cadena de habilitación de accionamientos. Ubicación visible para el operador.',pending:'Cableado, retención de cargas y rearme por definir. Este elemento 3D no acciona una parada de emergencia real.'},
 {id:'body_pitch',code:'M01',name:'Motor · cuerpo',category:'motor',parent:'base',offset:[.038,.246,-.02],size:[.055,.056,.065],axis:'x',joint:'body_pitch',location:'Bastidor fijo, a la altura de la pelvis',proposal:'Accionamiento rotativo con reducción y apoyo en rodamientos para bascular el tronco. Eje de carga independiente de la carcasa del motor.',pending:'Par continuo, transmisión, contrapeso o retención, rodamientos y fijaciones. Medir la masa completa que bascula.'},
 {id:'neck_yaw',code:'M02',name:'Motor · giro de cuello',category:'motor',parent:'body_pitch',offset:[0,.198,.058],size:[.04,.043,.045],axis:'y',joint:'neck_yaw',location:'Parte superior del tronco, base del cuello',proposal:'Accionamiento de giro sobre soporte estructural. Primera propuesta con el motor cerca del eje cervical inferior.',pending:'Recorrido de cables, holgura, carga del cuello y posibilidad de transmisión remota.'},
 {id:'neck_pitch',code:'M03',name:'Motor · inclinación de cuello',category:'motor',parent:'neck_yaw',offset:[.035,0,0],size:[.035,.04,.043],axis:'x',joint:'neck_pitch',location:'Lateral de la horquilla inferior del cuello',proposal:'Segundo eje cervical en una horquilla. Sigue el giro de cuello y mueve la inclinación de todo el conjunto superior.',pending:'Brazo de palanca, contrapeso, interferencias y masa de cabeza. Prioritario en el banco de pruebas.'},
 {id:'head_yaw',code:'M04',name:'Motor · giro de cabeza',category:'motor',parent:'neck_pitch',offset:[0,.12,.052],size:[.027,.032,.03],axis:'y',joint:'head_yaw',location:'Extremo superior del cuello',proposal:'Accionamiento compacto para orientación fina. Su masa afecta al dimensionamiento de todos los ejes inferiores.',pending:'Verificar espacio y masa. Evaluar tendones o transmisión desde el tronco si el motor directo resulta pesado.'},
 {id:'head_pitch',code:'M05',name:'Motor · inclinación de cabeza',category:'motor',parent:'head_yaw',offset:[.028,0,0],size:[.025,.026,.03],axis:'x',joint:'head_pitch',location:'Horquilla bajo la cabeza',proposal:'Accionamiento compacto del cabeceo, ligado a la orientación superior del cuello.',pending:'Espacio bajo la piel, apoyos, acoplamiento y ruido. Tamaño dibujado solo como reserva.'},
 {id:'beak',code:'M06',name:'Motor · pico',category:'motor',parent:'head_pitch',offset:[0,-.009,.014],size:[.02,.02,.027],axis:'x',joint:'beak',location:'Interior inferior de la cabeza',proposal:'Pequeño actuador y biela hacia la mandíbula inferior. Se representa el motor en la cabeza y el eje de salida del pico.',pending:'Longitud de biela, fuerza, topes y espacio. La transmisión no está resuelta ni es una pieza imprimible.'},
 {id:'wing_left',code:'M07',name:'Motor · ala izquierda',category:'motor',parent:'body_pitch',offset:[-.11,.16,.015],size:[.033,.039,.037],axis:'z',joint:'wing_left',location:'Interior del hombro izquierdo del dodo',proposal:'Un accionamiento independiente en el tronco para el ala izquierda, con el eje soportado por el bastidor.',pending:'Peso del ala, efecto de plumas y piel, biela y ruido. Izquierda desde el punto de vista del animal.'},
 {id:'wing_right',code:'M08',name:'Motor · ala derecha',category:'motor',parent:'body_pitch',offset:[.11,.16,.015],size:[.033,.039,.037],axis:'z',joint:'wing_right',location:'Interior del hombro derecho del dodo',proposal:'Accionamiento independiente y disposición simétrica del ala derecha.',pending:'Mismas comprobaciones que el ala izquierda; confirmar signos y topes al calibrar el mecanismo.'},
 {id:'perception',code:'S01',name:'Presencia y proximidad',category:'sensor',parent:'base',offset:[0,-.035,.202],size:[.05,.025,.018],location:'Frente de la base, con campo de visión libre',proposal:'Reserva para cámara o sensor de distancia que detecte personas frente al dodo. La tecnología se elegirá con ensayos del espacio de exhibición.',pending:'Óptica, campo de visión, altura, iluminación y compatibilidad. La detección de la aplicación continúa siendo simulada.'},
 {id:'ambient',code:'S02',name:'Sonido, luz y contacto',category:'sensor',parent:'body_pitch',offset:[-.11,.105,.065],size:[.022,.018,.022],location:'Zona de servicio del tronco; puntos finales por distribuir',proposal:'Marcador de un conjunto futuro: micrófono, luz ambiente y contacto bajo la piel. La ubicación dibujada agrupa la función, no los tres sensores físicos.',pending:'Separar del ruido de motores, exponer el sensor de luz y elegir zonas de contacto. Cantidad y emplazamientos definitivos pendientes.'},
];

export interface TechnicalViewOptions {
 selected: string;
 exterior: boolean;
 wiring: boolean;
 structure: boolean;
 labels: boolean;
}
