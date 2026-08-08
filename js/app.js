import GAME_CONFIG from './config.js';
import { VisualEngine } from './engine.js';
import { TonManager } from './ton-connect.js';

/**
 * LÓGICA PRINCIPAL DE LA APLICACIÓN
 */
const App = {
    state: {
        points: 0,
        rankIndex: 0, // 0 to 29
        referrals: 0,
        totalTaps: 0,
        isLoggedIn: false
    },

    init() {
        this.loadState();
        this.setupEventListeners();
        this.updateUI();
        
        // Inicializar efectos visuales
        const mainCard = document.querySelector('.glass-card');
        VisualEngine.initTiltEffect(mainCard);

        // Inicializar TON Connect
        TonManager.init('ton-connect-btn');
    },

    loadState() {
        const saved = localStorage.getItem('fis_game_state');
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
        }
    },

    saveState() {
        localStorage.setItem('fis_game_state', JSON.stringify(this.state));
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

    handleTap(e) {
        const currentRank = GAME_CONFIG.RANKS[this.state.rankIndex];
        const pointsToAdd = parseFloat(currentRank.multiplier);
        
        this.state.points += pointsToAdd;
        this.state.totalTaps += 1;
        
        // Feedback visual
        VisualEngine.createFloatingText(e.clientX, e.clientY, `+${pointsToAdd}`, document.body);
        VisualEngine.triggerHaptic();
        
        this.updateUI();
        this.saveState();
    },

    handleUpgrade() {
        const nextRankIndex = this.state.rankIndex + 1;
        if (nextRankIndex >= 30) {
            alert("¡Ya has alcanzado el Rango Máximo: El Padrino Supremo!");
            return;
        }

        const nextRank = GAME_CONFIG.RANKS[nextRankIndex];
        if (this.state.points >= nextRank.upgradeCost) {
            this.state.points -= nextRank.upgradeCost;
            this.state.rankIndex = nextRankIndex;
            
            alert(`¡Felicidades! Has ascendido a: ${nextRank.name}`);
            this.updateUI();
            this.saveState();
        } else {
            alert(`Necesitas ${nextRank.upgradeCost} FIS para subir de rango.`);
        }
    },

    handleWithdrawal() {
        const currentRank = GAME_CONFIG.RANKS[this.state.rankIndex];
        
        // Regla: 1er retiro de 2.00 FIS es gratis
        if (this.state.points >= 2.00 && !localStorage.getItem('first_withdrawal_done')) {
            alert("¡Primer retiro de 2.00 FIS exitoso! (Promoción inicial)");
            this.state.points -= 2.00;
            localStorage.setItem('first_withdrawal_done', 'true');
            this.updateUI();
            this.saveState();
            return;
        }

        // Retiros posteriores
        if (this.state.referrals < currentRank.referralsNeeded) {
            alert(`Tu rango actual (${currentRank.name}) requiere ${currentRank.referralsNeeded} referidos para retirar. ¡Sigue subiendo de rango para reducir este requisito!`);
        } else {
            alert("Solicitud de retiro enviada a la red TON.");
        }
    },

    updateUI() {
        const currentRank = GAME_CONFIG.RANKS[this.state.rankIndex];
        const nextRank = GAME_CONFIG.RANKS[this.state.rankIndex + 1] || currentRank;

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

        // Actualizar barra de progreso (simulada hacia el siguiente rango)
        const progress = (this.state.points / nextRank.upgradeCost) * 100;
        document.querySelector('.progress-fill').style.width = `${Math.min(100, progress)}%`;

        // Cambiar tema visual según liga
        this.updateLeagueTheme(currentRank.league);
    },

    updateLeagueTheme(leagueName) {
        const league = GAME_CONFIG.LEAGUES.find(l => l.name === leagueName);
        if (league) {
            document.documentElement.style.setProperty('--accent-neon', league.color);
            document.documentElement.style.setProperty('--accent-blue', league.color);
        }
    }
};

// Iniciar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());
