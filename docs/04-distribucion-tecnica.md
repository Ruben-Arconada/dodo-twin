# Distribución técnica propuesta · revisión 01

La vista **Técnica** muestra una hipótesis de integración, conectada a las articulaciones del simulador. Selecciona una pieza en el modelo o en la lista; puedes centrarla, consultar su función y probar el eje de un motor. Las capas de exterior, bastidor, rutas y etiquetas se pueden ocultar por separado.

## Componentes y emplazamiento

| Identificador | Componente | Ubicación propuesta |
| --- | --- | --- |
| E01 | Arduino VENTUNO Q | Bandeja izquierda de una base fija ventilada y registrable |
| E02 | Controladores/interfaz de accionamiento | Bandeja derecha de la base |
| P01 | Distribución de alimentación y protecciones | Sector frontal derecho de la base |
| P02 | Parada física | Borde accesible de la base |
| M01 | Basculación del cuerpo | Bastidor fijo en la pelvis |
| M02–M03 | Giro e inclinación de cuello | Parte alta del tronco y horquilla cervical inferior |
| M04–M05 | Giro e inclinación de cabeza | Extremo superior del cuello y horquilla de cabeza |
| M06 | Pico | Interior inferior de la cabeza; biela pendiente |
| M07–M08 | Alas izquierda y derecha | Hombros, dentro del tronco |
| S01 | Presencia/proximidad | Frente de la base; cámara o sensor por elegir |
| S02 | Sonido, luz y contacto | Marcador funcional: los sensores reales se distribuirán en ubicaciones diferentes |

Son ocho accionamientos conceptuales, uno por eje actual. No hay modelo comercial, par, tensión, transmisión ni capacidad de canales de la placa seleccionados. Párpados y respiración siguen siendo efectos visuales; sus mecanismos y número de accionamientos se decidirán después. Los motores superiores pueden sustituirse por transmisión remota si su masa lo exige.

## Placa: evidencia y reserva

La ficha oficial de Arduino, sección 12, especifica **160 × 100 mm** y **25,8 mm de altura excluyendo el disipador y ventilador del SoM**. Incluye cuatro agujeros exteriores de 3,2 mm y separadores M3 de cuerpo de 20 mm. Exige refrigeración activa para funcionamiento sostenido a pleno rendimiento y comprobar el margen térmico dentro de la caja final. [Ficha oficial VENTUNO Q](https://docs.arduino.cc/resources/datasheets/ABX00181-datasheet.pdf), revisión consultada: 28/09/2026, páginas 49–52.

El modelo gráfico usa la huella de 160 × 100 mm, pero **60 mm de reserva vertical es una decisión provisional**, no una altura oficial del conjunto refrigerado. No reproduce conectores, taladros ni componentes con precisión CAD. Medir la placa real, refrigeración, conectores, cables y accesos antes de fabricar.

La base técnica se representa con aproximadamente 540 × 400 × 160 mm (ancho × fondo × alto), más profunda que el plinto de exposición de 28 mm de la vista exterior. Es una caja de servicio conceptual: no se afirma que esta distribución quepa en el plinto exterior actual. Integrar ambas geometrías será parte del diseño mecánico.

## Estructura y conexiones

El bastidor ilustra una trayectoria de soporte desde la base hacia pelvis, cuello y hombros. Motores y piezas se vinculan a los marcos de las articulaciones y siguen sus movimientos. No se han resuelto apoyos, rodamientos, bielas, cinemática de transmisiones ni fijaciones imprimibles.

Las rutas de conexión son líneas funcionales, no un esquema eléctrico ni una ruta física validada. Ámbar indica accionamiento/alimentación; cian indica enlaces de control. Longitud, sección, tensión, conectores, flexión, bucles de servicio y alivio de tensión siguen pendientes. Los trazos pueden atravesar volúmenes: no certifican que exista espacio libre.

La parada dibujada no controla hardware. La protección y retención ante pérdida de energía se deben resolver localmente. No alimentar los motores desde GPIO. La siguiente fase sigue siendo el [banco de cabeza y cuello](03-banco-cabeza-cuello.md).

## Datos y exportación

`lib/dodo/technical-layout.ts` centraliza identificadores, ubicación, marco padre, desplazamiento en metros, reserva de espacio y decisiones pendientes. **Exportar distribución propuesta** descarga estos datos con versión 0.1 y estado `proposed-unvalidated`. Es una exportación de estudio, separada del proyecto de movimiento; no se ofrece todavía edición/importación de emplazamientos desde la web.
