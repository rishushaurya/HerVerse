import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, CalendarDays, HeartPulse, ShieldCheck } from 'lucide-react';

export default function Start() {
  const navigate = useNavigate();

  // Check if user is already logged in
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(createPageUrl('Home'));
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #FDFAFF 50%, #FFFFFF 100%)' }}>

      {/* Logo & Branding */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg overflow-hidden border-4 border-white">
          <img src="/logo.jpeg" alt="Herverse Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Herverse
        </h1>
        <p className="text-gray-600 text-lg">Your intelligent companion</p>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 mb-12 max-w-sm"
      >
        {[
          { icon: CalendarDays, text: t('dailyCheckIn') },
          { icon: HeartPulse, text: t('healthLogs') },
          { icon: Sparkles, text: t('talkToVerseAI') },
          { icon: ShieldCheck, text: t('emergencyContactsLabel') }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <feature.icon className="w-5 h-5 text-rose-500" aria-hidden="true" />
            </span>
            <p className="text-gray-700">{feature.text}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm space-y-4"
      >
        <Button
          onClick={() => navigate(createPageUrl('Registration'))}
          className="w-full py-6 text-lg rounded-2xl bg-gradient-to-r from-rose-400 to-purple-400 shadow-lg shadow-rose-200/50"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Create Account
        </Button>

        <Button
          onClick={() => navigate(createPageUrl('SignIn'))}
          variant="outline"
          className="w-full py-6 text-lg rounded-2xl border-2 border-rose-200 text-rose-600 hover:bg-rose-50"
        >
          Sign In
        </Button>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-sm text-gray-400 mt-12"
      >
        Safe, private, and made for you
      </motion.p>
    </div>
  );
}