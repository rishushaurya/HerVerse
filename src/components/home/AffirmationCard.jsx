import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Heart, Sparkles } from 'lucide-react';

const affirmations = {
    english: [
        "You are capable of amazing things",
        "Your feelings are valid and important",
        "You deserve rest and self-care",
        "Progress, not perfection, is what matters",
        "You are stronger than you think",
        "Today is a fresh start full of possibilities",
        "Your worth is not defined by productivity",
        "Be gentle with yourself today",
        "You are exactly where you need to be",
        "Small steps lead to big changes",
        "You are loved and you matter",
        "Trust your journey, even when it's hard",
        "Your voice is powerful and deserves to be heard",
        "Breathe deeply. You've got this",
        "Celebrate how far you've come",
        "It's okay to say no and set boundaries",
        "You bring light to the world around you",
        "Your dreams are worth pursuing fearlessly",
        "Kindness starts with being kind to yourself",
        "You are a work of art in progress"
    ],
    hindi: [
        "आप अद्भुत चीजें कर सकती हैं",
        "आपकी भावनाएं मायने रखती हैं",
        "आप आराम की हकदार हैं",
        "प्रगति मायने रखती है, पूर्णता नहीं",
        "आप जितना सोचती हैं उससे ज्यादा मजबूत हैं",
        "आज नई शुरुआत है",
        "अपने आप पर दया करें",
        "आप बिल्कुल सही जगह पर हैं",
        "छोटे कदम बड़े बदलाव लाते हैं",
        "आप प्यार की हकदार हैं"
    ],
    kannada: [
        "ನೀವು ಅದ್ಭುತ ಕೆಲಸಗಳನ್ನು ಮಾಡಬಲ್ಲಿರಿ",
        "ನಿಮ್ಮ ಭಾವನೆಗಳು ಮುಖ್ಯ",
        "ನೀವು ವಿಶ್ರಾಂತಿಗೆ ಅರ್ಹರು",
        "ಪ್ರಗತಿ ಮುಖ್ಯ, ಪರಿಪೂರ್ಣತೆ ಅಲ್ಲ",
        "ದಯೆ ನಿಮ್ಮಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ"
    ]
};

export default function AffirmationCard({ language = 'english' }) {
    const [index, setIndex] = useState(0);
    const [liked, setLiked] = useState(false);

    const lang = affirmations[language] ? language : 'english';
    const cards = affirmations[lang];

    // Pick a daily affirmation based on date
    useEffect(() => {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        setIndex(dayOfYear % cards.length);
    }, [cards.length]);

    const shuffle = () => {
        setIndex((prev) => (prev + 1) % cards.length);
        setLiked(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 border relative overflow-hidden"
            style={{ background: 'var(--app-accent-gradient)', boxShadow: 'var(--app-shadow)' }}
        >
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

            <div className="relative z-10">
                <p className="text-xs text-white/70 mb-2 font-medium flex items-center gap-1"><Sparkles className="w-3 h-3" /> Daily Affirmation</p>

                <AnimatePresence mode="wait">
                    <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-white font-semibold text-lg leading-relaxed min-h-[56px]"
                    >
                        {cards[index]}
                    </motion.p>
                </AnimatePresence>

                <div className="flex items-center justify-between mt-4">
                    <button
                        onClick={() => setLiked(!liked)}
                        className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
                    >
                        <Heart className={`w-5 h-5 ${liked ? 'fill-white text-white' : ''}`} />
                        <span className="text-xs">{liked ? 'Saved!' : 'Save'}</span>
                    </button>

                    <button
                        onClick={shuffle}
                        className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-xs">Next</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
