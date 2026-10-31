import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { translations } from './translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('english');
    const location = useLocation();

    useEffect(() => {
        // Load language from localStorage
        const savedLanguage = localStorage.getItem('language') || 'english';
        setLanguage(savedLanguage);
    }, []);

    const switchLanguage = (newLanguage) => {
        setLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
    };

    const t = (key) => {
        // Public pages always use English
        const publicPaths = ['/sign-in', '/Registration', '/onboarding', '/Start']; // Added Start just in case
        const isPublic = publicPaths.some(path => location.pathname.toLowerCase().startsWith(path.toLowerCase()));

        if (isPublic) {
            return translations.english[key] || key;
        }

        return translations[language]?.[key] || translations.english[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, switchLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
