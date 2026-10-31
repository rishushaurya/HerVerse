import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Phone, MessageCircle, Shield, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SOSSetup from '@/components/sos/SOSSetup';
import { useLanguage } from '@/lib/LanguageContext';

export default function SOSButton({ contacts = [], onAddContact, onBulkAddContacts }) {
  const { t } = useLanguage();
  const [showSetup, setShowSetup] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [countdown, setCountdown] = useState(0);
  const [alertActive, setAlertActive] = useState(false);
  const [alertSending, setAlertSending] = useState(false);
  const [locationUrl, setLocationUrl] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | ok | unavailable

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && showConfirm) {
      triggerAlert();
    }
  }, [countdown]);

  const handleSOS = () => {
    if (contacts.length === 0) {
      setIsOpen(false); // otherwise the dialog covers the setup screen
      setShowSetup(true);
    } else {
      setShowConfirm(true);
      setCountdown(3);
    }
  };

  const handleSetupComplete = (newContacts) => {
    setShowSetup(false);
    if (onBulkAddContacts) {
      onBulkAddContacts(newContacts);
    }
  };

  // Browsers can't send SMS silently: we get her location, then open the SMS app pre-filled
  // for every contact. The banner keeps one-tap buttons in case the browser blocks the auto-open.
  const smsHref = (url) => {
    const body = `${t('sosMessage')}${url ? ` ${t('sosMyLocation')} ${url}` : ''} (HerVerse)`;
    return `sms:${contacts.map(c => c.phone).join(',')}?body=${encodeURIComponent(body)}`;
  };

  const getLocation = () => new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve(`https://maps.google.com/?q=${coords.latitude},${coords.longitude}`),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });

  const triggerAlert = async () => {
    setShowConfirm(false);
    setAlertSending(true);

    // Vibrate
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    const url = await getLocation();
    setLocationUrl(url);
    setLocationStatus(url ? 'ok' : 'unavailable');
    setAlertSending(false);
    setAlertActive(true);
    setIsOpen(false);
    window.location.href = smsHref(url);
  };

  const shareLocation = async () => {
    try {
      await navigator.share({ text: `${t('sosMessage')}${locationUrl ? ` ${t('sosMyLocation')} ${locationUrl}` : ''}` });
    } catch {
      // Share sheet closed or unsupported; SMS and call buttons still work.
    }
  };

  const stopAlert = () => {
    setAlertActive(false);
  };

  const handleSaveContact = () => {
    if (newContact.name && newContact.phone) {
      onAddContact(newContact);
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddContact(false);
    }
  };

  return (
    <>
      {/* SOS Setup Modal */}
      {showSetup && (
        <SOSSetup onComplete={handleSetupComplete} />
      )}

      {/* Emergency Active Banner */}
      <AnimatePresence>
        {alertActive && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 bg-red-500 text-white px-5 py-4 z-50 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <AlertCircle className="w-6 h-6" />
                </motion.div>
                <div>
                  <p className="font-bold text-sm">{t('emergencyAlertActive')}</p>
                  <p className="text-xs opacity-90">
                    {locationStatus === 'ok' ? t('sosLocationReady') : t('sosNoLocation')} · {t('contactsNotified')}
                  </p>
                </div>
              </div>
              <Button
                onClick={stopAlert}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-red-600 rounded-xl"
              >
                {t('stopAlert')}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <a href={smsHref(locationUrl)} className="col-span-2 bg-white text-red-600 font-semibold text-sm rounded-xl py-2.5 text-center">
                {t('sosTextContacts')}
              </a>
              <a href="tel:112" className="bg-red-700/60 font-semibold text-sm rounded-xl py-2.5 text-center">
                {t('sosCall112')}
              </a>
              {typeof navigator.share === 'function' ? (
                <button onClick={shareLocation} className="bg-red-700/60 font-semibold text-sm rounded-xl py-2.5">
                  {t('sosShareLocation')}
                </button>
              ) : (
                <a href="tel:1091" className="bg-red-700/60 font-semibold text-sm rounded-xl py-2.5 text-center">
                  1091
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 ${alertActive
            ? 'bg-red-600 shadow-red-300 animate-pulse'
            : 'bg-gradient-to-br from-rose-400 to-rose-500 shadow-rose-200'
          }`}
      >
        <Shield className="w-6 h-6 text-white" />
      </motion.button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md mx-4 rounded-3xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800">
              {t('safetyOptions')}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {showAddContact ? (
              <motion.div
                key="add-contact"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 p-2"
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{t('addContactFirst')}</h3>
                  <p className="text-sm text-gray-500">{t('addTrustedPerson')}</p>
                </div>

                <div>
                  <Label className="mb-2 block">{t('contactName')}</Label>
                  <Input
                    placeholder={t('contactPlaceholder')}
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">{t('phoneNumber')}</Label>
                  <div className="flex gap-2">
                    <div className="w-14 bg-gray-100 rounded-xl flex items-center justify-center text-sm">+91</div>
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      maxLength="10"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value.replace(/\D/g, '') })}
                      className="flex-1 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">{t('relationshipOptional')}</Label>
                  <Input
                    placeholder="Mother, Friend..."
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddContact(false);
                      setNewContact({ name: '', phone: '', relationship: '' });
                    }}
                    className="flex-1 py-4 rounded-xl"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={handleSaveContact}
                    disabled={!newContact.name || !newContact.phone || newContact.phone.length !== 10}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-rose-400 to-purple-400"
                  >
                    <Plus className="w-4 h-4 mr-2" /> {t('addContact')}
                  </Button>
                </div>
              </motion.div>
            ) : alertSending ? (
              <motion.div
                key="sending"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{t('alerting')}</h3>
                <p className="text-gray-500">{t('notifyingContacts')}</p>
                <div className="flex justify-center gap-2 mt-4">
                  {contacts.slice(0, 3).map((contact, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center"
                    >
                      <span className="text-rose-600 font-semibold">{contact.name[0]}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : showConfirm ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center p-4"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    backgroundColor: ['#fee2e2', '#fecaca', '#fee2e2']
                  }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-24 h-24 rounded-full flex flex-col items-center justify-center mx-auto mb-4"
                >
                  <AlertCircle className="w-10 h-10 text-red-500 mb-1" />
                  <span className="text-3xl font-bold text-red-600">{countdown}</span>
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {t('sendingAlert')}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {t('alertDescription')}
                </p>
                <Button
                  variant="outline"
                  className="w-full py-5 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setShowConfirm(false);
                    setCountdown(0);
                  }}
                >
                  {t('cancelAlert')}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 p-2"
              >
                <p className="text-center text-gray-500 text-sm mb-6">
                  {t('safeHere')}
                </p>

                <Button
                  onClick={handleSOS}
                  className="w-full py-6 bg-red-500 hover:bg-red-600 rounded-2xl flex items-center justify-center gap-3"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">{t('alertContacts')}</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full py-6 rounded-2xl border-2 flex items-center justify-center gap-3"
                  onClick={() => window.open('tel:100')}
                >
                  <Phone className="w-5 h-5 text-rose-500" />
                  <span>{t('callPolice')}</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full py-6 rounded-2xl border-2 flex items-center justify-center gap-3"
                  onClick={() => window.open('tel:1091')}
                >
                  <MessageCircle className="w-5 h-5 text-purple-500" />
                  <span>{t('womenHelpline')}</span>
                </Button>

                {contacts.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-3">{t('quickCall')}</p>
                    <div className="space-y-2">
                      {contacts.slice(0, 2).map((contact, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          className="w-full justify-start gap-3 py-4"
                          onClick={() => window.open(`tel:${contact.phone}`)}
                        >
                          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                            <span className="text-rose-500 font-semibold">
                              {contact.name[0]}
                            </span>
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-800">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.relationship}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}