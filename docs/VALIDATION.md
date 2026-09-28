# Validación · versión 1.1 publicada

Revisión: **28 de septiembre de 2026**. Versión probada: la publicada en <https://ruben-arconada.github.io/dodo-twin/> (commit inicial `85581a2`, compilación de GitHub Actions). Esta entrega valida un simulador de comportamiento y recorridos. **No valida un robot físico.**

## Pruebas automáticas (local y en CI)

Se ejecutan en cada `push` a `main` en GitHub Actions (Ubuntu, Node 22) y en local (macOS, Node 22.22.2):

```sh
npm run typecheck   # TypeScript estricto: sin errores
npm test            # 13/13 núcleo + 1/1 proceso sin navegador
npm run build       # web estática en dist/
```

Las 13 pruebas de `tests/core.test.ts` cubren las ocho articulaciones con órdenes aleatorias e inversiones durante 18.000 pasos (límites de posición, velocidad y aceleración en **cada** paso de 1/120 s), velocidades mínimas, prioridad manual, consignas en pausa, transiciones y reinicio sin saltos, pausa y parada, respuesta a cada estímulo, reproducción determinista de escenarios (2.640 fotogramas idénticos), protección de semilla y entorno durante un escenario, secuencias completas, exportación/importación, rechazo atómico de proyectos inválidos y contrato sin telemetría física inventada. `tests/headless.test.mjs` arranca el motor como proceso independiente del navegador, recibe telemetría y comprueba la parada.

## Comprobaciones manuales en la web publicada

Hechas en el navegador integrado de la app de Claude (Chromium 152, macOS, ventana de 1024 × 768, densidad de píxeles 2), sobre la URL de GitHub Pages:

| Área | Qué se hizo | Resultado |
|---|---|---|
| Carga | Abrir la URL; revisar consola y red. | Sin errores. Se cargan `index.html`, un JS y un CSS bajo `/dodo-twin/`. La herramienta de depuración `window.__dodo` no existe en producción. |
| Almacenamiento | Listar `localStorage`. | Solo `dodo-twin.project.v1`. No hay service worker ni cachés. |
| Estímulos | Presencia; dirección +60°; distancia 0,1 m; sonido 100 % y 0 %; luz 0 %; contacto. | Cada estímulo produce un evento «estímulo» y un cambio visible: curiosidad y giro de cabeza hacia la persona; sobresalto por proximidad → recuperación → atención; sobresalto por sonido; reposo con poca luz; sobresalto por contacto. Se observaron los cinco estados. |
| Transición autónomo → manual | Muestreo de las ocho lecturas durante 1,5 s tras desactivar el modo autónomo. | Salto máximo entre muestras de la interfaz: 0,1°. Evento «Control manual · comportamiento sin prioridad». |
| Transición manual → autónomo | Cuello en 35° (máximo) y activar autónomo. | Rampa continua de 35° hacia el objetivo, sin saltos. Velocidad observada ≈33°/s en ventanas de 0,5 s; el límite es 30°/s. La diferencia se explica por el refresco de la interfaz cada 80 ms. El límite exacto lo verifican las pruebas paso a paso. |
| Límites | Deslizadores con tecla Fin/Inicio (pico 0–24°, alas ±25°, cuello ±35°). | Cada consigna se queda exactamente en su límite. En **Proyecto**, ampliar el giro de cuello a 40° se rechaza («fuera de la envolvente provisional»); reducirlo a 30° se aplica y el rango del deslizador pasa a −35°…30°. Valor original restaurado después. |
| Parada | Pulsar **Parada** y esperar 2,5 s. | Posición y reloj congelados, deslizadores desactivados, evento «Parada virtual · posición retenida». Reanudar vuelve a «Exploración libre». |
| Pausa | Pausar 2 s. | Posición y reloj idénticos; estado «En pausa». |
| Reinicio | **Reiniciar simulación** desde una postura con el cuello girado. | Regreso suave a neutro (ocho articulaciones a 0,0°) en unos 3 s, sin saltos. El reloj se reinicia. |
| Posturas y secuencias | Guardar la postura «Prueba mirar derecha»; crear «Secuencia de prueba» (posición actual + postura neutra); guardar; **recargar la página**; reproducir. | Postura y secuencia persisten tras la recarga. La secuencia llega a 30° de giro de cabeza, vuelve a neutro y registra «Secuencia completada» (~4,4 s). |
| Escenario | **Probar un encuentro · 22 s**, dos veces seguidas. | Recorre curiosidad, atención, sobresalto, recuperación y reposo; termina en pausa a los 22,2 s de reloj real. Las dos ejecuciones producen los mismos 16 eventos con los mismos tiempos. |
| Exportar / importar | Exportar proyecto; modificarlo (una postura menos, una nueva, semilla 7) e importarlo; importar después un archivo con versión 2.0. | El JSON exportado (6,7 kB) contiene versión 1.0, escala 0,7 m, ocho articulaciones, posturas, secuencias y escenario. La importación sustituye la biblioteca y la semilla. El archivo 2.0 se rechaza («Archivo incompatible con Dodo Twin 1.0.») sin tocar la biblioteca. La descarga se capturó interceptando el enlace; no se comprobó el diálogo nativo de guardado. |
| Presentación | 16:9 y 9:16; fondo nocturno; luz principal al máximo; **Ocultar controles**, tecla H y Esc. | Lienzo 583 × 328 (1,7774; objetivo 1,7778) y 432 × 768 (0,5625, exacto). Sin paneles ni cabecera en modo limpio; H y Esc los restauran. |
| Técnica | Abrir la vista con exterior, bastidor, rutas y etiquetas. | 14 referencias visibles; el modelo nuevo se muestra translúcido sobre la estructura. |
| Móvil | Emulación 375 × 812. | Panel bajo el modelo; sin desplazamiento horizontal (`scrollWidth` = 375). |

