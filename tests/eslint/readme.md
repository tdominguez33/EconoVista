# Ejecutar Pruebas estáticas con ESLint

- Instalar "eslint"
- Instalar "angular-eslint" con `npm i angular-eslint`
- Pararse en la carpeta raiz "front-end"
- Ejecutar en la consola el comando `npx eslint . --ext .ts --format ./node_modules/eslint-formatter-html/index.js > ../tests/eslint/resultado_analisis.html`

Archivo de configuración con detalles: `eslint.config.js` (en la carpeta front-end del proyecto)

Se puede instalar la extensión de ESLint en VS Code para que haga el análisis a medida que se escribe