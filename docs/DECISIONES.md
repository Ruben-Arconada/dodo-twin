# Decisiones y suposiciones · versión 1.1

Registro de la entrega del 28 de septiembre de 2026. Cada decisión indica por qué se tomó y cómo deshacerla. Ninguna fija motores, alimentación ni piezas imprimibles: eso queda para la fase de dimensionamiento y validación mecánica.

## Punto de partida

| Decisión | Motivo | Reversible |
|---|---|---|
| Partir del prototipo de Codex (`~/Documents/Codex/dodo-twin`, 28/09/2026 19:13) y reutilizar sin reescribir `lib/dodo/*`, `components/dodo/*`, pruebas y documentación. | Ya cumplía la mayor parte de los requisitos de la primera versión y sus 13 + 1 pruebas pasaban. | La carpeta original no se ha modificado. |
| Trabajar en una carpeta nueva (`Dodo Digital Twin`) que es el repositorio `Ruben-Arconada/dodo-twin`. | No mezclar la plantilla de ChatGPT Sites con el repositorio publicado. | Sí. |

## Migración a web estática

| Decisión | Motivo | Reversible |
|---|---|---|
| Vite 8 + React 19 + Three.js 0.180, sin Next.js/vinext, Cloudflare Workers, Wrangler, D1/Drizzle, `chatgpt-auth`, `.openai` ni `.sites-runtime`. | La aplicación no usaba nada del servidor; GitHub Pages solo sirve archivos estáticos. | El núcleo `lib/dodo` no depende del framework; se puede volver a montar en otro. |
| Conservar solo 7 componentes de interfaz (slider, switch, tabs, sheet, table, select, sonner) de los ~50 de la plantilla. | Eran los únicos importados. `sonner` deja de depender de `next-themes` y usa tema oscuro fijo. | Sí. |
| `base: '/dodo-twin/'` solo al compilar; en desarrollo, raíz. | La URL publicada es `https://ruben-arconada.github.io/dodo-twin/`; en local `http://localhost:5173/` funciona tal cual. | Cambiar `vite.config.ts` si se usa un dominio propio. |
| La documentación enlazada desde la app apunta a GitHub (`blob/main/docs/...`) en lugar de copiar los `.md` a `public/docs`. | GitHub renderiza Markdown y se evita mantener dos copias. | Sí; `lib/dodo/links.ts` centraliza las URL. |
| Repositorio **público**. | GitHub Pages desde un repositorio privado exige un plan de pago; la petición pedía publicar en Pages. | Se puede pasar a privado en GitHub, pero Pages dejaría de servirse con el plan gratuito. |
| Sin service worker (sin modo offline). | No se pidió. Evita el riesgo, ya sufrido en otros proyectos del mismo origen `ruben-arconada.github.io`, de borrar cachés ajenas. | Si se añade, la caché debe llamarse `dodo-twin-…` y el borrado limitarse a ese prefijo. |
| Almacenamiento local con clave `dodo-twin.project.v1` (y copias de recuperación `dodo-twin.project.v1.recovery.<fecha>`). | Todas las webs de `ruben-arconada.github.io` comparten origen y `localStorage`; el prefijo evita pisar datos de otros proyectos. | — |
| En desarrollo, `window.__dodo` expone escena, cámara y modelo para inspección. | Permite medir el modelo y comprobar encuadres. No existe en la compilación publicada (`import.meta.env.DEV`). | Sí. |
| Aviso de Vite sobre tamaño de paquete elevado a 1,4 MB. | Three.js ocupa la mayor parte (~1 MB, ~281 kB gzip). | Separar Three.js en otro chunk si la carga inicial resulta lenta. |

## Modelo 3D (revisión 02)

| Decisión | Motivo | Reversible |
|---|---|---|
| Mantener los 8 identificadores, ejes, jerarquía y posiciones de pivote. | Requisito: el control no debe rehacerse; la vista Técnica y el contrato dependen de ellos. | — |
| Redibujar pico, cara, alas, cola y patas; bajar el vientre. | Se leían como pico poco característico, alas-disco, cola de tarjetas y patas largas y finas. Evidencia y decisiones en `01-anatomia-y-evidencia.md`. | La revisión 01 sigue en el prototipo original y en el historial de git. |
| Altura de referencia 700 mm (medida: 696 mm). | NHM ≈70 cm; síntesis moderna 62,6–75 cm; Oxford 1 m. Queda dentro del rango moderno. | `scale_m` se valida como 0,7 en los proyectos v1.0; cambiarlo requiere versión nueva del formato. |
| Colores del pico: vaina oscura, verde claro y amarillo pálido distales. | Relatos y representaciones citan «verde, negro y amarillo». El reparto exacto es artístico. | Parámetros en `billGeometry`. |

## Comportamiento y hardware (sin cambios de lógica)

- El comportamiento, límites, escenarios y protocolo 1.0 son los del prototipo; se han verificado de nuevo con las pruebas automáticas y en el navegador.
- VENTUNO Q sigue como primera opción. Ficha oficial reconsultada el 28/09/2026: Qualcomm Dragonwing IQ8 (QCS8275) con Ubuntu y STM32H5F5 a 250 MHz (4 MB flash, 1,5 MB RAM), biblioteca RPC integrada, cabeceras UNO, Qwiic, 40 pines y conectores JMEDIA/JMISC/JOMEGA. No hay placa conectada: `PhysicalAdapter.connect()` falla a propósito y la telemetría real es `null`.
- El proceso `npm run brain` demuestra que el comportamiento corre en Node sin navegador; todavía no se comunica con la web ni con la placa.

## Suposiciones abiertas

1. Las proporciones de patas y cuello no se han cotejado con medidas óseas publicadas (artículos consultados devolvieron 403). Antes de fabricar, obtener longitudes de fémur, tibiotarso y tarsometatarso.
2. Los límites de las articulaciones son envolventes de simulación, no recorridos mecánicos.
3. Los colores del plumaje y del pico son una interpretación; no hay piel ni plumaje completos conservados.
4. El rendimiento medido es el del Mac de desarrollo y del navegador integrado; no se ha probado en móviles físicos.
