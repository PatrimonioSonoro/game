// Game Logic Class
class ColombianMusicGame {
    constructor() {
        this.currentMode = null;
        this.currentDifficulty = 'easy';
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.score = 0;
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        this.timeLeft = 30;
        this.timer = null;
        this.gameActive = false;
        // Load achievements correctly
        this.achievements = this.loadAchievements();
        this.gameStats = this.loadGameStats();
        this.audioContext = null;
        this.currentAudio = null;
        this.usedInstruments = new Set(); // Track used instruments to prevent repetition
        this.availableInstruments = []; // Pool of available instruments for current session
    }

    // Initialize game with selected mode and difficulty
    startGame(mode, difficulty) {
        // Force easy difficulty for instruments; allow selected difficulty for culture
        this.currentMode = (mode === 'culture') ? 'culture' : 'instruments';
        this.currentDifficulty = (this.currentMode === 'culture') ? (difficulty || 'easy') : 'easy';
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.gameActive = true;

        const difficultySettings = DataUtils.getDifficultySettings(this.currentDifficulty);
        this.timeLeft = difficultySettings.timePerQuestion;
        // Determine total questions based on mode and available data for the selected (or forced) difficulty
        if (this.currentMode === 'instruments') {
            const easyInstruments = DataUtils.getInstrumentsByDifficulty('easy');
            this.totalQuestions = Math.min(difficultySettings.questionsCount, easyInstruments.length);
        } else {
            const questionsByDiff = DataUtils.getCulturalQuestionsByDifficulty(this.currentDifficulty);
            this.totalQuestions = Math.min(difficultySettings.questionsCount, questionsByDiff.length);
        }

        // Reset instrument tracking for new game
        this.usedInstruments.clear();
        this.availableInstruments = [];

        this.generateQuestions();
        this.showNextQuestion();
    }

    // Generate questions based on game mode and difficulty
    generateQuestions() {
        switch (this.currentMode) {
            case 'instruments':
                this.generateInstrumentQuestions();
                break;
            case 'culture':
                this.generateCultureQuestions();
                break;
        }
    }

    generateInstrumentQuestions() {
        // Use only EASY instruments defined in data.js
        const allInstruments = DataUtils.getInstrumentsByDifficulty('easy');
        
        // Create a pool of available instruments, excluding already used ones
        this.availableInstruments = allInstruments.filter(inst => !this.usedInstruments.has(inst.id));
        
        // If we don't have enough instruments, reset the used instruments
        if (this.availableInstruments.length < this.totalQuestions) {
            this.usedInstruments.clear();
            this.availableInstruments = [...allInstruments];
        }
        
        // Shuffle the available instruments for random order
        this.availableInstruments = this.availableInstruments.sort(() => 0.5 - Math.random());
        
        this.questions = [];
        for (let i = 0; i < this.totalQuestions && i < this.availableInstruments.length; i++) {
            const correctInstrument = this.availableInstruments[i];
            
            // Get wrong options from all instruments except the correct one
            const wrongOptions = DataUtils.getRandomItems(
                allInstruments.filter(inst => inst.id !== correctInstrument.id), 
                3
            );
            
            const options = [correctInstrument, ...wrongOptions]
                .sort(() => 0.5 - Math.random())
                .map(inst => inst.name);
            
            const correctIndex = options.indexOf(correctInstrument.name);
            
            this.questions.push({
                type: 'instrument',
                question: '¿Qué instrumento estás escuchando?',
                instrument: correctInstrument,
                options: options,
                correctIndex: correctIndex,
                audioSample: correctInstrument.audioSample,
                culturalInfo: correctInstrument.culturalInfo
            });
        }
    }


    generateCultureQuestions() {
        const questions = DataUtils.getCulturalQuestionsByDifficulty(this.currentDifficulty);
        this.questions = DataUtils.getRandomItems(questions, this.totalQuestions)
            .map(q => ({
                type: 'culture',
                question: q.question,
                options: q.options,
                correctIndex: q.correct,
                culturalInfo: q.explanation
            }));
    }


    showNextQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endGame();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        UI.displayQuestion(question, this.currentQuestionIndex + 1, this.totalQuestions);
        
