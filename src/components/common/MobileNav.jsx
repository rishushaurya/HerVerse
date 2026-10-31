import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from "framer-motion";
import { useLanguage } from '@/lib/LanguageContext';
import { Home, Calendar, Heart, MessageCircle, User } from "lucide-react";

export default function MobileNav({ currentPage }) {
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t('home'), page: 'Home' },
    { icon: Calendar, label: t('planner'), page: 'Planner' },
    { icon: Heart, label: t('health'), page: 'Health' },
    { icon: MessageCircle, label: t('verseAI'), page: 'VerseAI' },
    { icon: User, label: t('profile'), page: 'Profile' }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t px-2 pb-safe z-50"
      style={{
        background: 'var(--app-nav-bg)',
        borderColor: 'var(--app-nav-border)'
      }}
    >
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className="relative flex flex-col items-center py-2 px-4"
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-1 w-12 h-1 rounded-full"
                  style={{ background: 'var(--app-accent-gradient)' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                className="p-2 rounded-xl transition-colors"
                style={{
                  background: isActive ? 'var(--app-nav-active-bg)' : 'transparent'
                }}
              >
                <item.icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: isActive ? 'var(--app-nav-active)' : 'var(--app-nav-inactive)' }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
              <span
                className="text-xs mt-1 transition-colors"
                style={{
                  color: isActive ? 'var(--app-nav-active)' : 'var(--app-nav-inactive)',
                  fontWeight: isActive ? 500 : 400
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}