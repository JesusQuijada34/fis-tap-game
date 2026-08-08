/**
 * CONFIGURACIÓN DE RANGOS Y LIGAS - FIS TAP-TO-EARN
 * Definición de la matriz de progresión del jugador.
 */

const GAME_CONFIG = {
    TOKEN_NAME: "FIS",
    INITIAL_WITHDRAWAL_FREE: 2.00,
    MAX_REFERRALS_REQUIRED: 30,
    LEAGUES: [
        { id: 1, name: "Huevo de Pez", minRank: 1, maxRank: 5, color: "#38bdf8" },
        { id: 2, name: "Alevín", minRank: 6, maxRank: 10, color: "#4ade80" },
        { id: 3, name: "Nadador", minRank: 11, maxRank: 15, color: "#fbbf24" },
        { id: 4, name: "Depredador", minRank: 16, maxRank: 20, color: "#f87171" },
        { id: 5, name: "Tiburón", minRank: 21, maxRank: 25, color: "#a78bfa" },
        { id: 6, name: "El Padrino Supremo", minRank: 26, maxRank: 30, color: "#f472b6" }
    ],
    RANKS: []
};

// Generación de la matriz de 30 rangos
function generateRanks() {
    const names = [
        "Huevo de Pez I", "Huevo de Pez II", "Huevo de Pez III", "Huevo de Pez IV", "Huevo de Pez V",
        "Alevín I", "Alevín II", "Alevín III", "Alevín IV", "Alevín V",
        "Nadador I", "Nadador II", "Nadador III", "Nadador IV", "Nadador V",
        "Depredador I", "Depredador II", "Depredador III", "Depredador IV", "Depredador V",
        "Tiburón I", "Tiburón II", "Tiburón III", "Tiburón IV", "Tiburón V",
        "Padrino I", "Padrino II", "Padrino III", "Padrino IV", "El Padrino Supremo"
    ];

    for (let i = 0; i < 30; i++) {
        const rankLevel = i + 1;
        const leagueIndex = Math.floor(i / 5);
        
        GAME_CONFIG.RANKS.push({
            level: rankLevel,
            name: names[i],
            league: GAME_CONFIG.LEAGUES[leagueIndex].name,
            upgradeCost: Math.floor(10 * Math.pow(1.5, i)), // Costo incremental
            referralsNeeded: Math.max(0, 30 - i), // Reducción de 30 a 0
            multiplier: (1 + (i * 0.2)).toFixed(1) // Multiplicador de puntos
        });
    }
}

generateRanks();

export default GAME_CONFIG;
