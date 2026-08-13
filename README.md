# FIS Tap Game

FIS Tap Game es una aplicación web Flask/SQLAlchemy orientada a una Telegram Mini App. Implementa un juego de toque con **30 rangos**, **6 ligas**, experiencia, saldo interno y requisitos de referidos. El frontend puede usar una estética móvil tipo glassmorphism, pero el backend es la fuente de verdad para el estado del jugador.

## Estado técnico importante

El saldo FIS de este repositorio es un valor interno de la aplicación. La ruta `/api/retirar-fis` registra una deducción local; **no existe una integración TON que firme o envíe transacciones**, por lo que el sistema no debe anunciar retiros en la red como si ya estuvieran ejecutándose.

Antes de desplegarlo con usuarios reales debe añadirse verificación de `initData` de Telegram en el servidor. No se debe confiar únicamente en `telegram_id` o `user_id` enviados por el cliente, y las rutas de juego requieren límites de frecuencia y controles antifraude adicionales.

## Instalación

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
export DATABASE_URL=sqlite:///fis_game.db
python app.py
```

En producción, usa PostgreSQL, un servidor WSGI como Gunicorn, `FLASK_ENV` distinto de `development` y secretos mediante variables de entorno. No guardes tokens de Telegram ni claves de billetera en el repositorio.

## API principal

`POST /api/user/init` crea o recupera un usuario; `POST /api/tap` procesa un toque; `POST /api/ascender-rango` valida el coste de ascenso; `POST /api/retirar-fis` valida un importe positivo y saldo suficiente, pero solo registra el retiro localmente; `GET /api/config` devuelve la matriz de rangos.

La prueba `smoke_test.py` verifica el arranque con SQLite temporal, la matriz de 30 rangos y el rechazo de importes negativos, cero, no finitos o no numéricos. No realiza operaciones financieras externas.

## Plataforma y paquete

El proyecto es código fuente web y se clasifica como **AlphaCube**, no como Debian Danenone. El artefacto fuente debe conservar el formato:

```text
JesusQuijada34.fis-tap-game.v1.0-26.08-23.43-AlphaCube.iflapp
```

Revisa la normativa aplicable y las condiciones de cualquier red blockchain antes de añadir depósitos, retiros o conversión de saldos con valor económico.
