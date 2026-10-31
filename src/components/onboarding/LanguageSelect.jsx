import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Globe } from "lucide-react";

const languages = [
  { code: 'english', name: 'English', native: 'English', badge: 'EN' },
  { code: 'hindi', name: 'Hindi', native: 'हिंदी', badge: 'हि' },
  { code: 'kannada', name: 'Kannada', native: 'ಕನ್ನಡ', badge: 'ಕ' }
];

export default function LanguageSelect({ selected, onSelect, onNext, onBack }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="min-h-screen bg-gradient-to-b from-rose-50 to-purple-50 px-6 py-12"
      style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #F5F3FF 100%)' }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Globe className="w-8 h-8 text-purple-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Language</h2>
        <p className="text-gray-500">Select the language you're most comfortable with</p>
      </div>

      {/* Language Options */}
      <div className="space-y-4 max-w-sm mx-auto">
        {languages.map((lang, index) => (
          <motion.button
            key={lang.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(lang.code)}
            className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-300 ${
              selected === lang.code 
                ? 'border-rose-400 bg-rose-50 shadow-lg shadow-rose-100' 
                : 'border-gray-100 bg-white hover:border-rose-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 font-semibold flex items-center justify-center">{lang.badge}</span>
              <div className="text-left">
                <p className="font-semibold text-gray-800">{lang.name}</p>
                <p className="text-sm text-gray-500">{lang.native}</p>
              </div>
            </div>
            {selected === lang.code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center"
              >
                <Check className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-sm mx-auto flex gap-3">
          <Button 
            variant="outline"
            onClick={onBack}
            className="flex-1 py-6 rounded-2xl border-2 border-gray-200"
          >
            Back
          </Button>
          <Button 
            onClick={onNext}
            disabled={!selected}
            className="flex-1 py-6 rounded-2xl bg-gradient-to-r from-rose-400 to-purple-400 disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  );
}