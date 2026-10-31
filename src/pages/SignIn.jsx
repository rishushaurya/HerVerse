import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPageUrl } from '@/utils';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    identifier: '', // Email or Phone
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.identifier) newErrors.identifier = t('emailOrPhoneRequired');
    if (!formData.password) newErrors.password = t('passwordRequired');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Determine if identifier is email or phone
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);
      const credentials = {
        password: formData.password
      };

      if (isEmail) {
        credentials.email = formData.identifier;
      } else {
        credentials.phone = formData.identifier.replace(/\D/g, ''); // Clean phone number
      }

      await login(credentials);
      navigate(createPageUrl('Home'));
    } catch (error) {
      setErrors({ submit: error.message || 'Invalid credentials' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col justify-center" style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #FDFAFF 50%, #FFFFFF 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-white shadow-md">
          <img src="/logo.jpeg" alt="Herverse Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
          {t('welcomeBack')}
        </h1>
        <p className="text-gray-600 mt-2 font-medium">{t('signInToContinue')}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto w-full space-y-6">
        {/* Identifier */}
        <div>
          <Label className="text-gray-900 font-bold mb-1.5 flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-600" /> {t('emailOrPhone')}
          </Label>
          <Input
            value={formData.identifier}
            onChange={(e) => {
              setFormData({ ...formData, identifier: e.target.value });
              setErrors({ ...errors, identifier: '' });
            }}
            className="h-12 rounded-xl text-gray-900 font-medium border-gray-300 focus:border-purple-500"
            placeholder="you@example.com or 9876543210"
          />
          {errors.identifier && <p className="text-xs text-red-600 mt-1 font-medium">{errors.identifier}</p>}
        </div>

        {/* Password */}
        <div>
          <Label className="text-gray-900 font-bold mb-1.5 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600" /> {t('password')}
          </Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setErrors({ ...errors, password: '' });
            }}
            className="h-12 rounded-xl text-gray-900 font-medium border-gray-300 focus:border-rose-500"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-red-600 mt-1 font-medium">{errors.password}</p>}
        </div>

        {errors.submit && (
          <div className="bg-red-50 p-3 rounded-xl flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-700 font-medium">{errors.submit}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 shadow-lg shadow-rose-200/50 text-white"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('loading')}
            </div>
          ) : t('signIn')}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm font-medium">
          {t('dontHaveAccount')}{' '}
          <button
            onClick={() => navigate(createPageUrl('Registration'))}
            className="text-rose-600 font-bold hover:underline"
          >
            {t('createAccount')}
          </button>
        </p>
      </div>
    </div>
  );
}