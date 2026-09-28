#!/bin/zsh
# Doble clic en macOS: instala dependencias si faltan y abre el simulador en local.
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  npm ci || exit 1
fi
print 'Dodo Twin: se abrirá http://localhost:5173/ — mantén esta ventana abierta mientras lo usas.'
(sleep 2 && open http://localhost:5173/) &
npm run dev -- --port 5173
