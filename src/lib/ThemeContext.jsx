import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext(null);

const VALID_THEMES = ['light', 'soft_dark', 'emerald_serenity', 'royal_amethyst', 'sunset_glow'];

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');
    const location = useLocation();

    const applyTheme = (targetTheme) => {
        document.documentElement.classList.remove(...VALID_THEMES);
        document.documentElement.classList.add(targetTheme);
    };

    // Effect to handle route changes and theme application
    useEffect(() => {
        const publicPaths = ['/sign-in', '/Registration', '/onboarding', '/Start'];
        const isPublic = publicPaths.some(path => location.pathname.toLowerCase().startsWith(path.toLowerCase()));

        if (isPublic) {
            applyTheme('light');
        } else {
            applyTheme(theme);
        }
    }, [location.pathname, theme]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
    }, []);

    const switchTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, switchTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
