# Validación de la primera versión

Revisión: 28 de septiembre de 2026. Aplicación local ejecutada en macOS con Node 22.22.2 y navegador integrado de Codex. Esta entrega valida un simulador de comportamiento y recorridos; no valida un robot físico.

## Pruebas automatizadas

Las 13 pruebas de `tests/core.test.ts` pasan. Cubren las ocho articulaciones con órdenes aleatorias e inversiones durante 18.000 actualizaciones; límites de posición, velocidad y aceleración; velocidades mínimas; prioridad manual; consignas durante pausa; transiciones y reinicio sin saltos; cancelación de reinicio al tomar el mando; pausa/parada; respuesta a cada estímulo; reproducción determinista de escenarios; protección de semilla y entorno durante reproducción; secuencias completas; exportación/importación; rechazo atómico de proyectos inválidos; y contrato de comunicación sin telemetría física inventada.

Dos reproducciones del mismo escenario producen los mismos 2.640 fotogramas de simulación. La prueba `tests/headless.test.mjs` inicia el motor como proceso independiente del navegador, recibe telemetría y comprueba la parada. La comprobación TypeScript y la compilación de producción pasan.

```sh
npm run test:core
node --test tests/headless.test.mjs
npx tsc --noEmit
npm run build
```

## Comprobaciones en pantalla

- Movimiento manual de cuello, pico y ambas alas hasta sus límites, con consigna y posición simulada visibles.
- Activación y desactivación del modo autónomo; reacción de atención ante presencia, distancia y dirección; contacto y demostración de encuentro de 22 segundos.
- Parada, reanudación y reinicio; registro de finalización del escenario.
- Guardado, recarga y reproducción de una postura; creación y reproducción de una secuencia y un escenario propios.
- Cambio de semilla a 99, recarga y comprobación del valor persistido; restauración posterior a 42.
- Vista de estructura y vistas de cámara; presentación con fondo nocturno, iluminación ajustable y controles ocultos. Proporciones del lienzo comprobadas: 16:9 y 9:16.
- Inspección visual a 1280 × 720, 1024 × 768 y anchura estrecha de aproximadamente 390 px. En anchuras estrechas el panel pasa debajo del modelo y se recorre desplazando la página.
- Herramientas WebMCP: lectura de simulación, cambio validado de entorno y parada. Un sonido fuera del rango permitido se rechaza.

La descarga JSON se implementa con el mecanismo estándar del navegador. El evento de descarga no pudo confirmarse con la automatización del navegador integrado; la serialización y la validación de reimportación sí se verifican en las pruebas. No se ha automatizado el selector nativo de archivos. El ejemplo `public/examples/dodo-twin-proyecto.json` permite probar la importación manualmente.

## Rendimiento observado

El indicador de la aplicación mostró aproximadamente 41–50 FPS durante pruebas de escritorio a 1280 × 720 y 33 FPS en una captura a 1024 × 768 con la demostración en preparación. Son observaciones del entorno de desarrollo, no un ensayo sostenido ni una garantía para otros equipos. El render limita la densidad de píxeles a 1,5; la integración de movimientos usa pasos fijos de 1/120 s. La compilación avisa del tamaño del paquete principal por Three.js, lo que puede aumentar el tiempo de carga inicial.

Una pestaña del navegador integrado se cerró por un fallo del proceso durante la revisión. Se recuperó abriendo otra pestaña; la biblioteca guardada se mantuvo. No se ha identificado una causa reproducible. No se ha realizado una prueba prolongada de estabilidad ni una prueba en un móvil físico.

## Correspondencia con el objetivo

| Requisito | Entrega y límite |
| --- | --- |
| Anatomía y evidencia | Fuentes de museos y decisiones artísticas documentadas; altura de referencia provisional de 700 mm. |
| Modelo articulado | Modelo original reconocible, ocho pivotes, exterior sustituible y estructura de estudio separada. No es CAD ni un personaje con deformación continua. |
| Movimientos | Cabeza, cuello, pico, alas y cuerpo; respiración y párpados visuales, con mecanismo físico pendiente. |
| Configuración central | Jerarquía, ejes y signos, neutros, límites, velocidades y aceleraciones; configuración exportable. |
| Control manual | Toma prioridad sobre articulaciones; posturas y secuencias persistidas localmente. |
| Autonomía | Reposo, curiosidad, atención, sobresalto y recuperación; variación por semilla. |
| Entorno | Presencia, proximidad/dirección, sonido, luz y contacto simulados; registro y escenarios repetibles. |
| Dos vistas | Laboratorio y presentación comparten el mismo motor; formatos horizontal/vertical y vista limpia. |
| Telemetría | Consigna y posición simulada separadas; medidas reales nulas y conexión física pendiente. |
| Transporte | Pausa, reinicio suave y parada virtual; no equivalen a una parada de emergencia física. |

## Límites y siguiente fase

El aspecto y las respuestas son interpretaciones artísticas. El modelo puede mostrar intersecciones en combinaciones extremas de articulaciones. No hay colisiones, física de masas, equilibrio, fuerzas, flexión de materiales ni vocalización. El encuadre se prepara para una grabadora externa; no hay exportación de vídeo integrada.

La biblioteca pertenece al navegador y al origen. No se sincroniza entre localhost, el sitio publicado y otros dispositivos. Exportar antes de cambiar de entorno. El motor web depende de la pestaña y el navegador puede ralentizarlo cuando queda oculta. El proceso sin navegador demuestra la separación arquitectónica, pero todavía no se comunica con esta web ni con la placa.

La VENTUNO Q está documentada como primera opción, sin firmware ni conexión física probados. Quedan transporte, calibración, sincronización temporal, watchdog local, parada física y pruebas de cargas, colisiones, holguras, ruido, consumo, temperatura y equilibrio. El siguiente paso físico es el banco de cabeza y cuello descrito en `03-banco-cabeza-cuello.md`; motores, alimentación y piezas finales se eligen tras dimensionarlo.

## Ampliación: vista técnica

Añadida una tercera vista con 14 referencias seleccionables: VENTUNO Q, interfaz de motores, distribución eléctrica, parada, ocho accionamientos y dos agrupaciones de sensores. Se comprobó en navegador la selección M03, la consigna de inclinación del cuello a 22°, su transición limitada y el cambio a control manual. Se verificaron capas de exterior y rutas, las etiquetas y su correspondencia con la ficha de componente, en vista estrecha y de escritorio. TypeScript y compilación de producción correctos. Los materiales y componentes técnicos se retiran al volver a Laboratorio/Presentación. El montaje sigue siendo conceptual; véase `04-distribucion-tecnica.md`.
