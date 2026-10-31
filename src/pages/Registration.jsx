import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createPageUrl } from '@/utils';
import { User, Mail, Phone, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function Registration() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    pin: '',
    dob: '',
    city: '',
    state: '',
    blood_group: '',
    agreed_to_terms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validatePIN = (pin) => {
    return /^\d{4}$/.test(pin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.full_name.trim()) newErrors.full_name = t('fullNameRequired'); // Assuming key exists or string fallback
    if (!formData.email) newErrors.email = t('emailRequired');
    else if (!validateEmail(formData.email)) newErrors.email = t('invalidEmail');
    if (!formData.phone_number) newErrors.phone_number = t('phoneRequired');
    else if (!validatePhone(formData.phone_number)) newErrors.phone_number = t('invalidPhone');
    if (!formData.password) newErrors.password = t('passwordRequired');
    else if (!validatePassword(formData.password)) newErrors.password = t('min8Chars');
    if (!formData.confirm_password) newErrors.confirm_password = t('confirmPasswordRequired');
    else if (formData.password !== formData.confirm_password) newErrors.confirm_password = t('passwordsDoNotMatch');
    if (!formData.pin) newErrors.pin = t('pinRequired');
    else if (!validatePIN(formData.pin)) newErrors.pin = t('invalidPin');
    if (!formData.agreed_to_terms) newErrors.agreed_to_terms = t('mustAgree');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Register and auto-login
      await register({
        name: formData.full_name,
        email: formData.email,
        phone: formData.phone_number,
        password: formData.password
      });

      // Registration automatically logs in the user via AuthContext
      // Show success and redirect to Onboarding
      setSuccess(true);
      setTimeout(() => navigate(createPageUrl('Onboarding')), 1500);
    } catch (error) {
      console.error(error);
      setErrors({ submit: error.message || 'Something went wrong. Please try again.' });
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #FDFAFF 50%, #FFFFFF 100%)' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t('accountCreated')}</h2>
          <p className="text-gray-600 mt-2">{t('settingUpProfile')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 overflow-y-auto" style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #FDFAFF 50%, #FFFFFF 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden border-2 border-white shadow-md">
          <img src="/logo.jpeg" alt="Herverse Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
          {t('joinHerverse')}
        </h1>
        <p className="text-gray-600 text-sm mt-1">{t('securePrivateIntelligent')}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 pb-8">
        {/* Full Name */}
        <div>
          <Label className="text-gray-900 font-medium mb-1.5 flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-rose-500" /> {t('fullName')} *
          </Label>
          <Input
            value={formData.full_name}
            onChange={(e) => {
              setFormData({ ...formData, full_name: e.target.value });
              setErrors({ ...errors, full_name: '' });
            }}
            className="h-11 rounded-xl text-gray-900 border-gray-300 focus:border-rose-500"
            placeholder="First Last"
          />
          {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name}</p>}
        </div>

        {/* Phone */}
        <div>
          <Label className="text-gray-900 font-medium mb-1.5 flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-green-600" /> {t('phoneNumber')} *
          </Label>
          <div className="flex gap-2">
            <div className="w-12 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-sm font-medium text-gray-900">+91</div>
            <Input
              type="tel"
              maxLength="10"
              value={formData.phone_number}
              onChange={(e) => {
                setFormData({ ...formData, phone_number: e.target.value.replace(/\D/g, '') });
                setErrors({ ...errors, phone_number: '' });
              }}
              className="flex-1 h-11 rounded-xl text-gray-900 border-gray-300 focus:border-green-500"
              placeholder="9876543210"
            />
          </div>
          {errors.phone_number && <p className="text-xs text-red-600 mt-1">{errors.phone_number}</p>}
        </div>

        {/* Email */}
        <div>
          <Label className="text-gray-900 font-medium mb-1.5 flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-purple-600" /> {t('emailAddress')} *
          </Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              setErrors({ ...errors, email: '' });
            }}
            className="h-11 rounded-xl text-gray-900 border-gray-300 focus:border-purple-500"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <Label className="text-gray-900 font-medium mb-1.5 flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-blue-600" /> {t('createPassword')} *
          </Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              setErrors({ ...errors, password: '' });
            }}
            className="h-11 rounded-xl text-gray-900 border-gray-300 focus:border-blue-500"
            placeholder="Min. 8 characters"
          />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <Label className="text-gray-900 font-medium mb-1.5 flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-blue-600" /> {t('confirmPassword')} *
          </Label>
          <Input
            type="password"
            value={formData.confirm_password}
            onChange={(e) => {
              setFormData({ ...formData, confirm_password: e.target.value });
              setErrors({ ...errors, confirm_password: '' });
            }}
            className="h-11 rounded-xl text-gray-900 border-gray-300 focus:border-blue-500"
            placeholder="Re-enter password"
          />
          {errors.confirm_password && <p className="text-xs text-red-600 mt-1">{errors.confirm_password}</p>}
        </div>

        {/* PIN */}
        <div>
          <Label className="text-gray-900 font-medium mb-1.5 flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-amber-500" /> {t('createPin')} *
          </Label>
          <Input
            type="password"
            inputMode="numeric"
            maxLength="4"
            value={formData.pin}
            onChange={(e) => {
              setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') });
              setErrors({ ...errors, pin: '' });
            }}
            className="h-11 rounded-xl text-gray-900 border-gray-300 focus:border-amber-500"
            placeholder="••••"
          />
          {errors.pin && <p className="text-xs text-red-600 mt-1">{errors.pin}</p>}
          <p className="text-xs text-gray-600 mt-1">{t('forQuickUnlock')}</p>
        </div>

        {/* Optional Fields */}
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">{t('optionalInformation')}</p>

          <div>
            <Label className="text-gray-900 font-medium mb-1.5 text-sm">{t('dateOfBirth')}</Label>
            <Input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="h-11 rounded-xl text-gray-900 border-gray-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-gray-900 font-medium mb-1.5 text-sm">{t('city')}</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="h-11 rounded-xl text-gray-900 border-gray-300"
                placeholder="Mumbai"
              />
            </div>
            <div>
              <Label className="text-gray-900 font-medium mb-1.5 text-sm">{t('state')}</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="h-11 rounded-xl text-gray-900 border-gray-300"
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-900 font-medium mb-1.5 text-sm">{t('bloodGroup')}</Label>
            <select
              value={formData.blood_group}
              onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              className="w-full h-11 rounded-xl border border-gray-300 px-3 text-sm text-gray-900 focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="">{t('select')}</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-3 pt-4">
          <Checkbox
            id="terms"
            checked={formData.agreed_to_terms}
            onCheckedChange={(checked) => {
              setFormData({ ...formData, agreed_to_terms: checked });
              setErrors({ ...errors, agreed_to_terms: '' });
            }}
            className="mt-0.5 border-gray-400 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-800 leading-snug cursor-pointer font-medium">
            {t('agreeToTerms')} <span className="text-rose-600 font-bold">{t('termsOfService')}</span> {t('and')} <span className="text-rose-600 font-bold">{t('privacyPolicy')}</span>
          </label>
        </div>
        {errors.agreed_to_terms && <p className="text-xs text-red-600 font-medium">{errors.agreed_to_terms}</p>}

        {errors.submit && (
          <div className="bg-red-50 p-3 rounded-xl flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-700 font-medium">{errors.submit}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 shadow-lg text-white"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('creatingAccount')}
            </div>
          ) : t('createAccount')}
        </Button>
      </form>

      <div className="mt-8 text-center pb-8">
        <p className="text-gray-600 text-sm font-medium">
          {t('alreadyHaveAccount')}{' '}
          <button
            onClick={() => navigate(createPageUrl('SignIn'))}
            className="text-rose-600 font-bold hover:underline"
          >
            {t('signIn')}
          </button>
        </p>
      </div>
    </div>
  );
}