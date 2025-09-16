// UI Management Class
class UIManager {
    constructor() {
        this.currentScreen = 'welcome';
        this.modal = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Mode selection buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.selectGameMode(mode);
            });
        });

        // Difficulty selection buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectDifficulty(e.target);
            });
        });

        // Navigation buttons
        document.getElementById('back-btn')?.addEventListener('click', () => {
            game.quitGame();
        });

        document.getElementById('play-again-btn')?.addEventListener('click', () => {
            game.restartGame();
        });

        document.getElementById('home-btn')?.addEventListener('click', () => {
            this.showWelcomeScreen();
        });

        document.getElementById('share-btn')?.addEventListener('click', () => {
            const results = this.getLastResults();
            if (results) game.shareResults(results);
        });

        // Modal controls
        document.querySelector('.close-modal')?.addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('info-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'info-modal') {
                this.hideModal();
            }
        });

        // Audio controls
        this.setupAudioControls();
    }

    setupAudioControls() {
        const gameAudio = document.getElementById('game-audio');
        if (gameAudio) {
            gameAudio.addEventListener('loadeddata', () => {
                // Audio is ready to play
                const playBtn = document.querySelector('.play-btn');
                if (playBtn) {
                    playBtn.disabled = false;
                    playBtn.textContent = '▶️ Reproducir Audio';
                }
            });

            gameAudio.addEventListener('error', () => {
                console.log('Audio failed to load');
                const playBtn = document.querySelector('.play-btn');
                if (playBtn) {
                    playBtn.textContent = '❌ Audio no disponible';
                    playBtn.disabled = true;
                }
            });
        }
    }

    selectGameMode(mode) {
        const difficulty = document.querySelector('.difficulty-btn.active')?.dataset.difficulty || 'easy';
        game.startGame(mode, difficulty);
        this.showGameScreen();
    }

    selectDifficulty(button) {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }

    showWelcomeScreen() {
        this.hideAllScreens();
        document.getElementById('welcome-screen').classList.add('active');
        this.currentScreen = 'welcome';
        this.updateScore(0, 1);
    }

    showGameScreen() {
        this.hideAllScreens();
        document.getElementById('game-screen').classList.add('active');
        this.currentScreen = 'game';
    }

    showResultsScreen() {
        this.hideAllScreens();
        document.getElementById('results-screen').classList.add('active');
        this.currentScreen = 'results';
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    displayQuestion(question, questionNumber, totalQuestions) {
        const questionTitle = document.getElementById('question-title');
        const questionContent = document.getElementById('question-content');
        const answersGrid = document.getElementById('answers-grid');

        questionTitle.textContent = `Pregunta ${questionNumber} de ${totalQuestions}`;
        
        // Clear previous content
        questionContent.innerHTML = '';
        answersGrid.innerHTML = '';

        // Display question based on type
        switch (question.type) {
            case 'instrument':
                this.displayInstrumentQuestion(question, questionContent);
                break;
            case 'culture':
                this.displayCultureQuestion(question, questionContent);
                break;
        }

        // Display answer options
        this.displayAnswerOptions(question.options, question.correctIndex);

        // Update progress
        this.updateProgress(questionNumber - 1, totalQuestions);
    }

    displayInstrumentQuestion(question, container) {
        container.innerHTML = `
            <h4>${question.question}</h4>
            <div class="audio-player">
                <button class="play-btn" onclick="this.nextElementSibling.play(); this.textContent='🔊 Reproduciendo...'">
                    ▶️ Reproducir Sonido del Instrumento
                </button>
                <audio controls style="display: none;" id="question-audio">
                    <source src="${question.audioSample}" type="audio/mpeg">
                </audio>
            </div>
            ${question.instrument.image ? `<img src="${question.instrument.image}" alt="${question.instrument.name}" class="instrument-image">` : ''}
            <p><strong>Pista:</strong> ${question.instrument.description}</p>
        `;

        // Setup play button functionality
        const playBtn = container.querySelector('.play-btn');
        const audio = document.getElementById('game-audio');
        
        playBtn.addEventListener('click', () => {
            if (audio.src !== question.audioSample) {
                audio.src = question.audioSample;
            }
            audio.play().then(() => {
                playBtn.textContent = '🔊 Reproduciendo...';
                playBtn.disabled = true;
            }).catch(e => {
                playBtn.textContent = '❌ Error de audio';
                console.log('Audio play failed:', e);
            });
        });

        audio.addEventListener('ended', () => {
            playBtn.textContent = '▶️ Reproducir de Nuevo';
            playBtn.disabled = false;
        });
    }


    displayCultureQuestion(question, container) {
        container.innerHTML = `
            <h4>${question.question}</h4>
            <div class="culture-hint">
                <p><em>💡 Piensa en las tradiciones y regiones de Colombia</em></p>
            </div>
        `;
    }

    setupAudioPlayer(container, audioSrc) {
        const playBtn = container.querySelector('.play-btn');
        const audio = document.getElementById('game-audio');
        
        playBtn.addEventListener('click', () => {
            if (audio.src !== audioSrc) {
                audio.src = audioSrc;
            }
            audio.play().then(() => {
                playBtn.textContent = '🔊 Reproduciendo...';
                playBtn.disabled = true;
            }).catch(e => {
                playBtn.textContent = '❌ Audio no disponible';
                console.log('Audio play failed:', e);
            });
        });

        audio.addEventListener('ended', () => {
            playBtn.textContent = '▶️ Reproducir de Nuevo';
            playBtn.disabled = false;
        });
    }


    displayAnswerOptions(options, correctIndex) {
        const answersGrid = document.getElementById('answers-grid');
        
        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = option;
            button.addEventListener('click', () => {
                this.selectAnswer(index, correctIndex);
            });
            answersGrid.appendChild(button);
        });
    }

    selectAnswer(selectedIndex, correctIndex) {
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        // Disable all buttons
        answerButtons.forEach(btn => {
            btn.classList.add('disabled');
        });

        // Mark correct and incorrect answers
        answerButtons[correctIndex].classList.add('correct');
        if (selectedIndex !== correctIndex && selectedIndex >= 0) {
            answerButtons[selectedIndex].classList.add('incorrect');
            answerButtons[selectedIndex].classList.add('shake');
        }

        // Add pulse animation to correct answer
        answerButtons[correctIndex].classList.add('pulse');

        // Submit answer to game logic
        game.submitAnswer(selectedIndex);
    }

    showAnswerFeedback(isCorrect, culturalInfo) {
        const culturalInfoDiv = document.getElementById('cultural-info');
        const culturalText = document.getElementById('cultural-text');
        
        if (culturalInfo) {
            culturalText.textContent = culturalInfo;
            culturalInfoDiv.classList.remove('hidden');
            culturalInfoDiv.classList.add('fade-in');
        }

        // Show visual feedback
        if (isCorrect) {
            this.showToast('¡Correcto! 🎉', 'success');
        } else {
            this.showToast('Incorrecto 😔', 'error');
        }
    }

    showToast(message, type) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22C55E' : '#EF4444'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2700);
    }

    updateTimer(timeLeft) {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = timeLeft;
            
            // Add warning color when time is low
            if (timeLeft <= 5) {
                timerElement.parentElement.style.background = '#EF4444';
                timerElement.parentElement.classList.add('pulse');
            } else {
                timerElement.parentElement.style.background = '#FF6B35';
                timerElement.parentElement.classList.remove('pulse');
            }
        }
    }

    updateProgress(current, total) {
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const percentage = (current / total) * 100;
            progressFill.style.width = `${percentage}%`;
        }
    }

    updateScore(score, level) {
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        
        if (scoreElement) scoreElement.textContent = score;
        if (levelElement) levelElement.textContent = level;
    }

    showResults(results, achievements) {
        this.lastResults = results; // Store for sharing
        
        document.getElementById('final-score').textContent = results.score;
        document.getElementById('correct-answers').textContent = results.correctAnswers;
        document.getElementById('total-questions').textContent = results.totalQuestions;
        document.getElementById('accuracy').textContent = `${results.accuracy}%`;

        // Show achievement if any
        const achievementDiv = document.getElementById('achievement');
        if (achievements && achievements.length > 0) {
            const achievement = achievements[0]; // Show first achievement
            document.getElementById('achievement-title').textContent = `${achievement.icon} ${achievement.name}`;
            document.getElementById('achievement-text').textContent = achievement.description;
            achievementDiv.style.display = 'block';
        } else {
            achievementDiv.style.display = 'none';
        }

        this.showResultsScreen();
        
        // Update score in header
        this.updateScore(results.score, this.calculateLevel(results.score));
    }

    calculateLevel(score) {
        return Math.floor(score / 1000) + 1;
    }

    getLastResults() {
        return this.lastResults;
    }

    showModal(title, content, imageSrc = null) {
        const modal = document.getElementById('info-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalImage = document.getElementById('modal-image');
        const modalText = document.getElementById('modal-text');

        modalTitle.textContent = title;
        modalText.textContent = content;
        
        if (imageSrc) {
            modalImage.src = imageSrc;
            modalImage.style.display = 'block';
        } else {
            modalImage.style.display = 'none';
        }

        modal.classList.remove('hidden');
        modal.classList.add('fade-in');
    }

    hideModal() {
        const modal = document.getElementById('info-modal');
        modal.classList.add('hidden');
        modal.classList.remove('fade-in');
    }

    // Add CSS animations dynamically
    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .toast {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
        `;
        document.head.appendChild(style);
    }
}

// Create global UI instance
const UI = new UIManager();
