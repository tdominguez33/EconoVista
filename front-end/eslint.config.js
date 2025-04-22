// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Reglas Personalizadas:

      // 1. Nombres de clases en PascalCase
      //    - Se requiere que todas las clases sigan la convención PascalCase (primera letra de cada palabra en mayúsculas).
      //    - Las clases de componentes deben terminar con "Component" (ej. AlertaComponent).
      //    - Las clases de servicios deben terminar con "Service" (ej. AlertaService).
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "class",
          "format": ["PascalCase"], // Convención PascalCase para todas las clases
        },
        {
          "selector": "class",
          "filter": {
            "regex": "Component$",
            "match": true
          },
          "format": ["PascalCase"], // Las clases de componentes deben terminar en "Component"
          "custom": {
            "regex": "^[A-Z][a-zA-Z0-9]*Component$",
            "match": true
          }
        },
        {
          "selector": "class",
          "filter": {
            "regex": "Service$",
            "match": true
          },
          "format": ["PascalCase"], // Las clases de servicios deben terminar en "Service"
          "custom": {
            "regex": "^[A-Z][a-zA-Z0-9]*Service$",
            "match": true
          }
        },
      ],

      // 2. Uso de console
      //    - Se prohíbe el uso de console.log(), pero se permiten los métodos console.warn() y console.error().
      "no-console": [
        "error", 
        { 
          "allow": ["warn", "error"] 
        }
      ],

      // 3. Líneas de código
      //    - Advertencia si una clase o archivo supera las 300 líneas, ignorando los comentarios.
      "max-lines": [
        "warn", 
        { 
          "max": 300, 
          "skipComments": true 
        }
      ],

      // 4. Variables no usadas
      //    - Advertencia cuando existen variables no utilizadas en el código.
      "@typescript-eslint/no-unused-vars": "warn", // Solo advertencia

      // 5. Uso de const
      //    - Se recomienda usar const en lugar de let cuando la variable no cambia.
      "prefer-const": "warn",

      // 6. Uso de any en TypeScript
      //    - Desactivada la regla que prohíbe el uso de any en TypeScript, por lo que se permite usar este tipo sin restricciones.
      "@typescript-eslint/no-explicit-any": "off"
    },
  },
);