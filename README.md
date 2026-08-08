# FIS Tap-to-Earn Telegram Mini App

## Resumen Ejecutivo

**FIS Tap-to-Earn** es una aplicación descentralizada de alto rendimiento desarrollada en **HTML5 semántico, CSS3 nativo y JavaScript moderno (ES6+)**, diseñada específicamente como una **Telegram Mini App** integrada con la red **TON (The Open Network)**. Su diseño visual se inspira en una estética **Glassmorphic** de alta gama, proporcionando una experiencia de usuario fluida, interactiva y optimizada para dispositivos móviles.

El ecosistema gira en torno al **Token FIS**, implementando un motor de minería por toque (*tap-to-earn*), un sistema de progresión de **30 rangos distribuidos en 6 ligas competitivas**, y un mecanismo inteligente de quema de tokens y requisitos de referidos para la gestión de retiros.

---

## Estructura del Repositorio

La arquitectura del proyecto se organiza de forma modular para garantizar mantenibilidad, velocidad de carga instantánea y facilidad de despliegue:

```text
/ (Raíz del proyecto)
├── index.html               # Estructura HTML5 de la Mini App
├── css/
│   ├── glassmorphism.css    # Estilos globales, Blur, Variables CSS y Animaciones
│   └── game.css             # Estilos de la interfaz del juego, moneda y tienda
├── js/
│   ├── config.js            # Matriz de los 30 Rangos, Ligas y Requisitos
│   ├── engine.js            # Física 3D, animación de partículas y eventos de toque
│   ├── ton-connect.js       # Integración con TonConnect / Wallets de TON
│   └── app.js               # Lógica principal de puntos, login y retiros
├── assets/                  # Iconos y elementos vectoriales SVG (fis-token.svg)
├── tonconnect-manifest.json # Manifiesto para la integración con TonConnect
└── README.md                # Documentación del proyecto
```

---

## Especificaciones Técnicas y de Diseño

### 1. Interfaz Gráfica (Glassmorphism)
La interfaz implementa un diseño translúcido avanzado mediante las siguientes propiedades CSS nativas:
- **Efecto de cristal esmerilado**: `backdrop-filter: blur(24px) saturate(1.35);`
- **Bordes y sombras ambientales**: Bordes sutiles con `border: 1px solid rgba(255, 255, 255, 0.18)` y esquinas redondeadas de `26px`.
- **Inclinación 3D interactiva**: El motor visual calcula en tiempo real los eventos de puntero (`pointermove`) para aplicar una transformación en perspectiva 3D sobre la tarjeta principal.

### 2. Sistema de 30 Rangos y 6 Ligas
El juego estructura la progresión del usuario a través de una matriz algorítmica de 30 rangos divididos equitativamente en 6 ligas:

| Liga | Rango de Niveles | Color Temático | Requisito de Referidos (Inicio a Fin) |
| :--- | :--- | :--- | :--- |
| **Huevo de Pez** | 1 - 5 | `#38bdf8` (Azul Neón) | 30 ➔ 26 |
| **Alevín** | 6 - 10 | `#4ade80` (Verde Esmeralda) | 25 ➔ 21 |
| **Nadador** | 11 - 15 | `#fbbf24` (Ámbar) | 20 ➔ 16 |
| **Depredador** | 16 - 20 | `#f87171` (Coral) | 15 ➔ 11 |
| **Tiburón** | 21 - 25 | `#a78bfa` (Púrpura) | 10 ➔ 6 |
| **El Padrino Supremo** | 26 - 30 | `#f472b6` (Rosa Neón) | 5 ➔ 0 |

*Nota: A medida que el jugador asciende de rango mediante la quema de tokens FIS, el requisito de referidos para realizar retiros disminuye progresivamente desde 30 hasta 0.*

### 3. Integración con la Red TON (TonConnect)
La aplicación se conecta de forma nativa con el SDK `@tonconnect/ui`, permitiendo autenticación segura mediante billeteras de la red TON (como Tonkeeper, MyTonWallet, etc.) y la firma de transacciones en la red principal o de prueba.

---

## Guía de Instalación y Despliegue en Telegram

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/JesusQuijada34/fis-tap-game.git
   cd fis-tap-game
   ```

2. **Servir de forma local**:
   Puedes utilizar cualquier servidor estático (por ejemplo, `live-server` o Python):
   ```bash
   python3 -m http.server 8080
   ```

3. **Configuración en Telegram**:
   - Crea un bot en Telegram a través de [@BotFather](https://t.me/BotFather).
   - Configura el comando `/newapp` y proporciona la URL HTTPS donde esté alojada la Mini App (por ejemplo, desplegada en GitHub Pages, Vercel o Netlify).
   - Asocia el bot al repositorio bajo el usuario **JesusQuijada34**.
