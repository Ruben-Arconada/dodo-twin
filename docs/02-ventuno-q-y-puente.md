# Dodo Twin · VENTUNO Q y futuro puente físico

Revisión documental: **28 de septiembre de 2026**. Estado: arquitectura propuesta; no hay placa conectada ni firmware de control validado.

## Hardware comprobado

> Reconsulta 28/09/2026 (entrega 1.1): la ficha oficial sigue indicando Qualcomm Dragonwing IQ8 (QCS8275) con Ubuntu, STM32H5F5 a 250 MHz con 4 MB de flash y 1,5 MB de RAM, biblioteca RPC integrada, cabeceras UNO, Qwiic, cabecera de 40 pines y conectores JMEDIA/JMISC/JOMEGA. [A1]

La ficha oficial documenta **Qualcomm Dragonwing IQ8 (QCS8275)** como MPU con Ubuntu Linux y **STM32H5F5, Cortex-M33 a 250 MHz**, como MCU; anuncia una biblioteca RPC entre ambos. Incluye conectores UNO, Qwiic, JMEDIA/JMISC/JOMEGA y cabecera de 40 pines, además de USB, Ethernet y otras interfaces. Su presencia no prueba compatibilidad eléctrica o de software con cualquier periférico. [A1]

El pinout oficial consultado muestra buses I²C, SPI, UART, temporizadores/PWM y CAN; advierte que **JCTL usa lógica de 1,8 V**, que su adaptador UART debe ser de drenador abierto, que A0/A1 no toleran 5 V, que A4/A5 no tienen un I²C STM32 conectado y que los raíles JOMEGA carecen de limitación de corriente. El documento está fechado **6 de julio de 2026**. Su URL contiene ABX00181, mientras el dibujo rotula SKU ABX00163: cotejar con la revisión real antes de asignar pines. [A2]

El manual enlazado por Arduino se intentó abrir, pero no devolvió contenido legible en esta revisión. No se sustituyen sus detalles por los de UNO Q. La selección final de pines, alimentación, niveles lógicos, controladores y sensores queda pendiente de revisión de la placa, esquemas y documentación vigente. [A3]

## Separación propuesta de responsabilidades

| Capa | Trabajo |
|---|---|
| Gemelo en navegador | Geometría, cinemática, interfaz, reproducción y registro. Por defecto, simulación. |
| Servicio local en MPU | Adaptar el contrato del gemelo a RPC, validar sesión y versiones, registrar errores y telemetría. |
| MCU | Límites locales, generación de trayectoria, lectura de sensores, supervisión temporal y estado de habilitación. Debe mantener esas funciones aunque falle Linux. |
| Hardware de potencia y protección | Etapa de accionamiento externa y parada física, con comportamiento definido ante pérdida de energía. Se dimensionará tras el banco de pruebas. |

El navegador no enviará consignas directas a pines. VENTUNO Q es la opción preferida, pero la interfaz del gemelo debe permitir cambiar el adaptador sin modificar el modelo de movimiento.

## Qué API existe y qué se propone

Un tutorial específico de VENTUNO Q muestra `Arduino_RouterBridge.h`, `Bridge.begin()`, `Bridge.provide(...)` y llamadas Python `Bridge.call(...)`. Esto confirma el mecanismo, **no un controlador de articulaciones**. [A4]

La biblioteca Python oficial actual documenta `from arduino.router_bridge import Bridge`, instanciación y conexión del objeto; utiliza MessagePack-RPC y un socket gestionado por Arduino Router. La API observada en `main` puede diferir de la versión instalada o del envoltorio App Lab: fijar versiones y comprobar un intercambio de diagnóstico antes del movimiento. Evitar acceso TCP abierto; el propio repositorio indica que ese transporte no incorpora autenticación ni cifrado. [A5]

