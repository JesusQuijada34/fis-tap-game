/**
 * MOTOR VISUAL - FIS TAP-TO-EARN
 * Manejo de animaciones, partículas y efectos 3D.
 */

export const VisualEngine = {
    /**
     * Aplica efecto de inclinación 3D a un elemento
     * @param {HTMLElement} element 
     */
    initTiltEffect(element) {
        if (!element) return;

        element.addEventListener('pointermove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Máximo 10 grados
            const rotateY = ((x - centerX) / centerX) * 10;
            
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        element.addEventListener('pointerleave', () => {
            element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    },

    /**
     * Crea una partícula de texto flotante (+FIS)
     * @param {number} x Coordenada X
     * @param {number} y Coordenada Y
     * @param {string} text Texto a mostrar
     * @param {HTMLElement} container Contenedor
     */
    createFloatingText(x, y, text, container) {
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.innerText = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        
        // Aleatoriedad ligera en la posición
        const randomX = (Math.random() - 0.5) * 40;
        el.style.marginLeft = `${randomX}px`;

        container.appendChild(el);

        // Limpieza automática
        setTimeout(() => {
            el.remove();
        }, 800);
    },

    /**
     * Vibración háptica (si está disponible en Telegram)
     */
    triggerHaptic() {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        } else if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }
};
