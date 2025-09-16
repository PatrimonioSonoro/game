// Main Application Entry Point
class PatrimonioSonoroApp {
    constructor() {
        this.game = null;
        this.ui = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Initialize UI animations
            UI.addAnimationStyles();

            // Initialize game instance
            this.game = new ColombianMusicGame();
            
            // Set up global game reference for UI
            window.game = this.game;

            // Initialize audio context on user interaction
            this.setupAudioContext();

            // Set up keyboard shortcuts
            this.setupKeyboardShortcuts();

            // Set up responsive design handlers
            this.setupResponsiveHandlers();

            // Initialize service worker for offline support (if available)
            this.initServiceWorker();

            // Show welcome screen
            UI.showWelcomeScreen();

            this.isInitialized = true;
            console.log('Patrimonio Sonoro App initialized successfully');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showErrorMessage('Error al inicializar la aplicación. Por favor, recarga la página.');
        }
    }

    setupAudioContext() {
        // Initialize audio context on first user interaction
        const initAudio = () => {
            if (!window.audioContext) {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Remove event listeners after first interaction
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
            document.removeEventListener('keydown', initAudio);
        };

        document.addEventListener('click', initAudio);
        document.addEventListener('touchstart', initAudio);
        document.addEventListener('keydown', initAudio);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when game is active
            if (!this.game || !this.game.gameActive) return;

            switch (e.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                    e.preventDefault();
                    const index = parseInt(e.key) - 1;
                    const answerButtons = document.querySelectorAll('.answer-btn');
                    if (answerButtons[index] && !answerButtons[index].classList.contains('disabled')) {
                        answerButtons[index].click();
                    }
                    break;
                
                case ' ': // Spacebar to play audio
                    e.preventDefault();
                    const playBtn = document.querySelector('.play-btn:not([disabled])');
                    if (playBtn) {
                        playBtn.click();
                    }
                    break;
                
                case 'Escape':
                    e.preventDefault();
                    if (UI.currentScreen === 'game') {
                        this.showPauseMenu();
                    }
                    break;
            }
        });
    }

    setupResponsiveHandlers() {
        // Handle orientation changes on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.adjustLayoutForOrientation();
            }, 100);
        });

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.adjustLayoutForScreenSize();
            }, 250);
        });
    }

    adjustLayoutForOrientation() {
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            // Force layout recalculation
            gameContainer.style.height = 'auto';
            setTimeout(() => {
                gameContainer.style.height = '';
            }, 50);
        }
    }

    adjustLayoutForScreenSize() {
        const root = document.documentElement;
        const screenWidth = window.innerWidth;
        
        // Adjust font sizes for very small screens
        if (screenWidth < 360) {
            root.style.fontSize = '14px';
        } else if (screenWidth < 480) {
            root.style.fontSize = '15px';
        } else {
            root.style.fontSize = '16px';
        }
    }

    async initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('../sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    showPauseMenu() {
        const pauseMenu = document.createElement('div');
        pauseMenu.className = 'pause-menu';
        pauseMenu.innerHTML = `
            <div class="pause-content">
                <h3>Juego Pausado</h3>
                <div class="pause-buttons">
                    <button class="primary-btn" onclick="app.resumeGame()">Continuar</button>
                    <button class="secondary-btn" onclick="app.quitToMenu()">Salir al Menú</button>
                </div>
            </div>
        `;
        
        pauseMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;

        const pauseContent = pauseMenu.querySelector('.pause-content');
        pauseContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            width: 90%;
        `;

        document.body.appendChild(pauseMenu);
        this.game.pauseGame();
    }

    resumeGame() {
        const pauseMenu = document.querySelector('.pause-menu');
        if (pauseMenu) {
            document.body.removeChild(pauseMenu);
        }
        this.game.resumeGame();
    }

    quitToMenu() {
        const pauseMenu = document.querySelector('.pause-menu');
        if (pauseMenu) {
            document.body.removeChild(pauseMenu);
        }
        this.game.quitGame();
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="primary-btn">Recargar Página</button>
            </div>
        `;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            color: white;
        `;

        document.body.appendChild(errorDiv);
    }

    // Analytics and tracking methods
    trackGameStart(mode, difficulty) {
        // Track game analytics (could integrate with Google Analytics, etc.)
        console.log(`Game started: ${mode} - ${difficulty}`);
        
        // Store in local analytics
        const analytics = this.getAnalytics();
        analytics.gamesStarted++;
        analytics.modeUsage[mode] = (analytics.modeUsage[mode] || 0) + 1;
        analytics.difficultyUsage[difficulty] = (analytics.difficultyUsage[difficulty] || 0) + 1;
        this.saveAnalytics(analytics);
    }

    trackGameComplete(results) {
        console.log('Game completed:', results);
        
        const analytics = this.getAnalytics();
        analytics.gamesCompleted++;
        analytics.totalScore += results.score;
        analytics.averageAccuracy = (analytics.averageAccuracy + results.accuracy) / 2;
        this.saveAnalytics(analytics);
    }

    getAnalytics() {
        const saved = localStorage.getItem('patrimonioSonoroAnalytics');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            gamesStarted: 0,
            gamesCompleted: 0,
            totalScore: 0,
            averageAccuracy: 0,
            modeUsage: {},
            difficultyUsage: {},
            lastPlayed: null
        };
    }

    saveAnalytics(analytics) {
        analytics.lastPlayed = new Date().toISOString();
        localStorage.setItem('patrimonioSonoroAnalytics', JSON.stringify(analytics));
    }

    // Utility methods for debugging and development
    exportGameData() {
        const data = {
            achievements: this.game.achievements,
            stats: this.game.gameStats,
            analytics: this.getAnalytics()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'patrimonio-sonoro-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    resetAllData() {
        if (confirm('¿Estás seguro de que quieres resetear todos los datos del juego?')) {
            localStorage.removeItem('colombianMusicGameStats');
            localStorage.removeItem('colombianMusicAchievements');
            localStorage.removeItem('patrimonioSonoroAnalytics');
            location.reload();
        }
    }

    // Performance monitoring
    measurePerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            console.log(`Page load time: ${loadTime}ms`);
            
            // Track performance metrics
            const analytics = this.getAnalytics();
            analytics.averageLoadTime = analytics.averageLoadTime ? 
                (analytics.averageLoadTime + loadTime) / 2 : loadTime;
            this.saveAnalytics(analytics);
        }
    }
}

// Global app instance
const app = new PatrimonioSonoroApp();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    app.measurePerformance();
});

// Handle page visibility changes (pause game when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && app.game && app.game.gameActive) {
        app.showPauseMenu();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    UI.showToast('Conexión restaurada 🌐', 'success');
});

window.addEventListener('offline', () => {
    UI.showToast('Sin conexión - Modo offline 📱', 'error');
});

// Prevent context menu on long press (mobile)
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.classList.contains('answer-btn')) {
        e.preventDefault();
    }
});

// Handle back button on mobile browsers
window.addEventListener('popstate', (e) => {
    if (UI.currentScreen === 'game' && app.game && app.game.gameActive) {
        e.preventDefault();
        app.showPauseMenu();
        history.pushState(null, null, location.href);
    }
});

// Add to home screen prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button after a delay
    setTimeout(() => {
        if (deferredPrompt) {
            const installBtn = document.createElement('button');
            installBtn.textContent = '📱 Instalar App';
            installBtn.className = 'install-btn';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #1E3A8A;
                color: white;
                border: none;
                padding: 0.75rem 1rem;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            `;
            
            installBtn.addEventListener('click', async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`Install prompt outcome: ${outcome}`);
                deferredPrompt = null;
                document.body.removeChild(installBtn);
            });
            
            document.body.appendChild(installBtn);
        }
    }, 5000);
});

// Export for debugging in console
window.app = app;
window.UI = UI;
window.COLOMBIAN_MUSIC_DATA = COLOMBIAN_MUSIC_DATA;
