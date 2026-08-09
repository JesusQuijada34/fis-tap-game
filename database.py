from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    telegram_id = db.Column(db.String(64), unique=True, nullable=False)
    username = db.Column(db.String(128), nullable=True)
    wallet_ton = db.Column(db.String(128), nullable=True)
    saldo_fis = db.Column(db.Float, default=0.0)
    primer_retiro_completado = db.Column(db.Boolean, default=False)
    deposito_usd_acumulado = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relación con el estado del personaje
    character_state = db.relationship('CharacterState', backref='user', uselist=False, cascade="all, delete-orphan")

class CharacterState(db.Model):
    __tablename__ = 'character_states'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rango_id = db.Column(db.Integer, default=1) # 1 al 30
    nivel = db.Column(db.Integer, default=1)
    experiencia_actual = db.Column(db.Float, default=0.0)
    multiplicador = db.Column(db.Float, default=1.0)

class Referral(db.Model):
    __tablename__ = 'referrals'
    
    id = db.Column(db.Integer, primary_key=True)
    referente_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    referido_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
