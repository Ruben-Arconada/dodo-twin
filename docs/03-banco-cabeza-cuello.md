# Dodo Twin · Banco de cabeza y cuello

Fecha: **28 de septiembre de 2026**. Estado de todas las pruebas: **PENDIENTE**. Este plan es una propuesta de ingeniería para reducir incertidumbres; no contiene resultados físicos ni selección de motores.

## Alcance del primer banco

Construir un módulo de cabeza y cuello fijado a una base de ensayo estable, con cabeza ligera desmontable y masas representativas intercambiables. Ensayar primero un eje y ampliar después. La hipótesis inicial comprende giro de cuello, inclinación de cuello e inclinación de cabeza; tres ejes mecánicos no reproducen toda la anatomía cervical. Pico móvil, ojos, respiración y cuerpo completo quedan fuera del primer banco.

La maqueta y el gemelo deben compartir marcos de coordenadas, nombres de articulaciones y cotas de referencia. La altura de proyecto de 700 mm no permite deducir por sí sola longitudes cervicales ni recorridos. Ver [anatomía y evidencia](01-anatomia-y-evidencia.md).

## Datos necesarios antes de elegir accionamiento

Medir masa de cada pieza móvil con acabado, centro de gravedad, distancia perpendicular a cada eje, rozamiento, holgura, rigidez y volumen útil. Identificar la peor postura, recorrido requerido, velocidad/aceleración visual deseadas, ciclo de trabajo, temperatura ambiente prevista y criterio de ruido. Registrar cables, piel y plumas como cargas y restricciones reales.

Estimar por eje el momento gravitatorio con **τ = m·g·r⊥**, sumando los elementos aguas abajo; usar kg, m y N·m. Añadir efectos de aceleración, pérdidas, contrapeso y márgenes justificados tras la medición. No convertir este cálculo preliminar en una recomendación de motor. El par pico anunciado no demuestra par continuo, calentamiento, precisión ni silencio aceptables.

## Secuencia y evidencias de aceptación

| Prueba pendiente | Método y registro | Condición para avanzar |
|---|---|---|
| 1. Geometría pasiva | Fotos frontal/lateral con escala; cotas de ejes; barrido manual sin energía; envolventes de pico/cuello/cables. | Recorrido útil sin interferencias, atrapamientos accesibles ni tensión en cables. Fijar topes y límites de software dentro del recorrido mecánico. |
| 2. Cargas | Báscula, medida de centro de gravedad y brazo por postura; registro de fricción y holgura. | Tabla reproducible con incertidumbre y revisión de piezas. Estos datos habilitan el dimensionamiento posterior. |
| 3. Potencia y señales | Inspección de polaridad, fusibles, tierras, niveles y separación entre lógica y accionamiento; alimentación limitada para primeras pruebas. | Esquema cotejado con la revisión física de placa y controladores. Ningún accionamiento alimentado desde GPIO. |
| 4. Puente sin carga motriz | Intercambio de diagnóstico; comprobar unidades, sesiones, versiones, pérdida/retraso/duplicación de mensajes y reinicio de MPU/MCU. | Todas las entradas inválidas se rechazan, el estado es visible y ninguna reconexión habilita movimiento por sí sola. |
| 5. Un eje con carga gradual | Movimiento lento desde postura soportada; medir posición, error, sobrepaso, corriente, tensión y temperatura. | Límites cuantitativos acordados **antes** del ensayo y cumplidos con la carga documentada. |
| 6. Fallos y parada | Ensayo controlado de pérdida de comunicación, latido, energía y lectura de sensor; bloqueo lógico, fin de carrera y parada física. | Tiempo y distancia de parada medidos; postura final estable; cabeza retenida cuando corresponda; rearme deliberado. No provocar bloqueos mecánicos destructivos. |
| 7. Movimiento compuesto | Posturas y trayectorias lentas, después velocidades objetivo; comparación de vídeo con gemelo. | Sin colisiones ni tensiones de piel/cables; amplitud y error medidos dentro del perfil aprobado. |
| 8. Duración y acabado | Ciclo repetible con duración objetivo definida; repetir con piel/plumas, medir ruido a distancia y ambiente registrados. | Temperaturas/corrientes dentro de límites documentados, sin aflojamiento ni deterioro; mantenimiento especificado. |

No se inventan ahora tolerancias en grados, velocidad, temperatura, distancia de seguridad o timeout: dependen de la mecánica, sensores y accionamiento aún no seleccionados. Para cada ensayo completar **umbral, motivo, instrumento, incertidumbre, responsable, fecha y resultado**. Un criterio sin valor aprobado sigue pendiente, aunque la animación parezca correcta.

## Registro mínimo y paso a cuerpo completo

Conservar revisión CAD/modelo, fotos del montaje, lista de masas, esquema eléctrico, versiones de SO/core/bibliotecas/firmware, calibración, perfil de límites, telemetría y vídeo sincronizado. Separar **consigna**, **estimación** y **medición**. Los resultados de una simulación visual no validan torque, ruido, estabilidad, temperatura, precisión o seguridad.

Avanzar al cuerpo completo solo tras cerrar los ensayos de cargas, límites, parada y duración de cabeza/cuello. Después verificar base y fijaciones con el centro de masa global y las cargas dinámicas; mantener patas ancladas y sin locomoción en este alcance. Revisar de nuevo las envolventes con público y acabado final.

Este plan deriva de las necesidades del proyecto; las características de VENTUNO Q y los puntos documentales están citados en [VENTUNO Q y puente](02-ventuno-q-y-puente.md). No es una declaración de conformidad ni una prueba de funcionamiento.
