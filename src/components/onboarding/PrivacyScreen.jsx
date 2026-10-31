import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, Lock, Heart, Bell, Check } from "lucide-react";

const privacyPoints = [
  {
    icon: Lock,
    title: "Your data stays private",
    description: "Stored securely in your account and never sold. When you chat, VerseAI reads your logs to personalise its replies"
  },
  {
    icon: Heart,
    title: "AI is supportive, not medical",
    description: "VerseAI offers care and guidance, not diagnosis"
  },
  {
    icon: Bell,
    title: "You control notifications",
    description: "Customize when and how you receive reminders"
  }
];

export default function PrivacyScreen({ onComplete, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="min-h-screen bg-gradient-to-b from-rose-50 to-purple-50 px-6 py-12"
      style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #F5F3FF 100%)' }}
    >
      {/* Header */}
      <div className="text-center mb-10 max-w-sm mx-auto">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Shield className="w-10 h-10 text-rose-500" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Privacy Matters</h2>
        <p className="text-gray-500">Here's how we keep you safe</p>
      </div>

      {/* Privacy Points */}
      <div className="space-y-4 max-w-sm mx-auto mb-8">
        {privacyPoints.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <point.icon className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{point.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{point.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Agreement Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-sm mx-auto bg-purple-50 rounded-2xl p-5 mb-32"
      >
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            By continuing, you agree that this app is for personal wellness support only.
            For medical concerns, please consult a healthcare professional.
          </p>
        </div>
      </motion.div>

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
            onClick={onComplete}
            className="flex-1 py-6 rounded-2xl bg-gradient-to-r from-rose-400 to-purple-400 shadow-lg shadow-rose-200/50"
          >
            Continue to App
          </Button>
        </div>
      </div>
    </motion.div>
  );
}