La biblioteca C++ advierte de riesgo de bloqueo al llamar a `Bridge.call` dentro de un callback RPC. Su README todavía menciona UNO Q: el ejemplo específico de VENTUNO Q es la evidencia adicional de uso, no una garantía de que cualquier versión compile. [A4, A6]

El contrato de simulación implementado está en **PROTOCOL.md**. Lo siguiente amplía ese contrato como **propuesta para el hardware**, no es una API de Arduino:

- Sobre: `schema_version`, `model_revision`, `calibration_revision`, `session_id`, `sequence`, `ttl_ms`, tipo y carga útil.
- Geometría almacenada en metros; cotas de interfaz en mm. El contrato de simulación v1.0 usa **deg**, **deg/s**, **deg/s²** y segundos. Los plazos de caducidad del futuro puente se expresarán en **ms**. Si un driver requiere radianes, convertir explícitamente en el adaptador. No enviar valores sin unidad.
- Identificadores estables para giro de cuello, inclinación de cuello e inclinación de cabeza; ejes y signo documentados según regla de la mano derecha y el marco local. El cero de modelo no equivale automáticamente al cero de sensor.
- Operaciones conceptuales: consultar capacidades, iniciar sesión, cargar calibración verificada, habilitar, solicitar postura, leer estado y deshabilitar. Los nombres RPC y su codificación se decidirán al implementar y probar el adaptador.
- Telemetría: estado de seguridad, última secuencia aceptada, consigna y medición por articulación, antigüedad local de la orden, fallos y versiones. Un acuse confirma aceptación; solo el sensor confirma posición. Una posición simulada nunca se etiqueta como medida.
- Rechazar versión mayor incompatible, valores no finitos, identificadores desconocidos, calibración incorrecta, secuencias repetidas o atrasadas y límites excedidos. La caducidad se cuenta con reloj monotónico del receptor; no asumir relojes sincronizados. Tras reconectar se negocia una sesión nueva y se descartan órdenes antiguas.

## Supervisión y parada propuestas

Arranque en **DESHABILITADO**; habilitación explícita tras comprobar calibración, sensores y parada física. Definir además **LISTO**, **MOVIENDO**, **FALLO** y **PARADA**. El MCU supervisará la pérdida de órdenes/latidos con reloj propio y tendrá un watchdog independiente del servicio Linux. Los plazos numéricos se medirán y fijarán en banco; no hay latencia determinista demostrada.

Un fallo debe conducir a la condición física segura definida para esa mecánica: no asumir que retirar par es seguro si la cabeza puede caer. Prever soporte, contrapeso o freno según las cargas. La parada física debe actuar sobre la habilitación/energía de accionamiento sin depender del navegador, Wi‑Fi, MPU ni RPC. Restaurar conexión o liberar parada no debe reiniciar el movimiento automáticamente. Ninguna de estas medidas está aún implementada ni certificada.

## Fuentes

Consulta de todas: 2026-09-28.

- **A1:** [Ficha oficial VENTUNO Q](https://docs.arduino.cc/hardware/ventuno-q/).
- **A2:** [Pinout oficial, revisión 2026-07-06](https://docs.arduino.cc/resources/pinouts/ABX00181-full-pinout.pdf).
- **A3:** [Manual de usuario VENTUNO Q](https://docs.arduino.cc/tutorials/ventuno-q/user-manual/), contenido no extraíble en esta revisión.
- **A4:** [Local AI Voice Assistant with the VENTUNO Q](https://docs.arduino.cc/tutorials/ventuno-q/local-ai-assistant/), sección MCU Role and RPC Bridge; contenido comprobado mediante índice del buscador.
- **A5:** [arduino/arduino-router-bridge-py](https://github.com/arduino/arduino-router-bridge-py), README de la rama main, no versión fijada.
- **A6:** [arduino-libraries/Arduino_RouterBridge](https://github.com/arduino-libraries/Arduino_RouterBridge), README de la rama main, no versión fijada.
