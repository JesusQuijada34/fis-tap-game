/**
 * INTEGRACIÓN TON CONNECT - FIS TAP-TO-EARN
 * Gestión de la conexión con la wallet de TON.
 */

export const TonManager = {
    tonConnectUI: null,
    walletAddress: null,

    /**
     * Inicializa el componente TonConnect
     * @param {string} containerId ID del elemento contenedor
     */
    async init(containerId) {
        try {
            // Se asume que TonConnectUI se carga vía CDN en index.html
            if (typeof TonConnectUI === 'undefined') {
                console.warn("TonConnectUI no detectado. Cargando mock para desarrollo.");
                return;
            }

            this.tonConnectUI = new TonConnectUI.TonConnectUI({
                manifestUrl: 'https://raw.githubusercontent.com/JesusQuijada34/fis-tap-game/main/tonconnect-manifest.json',
                buttonRootId: containerId
            });

            this.tonConnectUI.onStatusChange(wallet => {
                if (wallet) {
                    this.walletAddress = wallet.account.address;
                    console.log("Wallet conectada:", this.walletAddress);
                    document.dispatchEvent(new CustomEvent('ton-wallet-connected', { detail: wallet }));
                } else {
                    this.walletAddress = null;
                    document.dispatchEvent(new CustomEvent('ton-wallet-disconnected'));
                }
            });

        } catch (error) {
            console.error("Error al inicializar TonConnect:", error);
        }
    },

    /**
     * Obtiene la dirección corta para mostrar en UI
     */
    getShortAddress() {
        if (!this.walletAddress) return null;
        return `${this.walletAddress.slice(0, 4)}...${this.walletAddress.slice(-4)}`;
    },

    /**
     * Simulación de transacción (para fines de demostración en el juego)
     */
    async requestTransaction(amount, destination) {
        if (!this.tonConnectUI || !this.walletAddress) {
            alert("Por favor, conecta tu wallet primero.");
            return false;
        }

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60,
            messages: [
                {
                    address: destination,
                    amount: (amount * 1000000000).toString(), // Convertir a nanoTON
                }
            ]
        };

        try {
            const result = await this.tonConnectUI.sendTransaction(transaction);
            return result;
        } catch (e) {
            console.error("Transacción fallida:", e);
            return false;
        }
    }
};