## Rendimiento observado

| Vista | FPS (rAF) | Fotograma p95 | Peor fotograma | Fotogramas largos (>50 ms) |
|---|---|---|---|---|
| Laboratorio, autónomo | 50,1 | 21,9 ms | 22,1 ms | 0 en 8 s |
| Técnica, todas las capas | 50,1 | 21,6 ms | 22,1 ms | 0 en 8 s |

El navegador integrado entrega fotogramas a **50 Hz**: el visor sigue ese ritmo sin caídas, así que la cifra refleja el techo de la pantalla, no el del modelo. En el servidor de desarrollo, el indicador de la app llegó a marcar 113 FPS en ese mismo equipo. Son observaciones de un Mac de desarrollo, no una garantía para otros equipos. **No se ha probado en móviles físicos** ni en una sesión larga de estabilidad.

Paquete publicado: 1,00 MB de JavaScript (281,8 kB gzip), casi todo Three.js, y 58 kB de CSS (11,9 kB gzip). El modelo tiene unas 4.200 plumas y barbas instanciadas y unos 374.000 vértices transformados en postura neutra. El render limita la densidad de píxeles a 1,5. La integración usa pasos fijos de 1/120 s.

## Correspondencia con el objetivo

| Requisito | Entrega y límite |
|---|---|
| Web estática en GitHub | Repositorio `Ruben-Arconada/dodo-twin` y publicación en GitHub Pages mediante Actions (tipos, pruebas, compilación y despliegue). |
| Anatomía y evidencia | `01-anatomia-y-evidencia.md`: fuentes de museos, síntesis de estudios modernos y tabla de evidencia frente a decisión artística para la revisión 02. Altura de 700 mm (medida: 696 mm) dentro del rango moderno de 62,6–75 cm. |
| Modelo articulado | Revisión 02: pico, cara, patas, alas y cola rehechos sin cambiar los 8 pivotes. Exterior separado de la estructura (vista Técnica); sustituible sin tocar el control. No es CAD ni un personaje con piel deformable. |
| Movimientos | Cabeza, cuello, pico, alas y cuerpo. Respiración y párpados son efectos visuales con mecanismo físico pendiente. |
| Configuración central | `lib/dodo/config.ts`: jerarquía, ejes y signos, neutros, límites, velocidades y aceleraciones. Exportable. |
| Manual frente a autónomo | El manual tiene prioridad sobre las articulaciones; el comportamiento sigue evaluándose y se registra «sin control de articulaciones». |
| Autonomía | Reposo, curiosidad, atención, sobresalto y recuperación, con variación por semilla reproducible. |
| Entorno | Presencia, proximidad y dirección, sonido, luz y contacto simulados, con registro y escenarios repetibles. |
| Dos vistas (+ Técnica) | Laboratorio y Presentación comparten el mismo motor. Presentación: fondos, luz, 16:9 y 9:16, modo limpio. |
| Datos honestos | Consigna y posición simulada separadas; columna «Real» vacía; `measured: null` y `connected: false`. |
| Pausa, reinicio y parada | Verificados; la parada es virtual, no una parada de emergencia física. |

## Limitaciones conocidas

- **Visuales:** el modelo usa piezas rígidas. Combinaciones extremas pueden mostrar intersecciones, sobre todo el cuello con giro e inclinación máximos a la vez. Las alas abiertas al máximo (±25°) se separan del flanco dejando un hueco visible. El plumaje es geométrico, no un sistema de pelo ni de plumas físicas. Colores y forma exacta del pico y la cola son interpretación.
- **Funcionales:** la biblioteca vive en el navegador y el origen (no se sincroniza entre local y publicado ni entre equipos). El motor web depende de la pestaña: si se oculta, el navegador puede ralentizarlo. No hay exportación de vídeo; la presentación prepara el encuadre para una grabadora externa. No hay vocalizaciones. El proceso `npm run brain` no se comunica todavía con la web ni con la placa.
- **Físicas (pendientes):** cargas, equilibrio, colisiones, holguras, ruido, consumo, temperatura, calibración, watchdog, parada física y latencias. VENTUNO Q documentada como primera opción, sin firmware ni conexión probados. El siguiente paso es el banco de cabeza y cuello (`03-banco-cabeza-cuello.md`). Motores, alimentación y piezas imprimibles se eligen después de dimensionarlo.
