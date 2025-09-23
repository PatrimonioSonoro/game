// Colombian Music Database
const COLOMBIAN_MUSIC_DATA = {

    instruments: {
        easy: [
            {
                id: 'acordeon',
                name: 'Acordeón',
                description: 'Instrumento de viento con teclado y fuelle',
                origin: 'Adoptado en el Caribe colombiano',
                genres: ['Vallenato', 'Cumbia'],
                sound: 'Melódico y expresivo',
                culturalInfo: 'Llegó a Colombia a finales del siglo XIX y se convirtió en el alma del vallenato.',
                image: 'assets/images/acordeon.png',
                audioSample: 'assets/audio/acordeon_vallenato.wav'
            },
            {
                id: 'guitarra',
                name: 'Guitarra',
                description: 'Instrumento de cuerda pulsada',
                origin: 'Herencia española',
                genres: ['Bambuco', 'Pasillo', 'Bolero'],
                sound: 'Armónico y melódico',
                culturalInfo: 'Base armónica de la música andina colombiana.',
                image: 'assets/images/guitarra.png',
                audioSample: 'assets/audio/guitarra.wav'
            },
            {
                id: 'trombon',
                name: 'Trombón',
                description: 'Instrumento de viento-metal con vara deslizante',
                origin: 'Adoptado en las bandas del Caribe  Colombiano',
                genres: ['Porro', 'Cumbia', 'Fandango'],
                sound: 'Grave y melódico',
                culturalInfo: 'Fundamental en las bandas de viento del Caribe colombiano, especialmente en el porro sabanero.',
                image: 'assets/images/trombon.png',
                audioSample: 'assets/audio/trombon.wav'
            },
            {
                id: 'piano',
                name: 'Piano',
                description: 'Instrumento de teclado con cuerdas percutidas por martillos',
                origin: 'Introducido durante la época colonial, adoptado en la música culta y popular',
                genres: ['Bambuco', 'Pasillo', 'Vals Criollo', 'Bolero'],
                sound: 'Armónico y expresivo, con gran rango dinámico',
                culturalInfo: 'Esencial en la música de salón del siglo XIX y XX en Colombia. Acompaña bambucos, pasillos y valses criollos. Compositores como Pedro Morales Pino y Guillermo Uribe Holguín lo utilizaron extensamente.',
                image: 'assets/images/piano.png',
                audioSample: 'assets/audio/piano.wav'
            }

        ],
        medium: [
            {
                /* Instrumento */
            }
        ],
        hard: [
            {
                /* Instrumento */
            },
            {
                /* Instrumento */
            },
            {
                /* Instrumento */
            }
        ]
    },


    culturalQuestions: {
        easy: [
            {
                question: '¿En qué región de Colombia se originó el vallenato?',
                options: ['Costa Caribe', 'Región Andina', 'Costa Pacífica', 'Llanos Orientales'],
                correct: 0,
                explanation: 'El vallenato se originó en la Costa Caribe, específicamente en la región de Valledupar.'
            },
            {
                question: '¿Cuál es el instrumento principal del vallenato?',
                options: ['Guitarra', 'Acordeón', 'Arpa', 'Marimba'],
                correct: 1,
                explanation: 'El acordeón es el instrumento melódico principal del vallenato.'
            },
            {
                question: '¿Qué significa "cumbia" en lengua indígena?',
                options: ['Fiesta', 'Danza', 'Música', 'Alegría'],
                correct: 0,
                explanation: 'Cumbia proviene de "cumbé", que significa fiesta en lenguas africanas.'
            }
        ],
        medium: [
            {
                question: '¿Cuál es el compás característico del bambuco?',
                options: ['4/4', '3/4', '6/8', '2/4'],
                correct: 2,
                explanation: 'El bambuco se caracteriza por su compás de 6/8, que le da su ritmo distintivo.'
            },
            {
                question: '¿Qué instrumento es considerado el "rey" del joropo?',
                options: ['Cuatro', 'Arpa', 'Maracas', 'Bandola'],
                correct: 1,
                explanation: 'El arpa llanera es considerada el instrumento rey del joropo por su virtuosismo.'
            },
            {
                question: '¿En qué año el vallenato fue declarado Patrimonio de la Humanidad?',
                options: ['2015', '2013', '2011', '2017'],
                correct: 0,
                explanation: 'En 2015, la UNESCO declaró el vallenato Patrimonio Cultural Inmaterial de la Humanidad.'
            }
        ],
        hard: [
            {
                question: '¿Cuál es la diferencia entre el cununo macho y hembra?',
                options: ['El tamaño', 'El sonido', 'El material', 'Todas las anteriores'],
                correct: 3,
                explanation: 'Los cununos macho y hembra difieren en tamaño, sonido y a veces en material de construcción.'
            },
            {
                question: '¿Qué significa "bullerengue" en el contexto cultural?',
                options: ['Canto de trabajo', 'Ritual de paso', 'Danza de cortejo', 'Celebración religiosa'],
                correct: 1,
                explanation: 'El bullerengue tradicionalmente acompaña rituales de paso, especialmente femeninos.'
            },
            {
                question: '¿Cuántas cuerdas tiene un tiple tradicional?',
                options: ['6', '10', '12', '14'],
                correct: 2,
                explanation: 'El tiple tradicional colombiano tiene 12 cuerdas agrupadas en 4 órdenes.'
            }
        ]
    },

    achievements: [
        {
            id: 'first_steps',
            name: 'Primeros Pasos',
            description: 'Completa tu primer juego',
            icon: '🎵',
            requirement: 'complete_game'
        },
        {
            id: 'instrument_expert',
            name: 'Experto en Instrumentos',
            description: 'Identifica correctamente 10 instrumentos seguidos',
            icon: '🎺',
            requirement: 'instrument_streak_10'
        },
        {
            id: 'cultural_scholar',
            name: 'Erudito Cultural',
            description: 'Responde correctamente 15 preguntas culturales',
            icon: '📚',
            requirement: 'cultural_questions_15'
        },
        {
            id: 'perfect_score',
            name: 'Puntuación Perfecta',
            description: 'Obtén la puntuación máxima en cualquier modo',
            icon: '⭐',
            requirement: 'perfect_score'
        }
    ],

    difficulties: {
        easy: {
            name: 'Fácil',
            timePerQuestion: 30,
            questionsCount: 5,
            scoreMultiplier: 1,
            description: 'Perfecto para comenzar tu viaje musical'
        },
        medium: {
            name: 'Intermedio',
            timePerQuestion: 20,
            questionsCount: 8,
            scoreMultiplier: 1.5,
            description: 'Para quienes ya conocen algo de música colombiana'
        },
        hard: {
            name: 'Difícil',
            timePerQuestion: 15,
            questionsCount: 10,
            scoreMultiplier: 2,
            description: 'El desafío definitivo para expertos'
        }
    }
};

// Utility functions for data access
const DataUtils = {
    getInstrumentsByDifficulty: (difficulty) => {
        return COLOMBIAN_MUSIC_DATA.instruments[difficulty] || [];
    },

    getCulturalQuestionsByDifficulty: (difficulty) => {
        return COLOMBIAN_MUSIC_DATA.culturalQuestions[difficulty] || [];
    },

    getRandomItems: (array, count) => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    },

    getDifficultySettings: (difficulty) => {
        return COLOMBIAN_MUSIC_DATA.difficulties[difficulty] || COLOMBIAN_MUSIC_DATA.difficulties.easy;
    },

    getAllInstruments: () => {
        return [
            ...COLOMBIAN_MUSIC_DATA.instruments.easy,
            ...COLOMBIAN_MUSIC_DATA.instruments.medium,
            ...COLOMBIAN_MUSIC_DATA.instruments.hard
        ];
    },

    getAchievements: () => {
        return COLOMBIAN_MUSIC_DATA.achievements;
    }
};
