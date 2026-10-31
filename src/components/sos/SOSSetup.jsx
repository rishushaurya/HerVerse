import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Shield, Phone, Plus, AlertTriangle, CheckCircle } from "lucide-react";

export default function SOSSetup({ onComplete }) {
  const [step, setStep] = useState(1);
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [error, setError] = useState('');

  const preFilledContacts = [
    { name: 'Police', phone: '100', relationship: 'Emergency', isPrefilled: true },
    { name: 'Women Helpline', phone: '1091', relationship: 'Support', isPrefilled: true }
  ];

  const validatePhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone) || /^\d{3,5}$/.test(phone);
  };

  const handleAddContact = () => {
    setError('');
    
    if (!newContact.name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!newContact.phone.trim()) {
      setError('Phone number is required');
      return;
    }
    
    if (!validatePhone(newContact.phone)) {
      setError('Invalid phone number');
      return;
    }

    setContacts([...contacts, { ...newContact }]);
    setNewContact({ name: '', phone: '', relationship: '' });
  };

  const handleComplete = () => {
    if (contacts.length === 0) {
      setError('Please add at least one personal contact');
      return;
    }
    onComplete([...preFilledContacts, ...contacts]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Emergency SOS Setup</h2>
              <p className="text-gray-500 leading-relaxed">
                Set up your emergency contacts. They'll be alerted instantly if you trigger an SOS.
              </p>
            </div>

            <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">Important</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Emergency numbers are pre-added</li>
                    <li>• Add at least 1 trusted contact</li>
                    <li>• They receive your location instantly</li>
                    <li>• Test before relying on this feature</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              className="w-full py-6 rounded-xl bg-gradient-to-r from-rose-400 to-purple-400"
            >
              Continue Setup
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Pre-filled Emergency Contacts</h2>
              <p className="text-sm text-gray-500">These are always available</p>
            </div>

            <div className="space-y-3">
              {preFilledContacts.map((contact, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.phone}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => setStep(3)}
                className="w-full py-5 rounded-xl bg-gradient-to-r from-rose-400 to-purple-400"
              >
                Add Personal Contacts
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Add Trusted Contacts</h2>
              <p className="text-sm text-gray-500">At least 1 contact required</p>
            </div>

            {/* Added Contacts */}
            {contacts.length > 0 && (
              <div className="space-y-2 mb-4">
                {contacts.map((contact, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Contact Form */}
            <div className="space-y-3 border-t pt-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Contact Name *</label>
                <Input
                  placeholder="Mom, Sister, Friend..."
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
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
                <label className="block text-sm font-medium mb-1.5">Relationship</label>
                <Input
                  placeholder="Mother, Friend..."
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}

              <Button
                onClick={handleAddContact}
                variant="outline"
                className="w-full py-4 rounded-xl border-2"
              >
                <Plus className="w-4 h-4 mr-2" /> Add This Contact
              </Button>
            </div>

            {/* Complete Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleComplete}
                disabled={contacts.length === 0}
                className="w-full py-5 rounded-xl bg-gradient-to-r from-rose-400 to-purple-400 disabled:opacity-50"
              >
                {contacts.length === 0 ? 'Add At Least 1 Contact' : `Complete Setup (${contacts.length} added)`}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}