        // Reset timer
        const difficultySettings = DataUtils.getDifficultySettings(this.currentDifficulty);
        // Ensure no duplicate timers
        this.stopTimer();
        this.timeLeft = difficultySettings.timePerQuestion;
        this.updateTimer();
        
        // Play audio if available
        if (question.audioSample) {
            this.playAudioSample(question.audioSample);
        }

        // Start countdown for this question
        this.startTimer();
    }

    playAudioSample(audioSrc) {
        const audio = document.getElementById('game-audio');
        if (audio) {
            audio.src = audioSrc;
            audio.load();
            // Auto-play might be blocked, so we'll provide a play button
        }
    }

    submitAnswer(selectedIndex) {
        if (!this.gameActive) return;

        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctIndex;
        
        if (isCorrect) {
            this.correctAnswers++;
            const difficultySettings = DataUtils.getDifficultySettings(this.currentDifficulty);
            const timeBonus = Math.max(0, this.timeLeft * 10);
            const baseScore = 100 * difficultySettings.scoreMultiplier;
            this.score += baseScore + timeBonus;
            
            // Mark instrument as used if it's an instrument question and answered correctly
            if (question.type === 'instrument') {
                this.usedInstruments.add(question.instrument.id);
            }
            
            this.playSound('success');
            UI.showAnswerFeedback(true, question.culturalInfo);
        } else {
            this.playSound('error');
            UI.showAnswerFeedback(false, question.culturalInfo);
        }

        // Update game stats
        this.updateGameStats(isCorrect);
        
        // Stop timer temporarily
        this.stopTimer();
        
        // Show next question after delay
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showNextQuestion();
        }, 3000);
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.submitAnswer(-1); // Time's up, wrong answer
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimer() {
        UI.updateTimer(this.timeLeft);
        UI.updateProgress(this.currentQuestionIndex, this.totalQuestions);
    }

    endGame() {
        this.gameActive = false;
        this.stopTimer();
        
        const accuracy = this.totalQuestions > 0 ? 
            Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0;
        
        const results = {
            score: this.score,
            correctAnswers: this.correctAnswers,
            totalQuestions: this.totalQuestions,
            accuracy: accuracy,
            mode: this.currentMode,
            difficulty: this.currentDifficulty
        };

        // Check for achievements
        const newAchievements = this.checkAchievements(results);
        
        // Save game stats
        this.saveGameStats();
        
        UI.showResults(results, newAchievements);
    }

    checkAchievements(results) {
        const newAchievements = [];
        const achievements = DataUtils.getAchievements();
        
        achievements.forEach(achievement => {
            if (this.achievements.includes(achievement.id)) return;
            
            let unlocked = false;
            
            switch (achievement.requirement) {
                case 'complete_game':
                    unlocked = true;
                    break;
                case 'perfect_rhythm':
                    unlocked = results.mode === 'rhythm' && results.accuracy === 100;
                    break;
                case 'instrument_streak_10':
                    unlocked = results.mode === 'instruments' && results.correctAnswers >= 10;
                    break;
                case 'cultural_questions_15':
                    unlocked = this.gameStats.totalCulturalCorrect >= 15;
                    break;
                case 'all_genres_identified':
                    unlocked = this.gameStats.genresIdentified.size >= 9; // Total genres
                    break;
                case 'perfect_score':
                    unlocked = results.accuracy === 100;
                    break;
            }
            
            if (unlocked) {
                this.achievements.push(achievement.id);
                newAchievements.push(achievement);
            }
        });
        
        if (newAchievements.length > 0) {
            this.saveAchievements();
        }
        
        return newAchievements;
    }

    updateGameStats(isCorrect) {
        const question = this.questions[this.currentQuestionIndex];
        
        this.gameStats.totalGames++;
        if (isCorrect) {
            this.gameStats.totalCorrect++;
            
            if (question.type === 'culture') {
                this.gameStats.totalCulturalCorrect++;
            } else if (question.type === 'genre') {
                this.gameStats.genresIdentified.add(question.genre.id);
            }
        }
        
        this.gameStats.totalQuestions++;
    }

    playSound(type) {
        const audio = document.getElementById(`${type}-sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    // Local storage methods
    saveGameStats() {
        const statsToSave = {
            ...this.gameStats,
            genresIdentified: Array.from(this.gameStats.genresIdentified)
        };
        localStorage.setItem('colombianMusicGameStats', JSON.stringify(statsToSave));
    }

    loadGameStats() {
        const saved = localStorage.getItem('colombianMusicGameStats');
        if (saved) {
            const stats = JSON.parse(saved);
            return {
                ...stats,
                genresIdentified: new Set(stats.genresIdentified || [])
            };
        }
        
        return {
            totalGames: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            totalCulturalCorrect: 0,
            genresIdentified: new Set(),
            highScore: 0
        };
    }

    saveAchievements() {
        localStorage.setItem('colombianMusicAchievements', JSON.stringify(this.achievements));
    }

    loadAchievements() {
        const saved = localStorage.getItem('colombianMusicAchievements');
        return saved ? JSON.parse(saved) : [];
    }

    // Public methods for UI interaction
    pauseGame() {
        this.gameActive = false;
        this.stopTimer();
    }

    resumeGame() {
        this.gameActive = true;
        this.startTimer();
    }

    quitGame() {
        this.gameActive = false;
        this.stopTimer();
        UI.showWelcomeScreen();
    }

    restartGame() {
        // Reset game state
        this.gameActive = false;
        this.stopTimer();
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        
        // Clear used instruments for new game session
        this.usedInstruments.clear();
        this.availableInstruments = [];
        
        // Start new game with same mode and difficulty
        this.startGame(this.currentMode, this.currentDifficulty);
    }

    async shareResults(results) {
        try {
            // Generate results image with watermark
            const imageBlob = await this.generateResultsImage(results);
            const gameUrl = window.location.href;
            const text = `¡Acabo de obtener ${results.score} puntos en el juego de Patrimonio Sonoro! 🎵 ${results.correctAnswers}/${results.totalQuestions} respuestas correctas (${results.accuracy}% precisión). 

¡Tú también puedes jugar y descubrir la música colombiana! 🇨🇴
Juega aquí: ${gameUrl}`;
            
            if (navigator.share && navigator.canShare) {
                // Try to share with image
                const file = new File([imageBlob], 'patrimonio-sonoro-resultados.png', { type: 'image/png' });
                
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'Patrimonio Sonoro - Mis Resultados',
                        text: text,
                        files: [file]
                    });
                } else {
                    // Fallback to text only
                    await navigator.share({
                        title: 'Patrimonio Sonoro - Mis Resultados',
                        text: text,
                        url: gameUrl
                    });
                }
            } else {
                // Show share options modal
                this.showShareModal(imageBlob, text, gameUrl);
            }
        } catch (error) {
            console.error('Error sharing results:', error);
            // Fallback to text sharing
            const gameUrl = window.location.href;
            const text = `¡Acabo de obtener ${results.score} puntos en el juego de Patrimonio Sonoro! 🎵 ${results.correctAnswers}/${results.totalQuestions} respuestas correctas (${results.accuracy}% precisión). 

¡Tú también puedes jugar y descubrir la música colombiana! 🇨🇴
Juega aquí: ${gameUrl}`;
            navigator.clipboard.writeText(text).then(() => {
                UI.showToast('¡Resultado copiado al portapapeles!', 'success');
            });
        }
    }

    async generateResultsImage(results) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            canvas.width = 800;
            canvas.height = 600;
            
            // Colombian flag colors gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#FFCD00');  // Yellow
            gradient.addColorStop(0.5, '#003DA5'); // Blue
            gradient.addColorStop(1, '#CE1126');   // Red
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add overlay for better text readability
            const overlayGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            overlayGradient.addColorStop(0, 'rgba(255, 205, 0, 0.8)');
            overlayGradient.addColorStop(0.5, 'rgba(0, 61, 165, 0.8)');
            overlayGradient.addColorStop(1, 'rgba(206, 17, 38, 0.8)');
            ctx.fillStyle = overlayGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add musical notes around the image
            this.drawMusicalNotes(ctx, canvas.width, canvas.height);
            
            // Load and add main logo
            const mainLogo = new Image();
            mainLogo.onload = () => {
                // Draw main logo at the top
                const logoWidth = 120;
                const logoHeight = 120;
                ctx.drawImage(mainLogo, (canvas.width - logoWidth) / 2, 20, logoWidth, logoHeight);
                
                // Title below logo
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 36px Poppins, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Patrimonio Sonoro', canvas.width / 2, 170);
                
                ctx.font = '18px Poppins, Arial, sans-serif';
                ctx.fillText('Música Tradicional Colombiana', canvas.width / 2, 195);
                
                this.continueImageGeneration(ctx, canvas, results, resolve);
            };
            
            mainLogo.onerror = () => {
                // If main logo fails to load, use text only
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 48px Poppins, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Patrimonio Sonoro', canvas.width / 2, 80);
                
                ctx.font = '24px Poppins, Arial, sans-serif';
                ctx.fillText('Música Tradicional Colombiana', canvas.width / 2, 120);
                
                this.continueImageGeneration(ctx, canvas, results, resolve);
            };
            
            mainLogo.src = './assets/images/logo_sin_letra_transparente.png';
        });
    }

    continueImageGeneration(ctx, canvas, results, resolve) {
        // Score circle
        const centerX = canvas.width / 2;
        const centerY = 280;
        const radius = 80;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        
        // Score text
        ctx.fillStyle = '#00B3A6';
        ctx.font = 'bold 36px Poppins, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(results.score.toString(), centerX, centerY + 10);
        
        ctx.font = '16px Poppins, Arial, sans-serif';
        ctx.fillText('PUNTOS', centerX, centerY + 35);
        
        // Stats
        const statsY = 420;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Poppins, Arial, sans-serif';
        
        // Correct answers
        ctx.textAlign = 'center';
        ctx.fillText(`${results.correctAnswers}/${results.totalQuestions}`, centerX - 120, statsY);
        ctx.font = '14px Poppins, Arial, sans-serif';
        ctx.fillText('Respuestas Correctas', centerX - 120, statsY + 25);
        
        // Accuracy
        ctx.font = 'bold 24px Poppins, Arial, sans-serif';
        ctx.fillText(`${results.accuracy}%`, centerX + 120, statsY);
        ctx.font = '14px Poppins, Arial, sans-serif';
        ctx.fillText('Precisión', centerX + 120, statsY + 25);
        
        // Mode
        ctx.font = 'bold 20px Poppins, Arial, sans-serif';
        ctx.textAlign = 'center';
        const modeText = results.mode === 'instruments' ? 'Reconoce Instrumentos' : 'Cultura Musical';
        ctx.fillText(`Modo: ${modeText}`, centerX, statsY + 60);
        
        // Load and add watermark logo only
        const logo = new Image();
        logo.onload = () => {
            // Draw logo as clear watermark (larger and more visible)
            ctx.globalAlpha = 0.9;
            const logoSize = 80;
            ctx.drawImage(logo, canvas.width - logoSize - 20, canvas.height - logoSize - 20, logoSize, logoSize);
            ctx.globalAlpha = 1;
            
            // Convert to blob
            canvas.toBlob(resolve, 'image/png', 0.9);
        };
        
        logo.onerror = () => {
            // If logo fails to load, add simple text watermark
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 16px Poppins, Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('PATRIMONIO SONORO', canvas.width - 20, canvas.height - 20);
            
            canvas.toBlob(resolve, 'image/png', 0.9);
        };
        
        // Try to load the logo
        logo.src = './assets/images/logo_sin_letra_transparente.png';
    }

    drawMusicalNotes(ctx, width, height) {
        // Only musical symbols and notes (no instruments)
        const musicalSymbols = ['♪', '♫', '♬', '♩', '♭', '♯', '𝄞', '𝄢', '𝄡', '♮'];
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '24px Arial, sans-serif';
        
        // Add musical notes around the border
        for (let i = 0; i < 20; i++) {
            const symbol = musicalSymbols[Math.floor(Math.random() * musicalSymbols.length)];
            
            // Random position around the edges
            let x, y;
            const side = Math.floor(Math.random() * 4);
            
            switch(side) {
                case 0: // Top
                    x = Math.random() * width;
                    y = Math.random() * 80 + 20;
                    break;
                case 1: // Right
                    x = width - Math.random() * 80 - 20;
                    y = Math.random() * height;
                    break;
                case 2: // Bottom
                    x = Math.random() * width;
                    y = height - Math.random() * 80 - 20;
                    break;
                case 3: // Left
                    x = Math.random() * 80 + 20;
                    y = Math.random() * height;
                    break;
            }
            
            // Avoid center area where main content is
            if (x > width * 0.25 && x < width * 0.75 && y > height * 0.25 && y < height * 0.75) {
                continue;
            }
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.random() * Math.PI * 2);
            ctx.fillText(symbol, 0, 0);
            ctx.restore();
        }
        
        // Add some Colombian music genre references as subtle text
        const genres = ['Vallenato', 'Cumbia', 'Bambuco', 'Joropo', 'Currulao'];
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.font = '12px Poppins, Arial, sans-serif';
        
        for (let i = 0; i < 5; i++) {
            const genre = genres[i];
            const angle = (i / 5) * Math.PI * 2;
            const radius = Math.min(width, height) * 0.4;
            const x = width / 2 + Math.cos(angle) * radius;
            const y = height / 2 + Math.sin(angle) * radius;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillText(genre, 0, 0);
            ctx.restore();
        }
    }

    showShareModal(imageBlob, text, gameUrl) {
        // Create share modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content share-modal">
                <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
                <h3>Compartir Resultados</h3>
                <div class="share-preview">
                    <img id="share-image-preview" style="max-width: 100%; border-radius: 10px; margin: 1rem 0;">
                </div>
                <div class="share-text-preview">
                    <p style="background: var(--bg-page); padding: 1rem; border-radius: 10px; font-size: 0.9rem; color: var(--text-secondary);">
                        ${text.replace(/\n/g, '<br>')}
                    </p>
                </div>
                <div class="share-options">
                    <button class="primary-btn" onclick="window.shareManager.downloadImage()">
                        📱 Descargar Imagen
                    </button>
                    <button class="secondary-btn" onclick="window.shareManager.copyImageAndText()">
                        📋 Copiar Todo (Imagen + Texto + Link)
                    </button>
                    <button class="secondary-btn" onclick="window.shareManager.copyText()">
                        📝 Copiar Texto + Link
                    </button>
                    <button class="secondary-btn" onclick="window.shareManager.copyLink()">
                        🔗 Copiar Solo Link del Juego
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show image preview
        const imageUrl = URL.createObjectURL(imageBlob);
        document.getElementById('share-image-preview').src = imageUrl;
        
        // Create share manager
        window.shareManager = {
            imageBlob: imageBlob,
            text: text,
            gameUrl: gameUrl,
            imageUrl: imageUrl,
            
            downloadImage() {
                const a = document.createElement('a');
                a.href = this.imageUrl;
                a.download = 'patrimonio-sonoro-resultados.png';
                a.click();
                UI.showToast('¡Imagen descargada!', 'success');
            },
            
            async copyImageAndText() {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': this.imageBlob,
                            'text/plain': new Blob([this.text], { type: 'text/plain' })
                        })
                    ]);
                    UI.showToast('¡Imagen y texto copiados al portapapeles!', 'success');
                } catch (err) {
                    console.error('Error copying image and text:', err);
                    // Fallback to text only
                    try {
                        await navigator.clipboard.writeText(this.text);
                        UI.showToast('¡Texto copiado al portapapeles! (Imagen no soportada)', 'success');
                    } catch (textErr) {
                        UI.showToast('Error al copiar. Intenta descargar la imagen.', 'error');
                    }
                }
            },
            
            async copyText() {
                try {
                    await navigator.clipboard.writeText(this.text);
                    UI.showToast('¡Texto y link copiados al portapapeles!', 'success');
                } catch (err) {
                    console.error('Error copying text:', err);
                    UI.showToast('Error al copiar texto', 'error');
                }
            },
            
            async copyLink() {
                try {
                    await navigator.clipboard.writeText(this.gameUrl);
                    UI.showToast('¡Link del juego copiado al portapapeles!', 'success');
                } catch (err) {
                    console.error('Error copying link:', err);
                    UI.showToast('Error al copiar link', 'error');
                }
            }
        };
        
        // Clean up when modal is closed
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                URL.revokeObjectURL(imageUrl);
                modal.remove();
                delete window.shareManager;
            }
        });
    }
}
