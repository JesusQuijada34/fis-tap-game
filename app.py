import os
import json
from flask import Flask, render_template, request, jsonify
from database import db, User, CharacterState, Referral
from datetime import datetime

app = Flask(__name__)

# Configuración de la base de datos
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///fis_game.db')
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Matriz de 30 Rangos y 6 Ligas
GAME_CONFIG = {
    "TOKEN_NAME": "FIS",
    "INITIAL_WITHDRAWAL_FREE": 2.00,
    "MAX_REFERRALS_REQUIRED": 30,
    "LEAGUES": [
        {"id": 1, "name": "Huevo de Pez", "minRank": 1, "maxRank": 5, "color": "#38bdf8"},
        {"id": 2, "name": "Alevín", "minRank": 6, "maxRank": 10, "color": "#4ade80"},
        {"id": 3, "name": "Nadador", "minRank": 11, "maxRank": 15, "color": "#fbbf24"},
        {"id": 4, "name": "Depredador", "minRank": 16, "maxRank": 20, "color": "#f87171"},
        {"id": 5, "name": "Tiburón", "minRank": 21, "maxRank": 25, "color": "#a78bfa"},
        {"id": 6, "name": "El Padrino Supremo", "minRank": 26, "maxRank": 30, "color": "#f472b6"}
    ],
    "RANKS": []
}

# Generar matriz de 30 rangos
def generate_ranks():
    names = [
        "Huevo de Pez I", "Huevo de Pez II", "Huevo de Pez III", "Huevo de Pez IV", "Huevo de Pez V",
        "Alevín I", "Alevín II", "Alevín III", "Alevín IV", "Alevín V",
        "Nadador I", "Nadador II", "Nadador III", "Nadador IV", "Nadador V",
        "Depredador I", "Depredador II", "Depredador III", "Depredador IV", "Depredador V",
        "Tiburón I", "Tiburón II", "Tiburón III", "Tiburón IV", "Tiburón V",
        "Padrino I", "Padrino II", "Padrino III", "Padrino IV", "El Padrino Supremo"
    ]

    for i in range(30):
        rank_level = i + 1
        league_index = i // 5
        
        GAME_CONFIG["RANKS"].append({
            "level": rank_level,
            "name": names[i],
            "league": GAME_CONFIG["LEAGUES"][league_index]["name"],
            "upgradeCost": int(10 * (1.5 ** i)),
            "referralsNeeded": max(0, 30 - i),
            "multiplier": round(1 + (i * 0.2), 1)
        })

generate_ranks()

@app.route('/')
def index():
    """Servir la vista principal del juego"""
    return render_template('index.html')

@app.route('/api/user/init', methods=['POST'])
def user_init():
    """Registrar o autenticar al usuario al abrir la Telegram Mini App"""
    data = request.get_json()
    telegram_id = data.get('telegram_id')
    username = data.get('username', 'Usuario')
    
    if not telegram_id:
        return jsonify({'error': 'telegram_id requerido'}), 400
    
    # Buscar o crear usuario
    user = User.query.filter_by(telegram_id=telegram_id).first()
    
    if not user:
        user = User(telegram_id=telegram_id, username=username)
        db.session.add(user)
        db.session.commit()
        
        # Crear estado inicial del personaje
        char_state = CharacterState(user_id=user.id)
        db.session.add(char_state)
        db.session.commit()
    
    # Obtener estado actual
    char_state = user.character_state
    current_rank = GAME_CONFIG["RANKS"][char_state.rango_id - 1]
    
    # Contar referidos
    referral_count = Referral.query.filter_by(referente_id=user.id).count()
    
    return jsonify({
        'success': True,
        'user_id': user.id,
        'telegram_id': user.telegram_id,
        'username': user.username,
        'saldo_fis': user.saldo_fis,
        'rango': char_state.rango_id,
        'rango_name': current_rank['name'],
        'league': current_rank['league'],
        'multiplier': current_rank['multiplier'],
        'referrals': referral_count,
        'referrals_needed': current_rank['referralsNeeded'],
        'primer_retiro_completado': user.primer_retiro_completado
    }), 200

