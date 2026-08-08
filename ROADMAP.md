# Roadmap del Proyecto: FIS Tap-to-Earn Telegram Mini App

Este documento detalla la arquitectura y el plan de implementación para la Mini App de Telegram basada en el Token FIS.

## 1. Arquitectura de Archivos
- `index.html`: Estructura base con contenedores Glassmorphic.
- `css/glassmorphism.css`: Estilos de diseño visual (efecto blur, bordes translúcidos, sombras neón).
- `css/game.css`: Estilos específicos del juego (moneda 3D, barra de progreso, menús).
- `js/config.js`: Definición de la matriz de 30 rangos y 6 ligas.
- `js/engine.js`: Lógica de animaciones (partículas, inclinación 3D, feedback visual).
- `js/ton-connect.js`: Integración con la SDK de TonConnect para wallets TON.
- `js/app.js`: Lógica central (gestión de puntos, guardado local, lógica de referidos y retiros).
- `README.md`: Documentación técnica y guía de despliegue.

## 2. Definición de Ligas y Rangos
Se implementará una matriz de 30 niveles divididos en 6 ligas:
1. **Liga Huevo de Pez**: Rangos 1-5.
2. **Liga Alevín**: Rangos 6-10.
3. **Liga Nadador**: Rangos 11-15.
4. **Liga Depredador**: Rangos 16-20.
5. **Liga Tiburón**: Rangos 21-25.
6. **Liga El Padrino Supremo**: Rangos 26-30.

## 3. Características Técnicas
- **UI/UX**: Glassmorphism puro con `backdrop-filter` y animaciones `cubic-bezier`.
- **Interacción**: Efecto de inclinación 3D en la tarjeta principal basado en el movimiento del puntero.
- **Economía**: Sistema de quemado de tokens FIS para subir de rango y reducción de requisitos de referidos.
- **Integración**: Uso de `@tonconnect/ui` para conexión de billeteras.

## 4. Plan de Ejecución
1. Configuración de estilos base y variables CSS.
2. Definición de la lógica de datos en `config.js`.
3. Implementación del motor visual en `engine.js`.
4. Desarrollo de la lógica de aplicación en `app.js`.
5. Maquetación final en `index.html`.
6. Pruebas de integración y publicación en GitHub.
