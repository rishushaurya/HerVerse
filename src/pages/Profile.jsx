import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { useTheme } from '@/lib/ThemeContext';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { User, Globe, Bell, Shield, Phone, Palette, LogOut, Plus, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import MobileNav from '@/components/common/MobileNav';
import SettingsSection from '@/components/profile/SettingsSection';

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, switchTheme } = useTheme();
  const { language, switchLanguage, t } = useLanguage();
  const [editModal, setEditModal] = useState(null);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePin, setDeletePin] = useState('');
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editPeriodTracking, setEditPeriodTracking] = useState(false);
  const [editCycleLength, setEditCycleLength] = useState('28');

  const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me() });
  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: async () => { const prefs = await base44.entities.UserPreferences.list(); return prefs[0] || null; }
  });
  const { data: contacts = [] } = useQuery({ queryKey: ['emergencyContacts'], queryFn: () => base44.entities.EmergencyContact.list() });

  const updatePrefsMutation = useMutation({
    // Users who skipped onboarding have no preferences record yet: create it on first change.
    mutationFn: (data) => preferences ? base44.entities.UserPreferences.update(preferences.id, data) : base44.entities.UserPreferences.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['preferences'] })
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateProfile(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['user'] }); setEditModal(null); }
  });

  const addContactMutation = useMutation({
    mutationFn: (data) => base44.entities.EmergencyContact.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] }); setNewContact({ name: '', phone: '', relationship: '' }); setEditModal(null); }
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id) => base44.entities.EmergencyContact.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['emergencyContacts'] })
  });

  const handleLogout = () => base44.auth.logout(createPageUrl('SignIn'));

  const handleDeleteAccount = async () => {
    try {
      await base44.auth.deleteAccount();
      base44.auth.logout(createPageUrl('SignIn'));
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  // Instant apply & close helpers
  const handleThemeSelect = (themeValue) => {
    switchTheme(themeValue);
    updatePrefsMutation.mutate({ theme: themeValue });
    setEditModal(null); // Close immediately
  };

  const handleLanguageSelect = (lang) => {
    switchLanguage(lang);
    updatePrefsMutation.mutate({ language: lang });
    setEditModal(null); // Close immediately
  };

  const handleReminderSelect = (style) => {
    updatePrefsMutation.mutate({ reminder_style: style });
    setEditModal(null); // Close immediately
  };

  const openProfileEdit = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditAge(preferences?.age?.toString() || '');
    setEditPeriodTracking(preferences?.period_tracking || false);
    setEditCycleLength(preferences?.average_cycle_length?.toString() || '28');
    setEditModal('profile');
  };

  const handleProfileSave = () => {
    // Update user name if changed
    if (editName !== user?.name) {
      updateUserMutation.mutate({ name: editName });
    }
    // Update preferences
    const prefUpdates = {};
    if (editAge) prefUpdates.age = parseInt(editAge);
    if (editPeriodTracking !== preferences?.period_tracking) prefUpdates.period_tracking = editPeriodTracking;
    if (editCycleLength !== preferences?.average_cycle_length?.toString()) prefUpdates.average_cycle_length = parseInt(editCycleLength);
    if (Object.keys(prefUpdates).length > 0) {
      updatePrefsMutation.mutate(prefUpdates);
    }
    setEditModal(null);
  };

  const languageLabels = { english: 'English', hindi: 'हिंदी', kannada: 'ಕನ್ನಡ' };
  const reminderLabels = { gentle: 'Gentle', normal: 'Normal', minimal: 'Minimal' };
  const themeLabels = {
    light: 'Rose Petal', soft_dark: 'Midnight Bloom', emerald_serenity: 'Forest Calm',
    royal_amethyst: 'Royal Amethyst', sunset_glow: 'Sunset Glow'
  };

  const currentTheme = preferences?.theme || theme || 'light';
  const currentLang = preferences?.language || language || 'english';

  const accountSettings = [
    { icon: User, label: t('personalInfo'), description: user?.name || 'Not set', iconBg: 'bg-rose-50', iconColor: 'text-rose-500', onClick: openProfileEdit },
    { icon: Globe, label: t('language'), value: languageLabels[currentLang], iconBg: 'bg-purple-50', iconColor: 'text-purple-500', onClick: () => setEditModal('language') }
  ];

  const notificationSettings = [
    { icon: Bell, label: t('reminderStyle'), value: reminderLabels[preferences?.reminder_style] || 'Gentle', iconBg: 'bg-amber-50', iconColor: 'text-amber-500', onClick: () => setEditModal('reminder_style') }
  ];

  const privacySettings = [
    { icon: Phone, label: t('emergencyContactsLabel'), description: `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`, iconBg: 'bg-green-50', iconColor: 'text-green-500', onClick: () => setEditModal('contacts') }
  ];

  const resourceSettings = [
    { icon: Shield, label: t('governmentSchemes'), description: t('yourRightsAndBenefits'), iconBg: 'bg-orange-50', iconColor: 'text-orange-500', onClick: () => navigate(createPageUrl('GovernmentSchemes')) },
    { icon: Phone, label: t('helplineNumbers'), description: t('emergencyContacts'), iconBg: 'bg-red-50', iconColor: 'text-red-500', onClick: () => navigate(createPageUrl('Helplines')) }
  ];

  const appSettings = [
    { icon: Palette, label: t('theme'), value: themeLabels[currentTheme] || 'Rose Petal', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500', onClick: () => setEditModal('theme') }
  ];

  const themes = [
    { value: 'light', label: 'Rose Petal', desc: 'Bright, fresh & feminine', preview: 'from-rose-300 to-pink-200' },
    { value: 'soft_dark', label: 'Midnight Bloom', desc: 'Sleek dark elegance', preview: 'from-slate-800 to-indigo-900' },
    { value: 'emerald_serenity', label: 'Forest Calm', desc: 'Serene nature vibes', preview: 'from-emerald-300 to-teal-200' },
    { value: 'royal_amethyst', label: 'Royal Amethyst', desc: 'Regal & luxurious', preview: 'from-purple-400 to-violet-300' },
    { value: 'sunset_glow', label: 'Sunset Glow', desc: 'Warm golden radiance', preview: 'from-amber-300 to-orange-200' }
  ];

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300" style={{ background: 'var(--app-bg-gradient)', color: 'var(--app-text-primary)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--app-accent-gradient)' }}>
            <span className="text-2xl text-white font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: 'var(--app-text-primary)' }}>{user?.name || 'User'}</h1>
            <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{user?.email}</p>
          </div>
          <button onClick={openProfileEdit} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--app-accent-light)' }}>
            <Edit3 className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
          </button>
        </motion.div>
      </div>

      {/* Settings */}
      <div className="px-5">
        <SettingsSection title={t('account')} items={accountSettings} />
        <SettingsSection title={t('notifications')} items={notificationSettings} />
        <SettingsSection title={t('privacyAndSafety')} items={privacySettings} />
        <SettingsSection title={t('resources')} items={resourceSettings} />
        <SettingsSection title={t('app')} items={appSettings} />

        <SettingsSection title={t('dangerZone')} items={[{
          icon: Trash2, label: t('deleteAccount'), description: t('deleteWarningText'), iconBg: 'bg-red-50', iconColor: 'text-red-500', onClick: () => setEditModal('delete_account')
        }]} />

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border font-medium mt-4"
          style={{ background: 'var(--app-card-bg)', borderColor: 'var(--app-card-border)', color: 'var(--app-accent)' }}
        >
          <LogOut className="w-5 h-5" />
          {t('signOut')}
        </motion.button>

        <p className="text-center text-sm mt-6 pb-4" style={{ color: 'var(--app-text-muted)' }}>
          HerVerse v1.0 • {t('madeWithLove')}
        </p>
      </div>

      {/* ===== MODALS ===== */}

      {/* Profile Edit Modal */}
      <Dialog open={editModal === 'profile'} onOpenChange={() => setEditModal(null)}>
        <DialogContent className="sm:max-w-md mx-4 rounded-3xl max-h-[85vh] overflow-y-auto" style={{ background: 'var(--app-modal-bg)', color: 'var(--app-text-primary)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--app-text-primary)' }}>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>Full Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }} />
            </div>
            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>Email</Label>
              <Input value={editEmail} disabled className="rounded-xl opacity-60" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }} />
              <p className="text-xs mt-1" style={{ color: 'var(--app-text-muted)' }}>Email cannot be changed</p>
            </div>
            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>Age</Label>
              <Input type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} placeholder="25" className="rounded-xl" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--app-card-border)', background: 'var(--app-card-bg)' }}>
              <div>
                <p className="font-medium" style={{ color: 'var(--app-text-primary)' }}>Period Tracking</p>
                <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>Enable menstrual cycle tracking</p>
              </div>
              <button
                onClick={() => setEditPeriodTracking(!editPeriodTracking)}
                className="w-12 h-7 rounded-full transition-all relative"
                style={{ background: editPeriodTracking ? 'var(--app-accent)' : 'var(--app-card-border)' }}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${editPeriodTracking ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            {editPeriodTracking && (
              <div>
                <Label className="text-sm mb-2 block" style={{ color: 'var(--app-text-secondary)' }}>Average Cycle Length (days)</Label>
                <Input type="number" value={editCycleLength} onChange={(e) => setEditCycleLength(e.target.value)} className="rounded-xl" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }} />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditModal(null)} className="flex-1 rounded-xl py-5">Cancel</Button>
              <Button onClick={handleProfileSave} className="flex-1 rounded-xl py-5 text-white" style={{ background: 'var(--app-accent-gradient)' }}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Modal — closes instantly on select */}
      <Dialog open={editModal === 'language'} onOpenChange={() => setEditModal(null)}>
        <DialogContent className="sm:max-w-md mx-4 rounded-3xl" style={{ background: 'var(--app-modal-bg)', color: 'var(--app-text-primary)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--app-text-primary)' }}>Select Language</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {Object.entries(languageLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleLanguageSelect(key)}
                className="w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between"
                style={{
                  borderColor: currentLang === key ? 'var(--app-accent)' : 'var(--app-card-border)',
                  background: currentLang === key ? 'var(--app-accent-light)' : 'var(--app-card-bg)',
                  color: 'var(--app-text-primary)'
                }}
              >
                <span className="font-medium">{label}</span>
                {currentLang === key && <span className="text-sm" style={{ color: 'var(--app-accent)' }}>✓ Active</span>}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminder Style Modal — closes instantly */}
      <Dialog open={editModal === 'reminder_style'} onOpenChange={() => setEditModal(null)}>
        <DialogContent className="sm:max-w-md mx-4 rounded-3xl" style={{ background: 'var(--app-modal-bg)', color: 'var(--app-text-primary)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--app-text-primary)' }}>Reminder Style</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {[
              { value: 'gentle', label: 'Gentle', desc: 'Soft, caring nudges' },
              { value: 'normal', label: 'Normal', desc: 'Clear reminders' },
              { value: 'minimal', label: 'Minimal', desc: 'Only important alerts' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleReminderSelect(option.value)}
                className="w-full p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: (preferences?.reminder_style || 'gentle') === option.value ? 'var(--app-accent)' : 'var(--app-card-border)',
                  background: (preferences?.reminder_style || 'gentle') === option.value ? 'var(--app-accent-light)' : 'var(--app-card-bg)',
                  color: 'var(--app-text-primary)'
                }}
              >
                <p className="font-medium">{option.label}</p>
                <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{option.desc}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Theme Modal — closes instantly on select */}
      <Dialog open={editModal === 'theme'} onOpenChange={() => setEditModal(null)}>
        <DialogContent className="sm:max-w-md mx-4 rounded-3xl" style={{ background: 'var(--app-modal-bg)', color: 'var(--app-text-primary)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--app-text-primary)' }}>Choose Theme</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {themes.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeSelect(option.value)}
                className="w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4"
                style={{
                  borderColor: currentTheme === option.value ? 'var(--app-accent)' : 'var(--app-card-border)',
                  background: currentTheme === option.value ? 'var(--app-accent-light)' : 'var(--app-card-bg)',
                  color: 'var(--app-text-primary)'
                }}
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${option.preview} flex-shrink-0`} />
                <div className="flex-1">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{option.desc}</p>
                </div>
                {currentTheme === option.value && <span style={{ color: 'var(--app-accent)' }}>✓</span>}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Emergency Contacts Modal */}
      <Dialog open={editModal === 'contacts'} onOpenChange={() => setEditModal(null)}>
        <DialogContent className="sm:max-w-md mx-4 rounded-3xl max-h-[80vh] overflow-y-auto" style={{ background: 'var(--app-modal-bg)', color: 'var(--app-text-primary)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--app-text-primary)' }}>Emergency Contacts</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--app-accent-light)' }}>
                <div>
                  <p className="font-medium" style={{ color: 'var(--app-text-primary)' }}>{contact.name}</p>
                  <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>{contact.phone}</p>
                  {contact.relationship && <p className="text-xs" style={{ color: 'var(--app-text-muted)' }}>{contact.relationship}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteContactMutation.mutate(contact.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--app-card-border)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--app-text-secondary)' }}>Add new contact</p>
              <Input placeholder="Name" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} className="rounded-xl" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }} />
              <Input placeholder="Phone number" type="tel" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} className="rounded-xl" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }} />
              <Input placeholder="Relationship (e.g., Mom, Friend)" value={newContact.relationship} onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })} className="rounded-xl" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }} />
              <Button onClick={() => addContactMutation.mutate(newContact)} disabled={!newContact.name || !newContact.phone} className="w-full rounded-xl text-white" style={{ background: 'var(--app-accent-gradient)' }}>
                <Plus className="w-4 h-4 mr-2" /> Add Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={editModal === 'delete_account'} onOpenChange={() => { setEditModal(null); setDeleteStep(1); setDeletePassword(''); setDeletePin(''); }}>
        <DialogContent className="sm:max-w-md mx-4 rounded-3xl" style={{ background: 'var(--app-modal-bg)', color: 'var(--app-text-primary)' }}>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {deleteStep === 1 && (
              <div className="space-y-4">
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <p className="text-sm text-red-800 font-medium mb-2 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Warning</p>
                  <p className="text-sm text-red-700 leading-relaxed">This action will permanently delete your account and all data:</p>
                  <ul className="text-sm text-red-700 mt-2 space-y-1 ml-4 list-disc">
                    <li>All planner tasks</li>
                    <li>Health logs & period tracking</li>
                    <li>AI chat history</li>
                    <li>Emergency contacts</li>
                    <li>User preferences</li>
                  </ul>
                  <p className="text-sm text-red-800 font-semibold mt-3">This cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setEditModal(null)} className="flex-1 rounded-xl">No, Keep Account</Button>
                  <Button onClick={() => setDeleteStep(2)} className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white">Yes, Delete</Button>
                </div>
              </div>
            )}
            {deleteStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--app-text-secondary)' }}>To confirm deletion, please verify your identity:</p>
                <div>
                  <Label className="text-sm mb-2">Enter your password</Label>
                  <Input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="rounded-xl" placeholder="Password" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }} />
                </div>
                <div>
                  <Label className="text-sm mb-2">Enter your 4-digit PIN</Label>
                  <Input type="password" inputMode="numeric" maxLength="4" value={deletePin} onChange={(e) => setDeletePin(e.target.value.replace(/\D/g, ''))} className="rounded-xl" placeholder="••••" style={{ background: 'var(--app-input-bg)', borderColor: 'var(--app-input-border)', color: 'var(--app-text-primary)' }} />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setDeleteStep(1)} className="flex-1 rounded-xl">Back</Button>
                  <Button
                    onClick={async () => { if (deletePassword && deletePin.length === 4) { setDeleteLoading(true); try { await handleDeleteAccount(); } catch (error) { alert('Failed to delete account.'); setDeleteLoading(false); } } }}
                    disabled={!deletePassword || deletePin.length !== 4 || deleteLoading}
                    className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Forever'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MobileNav currentPage="Profile" />
    </div>
  );
}