@app.route('/api/tap', methods=['POST'])
def handle_tap():
    """Procesar eventos de minado"""
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    char_state = user.character_state
    current_rank = GAME_CONFIG["RANKS"][char_state.rango_id - 1]
    
    # Sumar puntos según multiplicador
    points_earned = current_rank['multiplier']
    user.saldo_fis += points_earned
    char_state.experiencia_actual += points_earned
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'points_earned': points_earned,
        'total_balance': user.saldo_fis,
        'experience': char_state.experiencia_actual,
        'multiplier': current_rank['multiplier']
    }), 200

@app.route('/api/ascender-rango', methods=['POST'])
def ascend_rank():
    """Validar y procesar ascenso de rango"""
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    char_state = user.character_state
    next_rank_index = char_state.rango_id
    
    if next_rank_index >= 30:
        return jsonify({'error': 'Ya alcanzaste el rango máximo'}), 400
    
    next_rank = GAME_CONFIG["RANKS"][next_rank_index]
    
    # Validar recursos
    if user.saldo_fis < next_rank['upgradeCost']:
        return jsonify({
            'error': 'Saldo insuficiente',
            'required': next_rank['upgradeCost'],
            'current': user.saldo_fis
        }), 400
    
    # Descontar costo y subir rango
    user.saldo_fis -= next_rank['upgradeCost']
    char_state.rango_id += 1
    char_state.multiplicador = GAME_CONFIG["RANKS"][char_state.rango_id - 1]['multiplier']
    
    db.session.commit()
    
    new_rank = GAME_CONFIG["RANKS"][char_state.rango_id - 1]
    
    return jsonify({
        'success': True,
        'new_rank': char_state.rango_id,
        'new_rank_name': new_rank['name'],
        'new_league': new_rank['league'],
        'new_multiplier': new_rank['multiplier'],
        'remaining_balance': user.saldo_fis,
        'referrals_needed': new_rank['referralsNeeded']
    }), 200

@app.route('/api/retirar-fis', methods=['POST'])
def withdraw_fis():
    """Procesar retiro de FIS"""
    data = request.get_json()
    user_id = data.get('user_id')
    amount = data.get('amount', 0.0)
    
    if not user_id:
        return jsonify({'error': 'user_id requerido'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    char_state = user.character_state
    current_rank = GAME_CONFIG["RANKS"][char_state.rango_id - 1]
    referral_count = Referral.query.filter_by(referente_id=user.id).count()
    
    # Validar primer retiro (2.00 FIS gratis)
    if not user.primer_retiro_completado and amount == 2.00:
        user.saldo_fis -= amount
        user.primer_retiro_completado = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Primer retiro de 2.00 FIS completado (promoción inicial)',
            'amount': amount,
            'remaining_balance': user.saldo_fis
        }), 200
    
    # Validar retiros posteriores
    if referral_count < current_rank['referralsNeeded']:
        return jsonify({
            'error': 'Requisitos no cumplidos',
            'message': f"Tu rango ({current_rank['name']}) requiere {current_rank['referralsNeeded']} referidos. Tienes {referral_count}.",
            'referrals_needed': current_rank['referralsNeeded'],
            'referrals_current': referral_count
        }), 400
    
    # Validar saldo
    if user.saldo_fis < amount:
        return jsonify({
            'error': 'Saldo insuficiente',
            'required': amount,
            'current': user.saldo_fis
        }), 400
    
    # Procesar retiro
    user.saldo_fis -= amount
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Solicitud de retiro enviada a la red TON',
        'amount': amount,
        'remaining_balance': user.saldo_fis
    }), 200

@app.route('/api/config', methods=['GET'])
def get_config():
    """Obtener configuración del juego"""
    return jsonify(GAME_CONFIG), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    port = int(os.getenv('PORT', 5000))
    app.run(debug=os.getenv('FLASK_ENV') == 'development', host='0.0.0.0', port=port)
