# Dodo Twin

Laboratorio web en español para diseñar, simular y, más adelante, controlar un dodo animatrónico de exhibición (*Raphus cucullatus*) a escala 1:1, unos 700 mm, sobre base fija. Esta versión es un **simulador**: la Arduino VENTUNO Q es la plataforma física preferida, pero todavía no hay hardware conectado y la telemetría real aparece vacía.

**Abrir en el navegador:** <https://ruben-arconada.github.io/dodo-twin/>

Necesita un navegador con WebGL (Chrome, Edge, Safari o Firefox recientes). No hace falta instalar nada.

## Ejecutarlo en local

En un Mac, haz doble clic en **`Abrir Dodo Twin.command`**. La primera vez instala las dependencias y después abre <http://localhost:5173/>. Deja abierta la ventana de Terminal mientras lo usas.

Desde una terminal, con Node.js 22.13 o posterior:

```sh
npm ci
npm run dev
```

Otros comandos:

```sh
npm test          # 13 pruebas del núcleo + prueba del proceso sin navegador
npm run typecheck # comprobación de tipos
npm run build     # web estática en dist/ (lista para GitHub Pages)
npm run brain     # el mismo motor de comportamiento en Node, sin navegador
```

Cada `push` a `main` ejecuta en GitHub Actions la comprobación de tipos, las pruebas y la compilación, y publica `dist/` en GitHub Pages.

## Una primera demostración

1. En **Entorno**, pulsa **Probar un encuentro · 22 s**. El dodo vuelve a neutro y recorre curiosidad, seguimiento, sobresalto, recuperación, contacto y descanso. Al terminar se pausa.
2. Pulsa **Reanudar**. En **Mover**, ajusta cuello, cabeza, pico, cuerpo o alas: el control manual toma prioridad sobre el autónomo. La lectura muestra **consigna → posición simulada**.
3. En **Biblioteca → Posturas**, nombra y guarda una posición. Cárgala con su botón de reproducción.
4. En **Secuencias**, añade la posición actual o posturas guardadas, ordena los pasos, ajusta las esperas, guarda y reproduce.
5. En **Escenarios**, elige nombre, semilla y duración, prepara estímulos en Entorno y captúralos en un segundo concreto. Guarda y repite: la misma semilla produce el mismo resultado.
6. En **Proyecto**, exporta un JSON con configuración y biblioteca. `public/examples/dodo-twin-proyecto.json` sirve de ejemplo para importar.
7. En **Presentación**, elige fondo, luz y formato 16:9 o 9:16 y oculta los controles con **H** (vuelve con H o Esc) para grabar la pantalla. No exporta vídeo.
8. En **Técnica**, mira la distribución propuesta de la VENTUNO Q, los ocho motores conceptuales, la alimentación y los sensores.

**Pausa** congela la simulación. **Reiniciar** vuelve suavemente a neutro y reinicia entorno y reloj, sin borrar la biblioteca. **Parada** cancela la reproducción y retiene la posición virtual; no es una parada de emergencia física.

La biblioteca se guarda en este navegador con la clave `dodo-twin.project.v1`. No se sincroniza entre ordenadores ni entre la versión local y la publicada: exporta el proyecto para llevarlo de uno a otro.

## Arquitectura

| Capa | Archivos |
|---|---|
| Configuración central de articulaciones y unidades | `lib/dodo/config.ts` |
| Comportamiento (estados, semilla, estímulos) | `lib/dodo/behavior.ts` |
| Simulación de movimiento y adaptador físico pendiente | `lib/dodo/adapter.ts` |
| Motor: prioridades, paso fijo, secuencias, escenarios, pausa y parada | `lib/dodo/engine.ts` |
| Contrato de órdenes y telemetría 1.0 | `lib/dodo/protocol.ts`, `docs/PROTOCOL.md` |
| Modelo 3D procedural (sustituible sin tocar el control) | `lib/dodo/model.ts` |
| Distribución técnica propuesta | `lib/dodo/technical-layout.ts`, `lib/dodo/technical-model.ts` |
| Representación 3D | `components/dodo/viewport.tsx` |
| Interfaz | `components/dodo-app.tsx`, `components/dodo/panels.tsx`, `components/dodo/technical-panel.tsx` |
| Proceso sin navegador (futuro servicio en Linux de la VENTUNO Q) | `scripts/brain.ts` |

`lib/dodo` no depende del navegador ni de React: la misma lógica corre en la web y en `npm run brain`.

## Documentación

- [Anatomía y evidencia](docs/01-anatomia-y-evidencia.md): fuentes, proporciones y qué es evidencia frente a decisión artística.
- [Procedencia y licencia del modelo](docs/MODEL-ASSET.md).
- [VENTUNO Q y puente físico](docs/02-ventuno-q-y-puente.md).
- [Banco de pruebas de cabeza y cuello](docs/03-banco-cabeza-cuello.md).
- [Distribución técnica](docs/04-distribucion-tecnica.md).
- [Contrato de órdenes y telemetría](docs/PROTOCOL.md).
- [Validación, rendimiento y limitaciones](docs/VALIDATION.md).
- [Decisiones y suposiciones](docs/DECISIONES.md).

## Alcance físico pendiente

No se han seleccionado motores ni diseñado piezas imprimibles. Faltan cargas, equilibrio, colisiones, holguras, ruido, consumo, temperatura, calibración y validación de protecciones. Respiración y párpados son efectos visuales sin mecanismo definido. El modelo es una reconstrucción artística; no sustituye un CAD mecánico ni un estudio biomecánico. El siguiente paso físico es el banco de cabeza y cuello.
