# Ejecutar Pruebas estáticas con ESLint

- Pararse en la carpeta raiz "front-end"
- Ejecutar en la consola el comando `npx eslint . --ext .ts --format ./node_modules/eslint-formatter-html/index.js > ../tests/eslint/resultado_analisis3.html`

Archivo de configuración con detalles: `eslint.config.js` (en la carpeta front-end del proyecto)
Se puede instalar la extensión de ESLint en VS Code para que haga el análisis a medida que se escribe