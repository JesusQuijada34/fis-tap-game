import { VisualEngine } from './engine.js';
import { TonManager } from './ton-connect.js';

/**
 * LÓGICA PRINCIPAL DE LA APLICACIÓN - CONSUMIENDO API FLASK
 */
const App = {
    state: {
        user_id: null,
        telegram_id: null,
        points: 0,
        rankIndex: 0,
        referrals: 0,
        totalTaps: 0,
        isLoggedIn: false,
        multiplier: 1.0
    },

    async init() {
        // Inicializar usuario
        await this.initializeUser();
        
        // Cargar configuración del juego
        await this.loadGameConfig();
        
        this.setupEventListeners();
        this.updateUI();
        
        // Inicializar efectos visuales
        const mainCard = document.querySelector('.glass-card');
        VisualEngine.initTiltEffect(mainCard);

        // Inicializar TON Connect
        TonManager.init('ton-connect-btn');
    },

    async initializeUser() {
        try {
            // Obtener telegram_id desde Telegram WebApp
            let telegram_id = 'user_' + Math.random().toString(36).substr(2, 9);
            let username = 'Usuario';

            if (window.Telegram && window.Telegram.WebApp) {
                const tgUser = window.Telegram.WebApp.initData;
                if (tgUser) {
                    telegram_id = tgUser.user?.id || telegram_id;
                    username = tgUser.user?.first_name || 'Usuario';
                }
            }

            const response = await fetch('/api/user/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegram_id, username })
            });

            const data = await response.json();
            
            if (data.success) {
                this.state.user_id = data.user_id;
                this.state.telegram_id = data.telegram_id;
                this.state.points = data.saldo_fis;
                this.state.rankIndex = data.rango - 1;
                this.state.referrals = data.referrals;
                this.state.multiplier = data.multiplier;
                this.state.isLoggedIn = true;
            }
        } catch (error) {
            console.error('Error inicializando usuario:', error);
        }
    },

    async loadGameConfig() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            window.GAME_CONFIG = config;
        } catch (error) {
            console.error('Error cargando configuración:', error);
        }
    },

    setupEventListeners() {
        const coin = document.querySelector('.main-coin');
        if (coin) {
            coin.addEventListener('pointerdown', (e) => this.handleTap(e));
        }

        const upgradeBtn = document.querySelector('#upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => this.handleUpgrade());
        }

        const withdrawBtn = document.querySelector('#withdraw-btn');
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', () => this.handleWithdrawal());
        }

        document.addEventListener('ton-wallet-connected', () => {
            this.state.isLoggedIn = true;
            this.updateUI();
        });
    },

    async handleTap(e) {
        if (!this.state.user_id) return;

        try {
            const response = await fetch('/api/tap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: this.state.user_id })
            });

            const data = await response.json();
            
            if (data.success) {
                this.state.points = data.total_balance;
                this.state.totalTaps += 1;
                
                // Feedback visual
                VisualEngine.createFloatingText(e.clientX, e.clientY, `+${data.points_earned}`, document.body);
                VisualEngine.triggerHaptic();
                
                this.updateUI();
            }
        } catch (error) {
            console.error('Error en tap:', error);
        }
    },

    async handleUpgrade() {
        if (!this.state.user_id) return;

        try {
            const response = await fetch('/api/ascender-rango', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: this.state.user_id })
            });

            const data = await response.json();
            
            if (data.success) {
                this.state.points = data.remaining_balance;
                this.state.rankIndex = data.new_rank - 1;
                this.state.multiplier = data.new_multiplier;
                
                alert(`¡Felicidades! Has ascendido a: ${data.new_rank_name}`);
                this.updateUI();
            } else {
                alert(data.error || 'No se pudo ascender de rango');
            }
        } catch (error) {
            console.error('Error en ascenso:', error);
        }
    },

    async handleWithdrawal() {
        if (!this.state.user_id) return;

        const amount = parseFloat(prompt('¿Cuánto FIS deseas retirar?'));
        if (isNaN(amount) || amount <= 0) return;

        try {
            const response = await fetch('/api/retirar-fis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: this.state.user_id, amount })
            });

            const data = await response.json();
            
            if (data.success) {
                this.state.points = data.remaining_balance;
                alert(data.message);
                this.updateUI();
            } else {
                alert(data.error + ': ' + data.message);
            }
        } catch (error) {
            console.error('Error en retiro:', error);
        }
    },

    updateUI() {
        if (!window.GAME_CONFIG) return;

        const currentRank = window.GAME_CONFIG.RANKS[this.state.rankIndex];
        const nextRank = window.GAME_CONFIG.RANKS[Math.min(this.state.rankIndex + 1, 29)];

        // Actualizar textos
        document.querySelector('#points-display').innerText = this.state.points.toFixed(2);
        document.querySelector('#rank-name').innerText = currentRank.name;
        document.querySelector('#league-name').innerText = currentRank.league;
        document.querySelector('#multiplier-display').innerText = `x${currentRank.multiplier}`;
        document.querySelector('#ref-needed').innerText = currentRank.referralsNeeded;
        
        // Actualizar botón de upgrade
        const upgradeBtn = document.querySelector('#upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.innerText = this.state.rankIndex < 29 ? `Subir a ${nextRank.name} (${nextRank.upgradeCost} FIS)` : "Rango Máximo";
        }

        // Actualizar barra de progreso
        const progress = (this.state.points / nextRank.upgradeCost) * 100;
        document.querySelector('.progress-fill').style.width = `${Math.min(100, progress)}%`;

        // Cambiar tema visual según liga
        this.updateLeagueTheme(currentRank.league);
    },

    updateLeagueTheme(leagueName) {
        const league = window.GAME_CONFIG.LEAGUES.find(l => l.name === leagueName);
        if (league) {
            document.documentElement.style.setProperty('--accent-neon', league.color);
            document.documentElement.style.setProperty('--accent-blue', league.color);
        }
    }
};

// Iniciar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());
