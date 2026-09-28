# Contrato Dodo Twin 1.0

Estado: implementado para simulación; puente físico pendiente. Este es un contrato propio del proyecto, no una API de Arduino.

El motor no depende del navegador: `npm run brain` lo ejecuta en Node.js 22.13+ y recibe JSON por líneas en la entrada estándar. Emite telemetría por líneas unas 10 veces por segundo. El mismo núcleo se ejecuta en la web. El proceso local es una instancia independiente de la web; todavía no hay un servidor que sincronice ambas.

## Unidades e identificadores

- Geometría: metros, +Y arriba, +Z delante; interfaz de dimensiones en milímetros.
- Articulaciones y posiciones: grados (`deg`); velocidad `deg/s`; aceleración `deg/s²`.
- Tiempo de simulación: segundos, paso fijo 1/120 s.
- Estado normalizado de luz/sonido/respiración/parpadeo: 0–1; distancia: metros; azimut: grados.
- IDs: `body_pitch`, `neck_yaw`, `neck_pitch`, `head_yaw`, `head_pitch`, `beak`, `wing_left`, `wing_right`. Jerarquía, signos y envolventes en `lib/dodo/config.ts` y en la exportación del proyecto.
- La rotación se suma a la transformación de reposo. Los signos de las consignas de alas son opuestos para apertura simétrica. `axisSign: -1` en ambas alas convierte sus consignas a rotación visual sobre −Z; las demás articulaciones usan +X o +Y.

## Órdenes implementadas

Todos los mensajes tienen `version: "1.0"`. `set_pose` requiere las ocho posiciones, valores finitos dentro de los límites y `unit: "deg"`. La validación precede a la mutación.

```json
{"version":"1.0","type":"set_mode","mode":"auto"}
{"version":"1.0","type":"stimulus","environment":{"presence":true,"distance":1,"azimuth":25}}
{"version":"1.0","type":"touch"}
{"version":"1.0","type":"pause"}
{"version":"1.0","type":"resume"}
{"version":"1.0","type":"stop"}
{"version":"1.0","type":"reset"}
{"version":"1.0","type":"get_state"}
```

`set_pose` toma el mando manual; `play_sequence` recibe una secuencia validada. Una secuencia espera hasta llegar a cada posición y después cumple `hold` en segundos. No sacrifica límites para cumplir un tiempo de llegada fijo. `stop` cancela reproducción y retiene posición; es una parada virtual inmediata y queda fuera del perfil de aceleración normal. `pause` congela tiempo, velocidad y efectos visuales. `reset` vuelve suavemente a neutro, limpia estímulos/reproducciones y reinicia el reloj; conserva biblioteca, configuración y semilla. Tras el reinicio queda en manual.

## Telemetría implementada

```json
{
  "version":"1.0",
  "source":"simulation",
  "time_s":1.25,
  "positionUnit":"deg",
  "velocityUnit":"deg/s",
  "commanded":{"body_pitch":0,"neck_yaw":10,"neck_pitch":0,"head_yaw":0,"head_pitch":0,"beak":0,"wing_left":0,"wing_right":0},
  "simulated":{"body_pitch":0,"neck_yaw":7,"neck_pitch":0,"head_yaw":0,"head_pitch":0,"beak":0,"wing_left":0,"wing_right":0},
  "measured":null,
  "connected":false
}
```

`commanded` es la consigna aceptada; `simulated` la posición cinemática; `measured` permanece `null`. Un error de orden devuelve `ok:false` con mensaje y no altera el estado. No hay simulación de torque, inercia, corriente, temperatura o colisiones.

## Puente físico previsto

El futuro servicio Linux adaptará órdenes versionadas a la biblioteca RPC documentada para VENTUNO Q, conservando los IDs. El código C++ del MCU generará las trayectorias temporales y aplicará límites incluso si la web o Linux dejan de responder. No está implementado: `PhysicalAdapter.connect()` falla explícitamente.

Antes de habilitar motores, el contrato físico debe añadir negociación de capacidades, revisión de modelo/calibración, sesión nueva tras reconexión, números de secuencia monotónicos, caducidad recibida con reloj monotónico del MCU, acuse de aceptación, fallos y edad de lecturas. Sus tiempos se fijarán tras pruebas; no hay latencia garantizada. Si el driver usa radianes, la conversión explícita vive en el adaptador; jamás se cambia la unidad silenciosamente.

Arranque deshabilitado, habilitación explícita, watchdog en MCU, rechazo de comandos caducados/no finitos/fuera de límites, parada física independiente y prohibición de reanudar automáticamente tras un fallo. Retener o retirar par se decidirá según la mecánica y la prevención de caída de la cabeza. La web no sustituye estas protecciones.

## Reproducibilidad

Los escenarios almacenan semilla, duración y eventos con tiempo. Preparan neutro suavemente, restablecen reloj y entorno y ejecutan a paso fijo. Se bloquean cambios externos de semilla/estímulos durante reproducción; un cambio manual de modo la cancela. Al finalizar se pausa la simulación para inspección. Dos escenarios iguales con configuración idéntica producen el mismo estado por tick, con independencia de la velocidad de dibujo.

En el navegador, la simulación puede ralentizarse al ocultar la pestaña o saturar el dispositivo; la arquitectura permite ejecutar el núcleo por separado. El proceso Node usa un reloj monotónico, pero no es un controlador de tiempo real. La ejecución física temporal será responsabilidad del MCU.
