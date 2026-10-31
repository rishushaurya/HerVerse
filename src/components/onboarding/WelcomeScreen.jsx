import React from 'react';
import { CalendarDays, HeartPulse, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function WelcomeScreen({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-lavender-50 flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #FDF2F8 50%, #F5F3FF 100%)' }}
    >
      {/* Decorative elements */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        className="absolute top-20 right-10 w-16 h-16 bg-rose-100 rounded-full opacity-60"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute top-40 left-8 w-10 h-10 bg-purple-100 rounded-full opacity-50"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: "spring" }}
        className="absolute bottom-32 right-12 w-12 h-12 bg-pink-100 rounded-full opacity-40"
      />

      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="mb-8"
      >
        <div className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl shadow-rose-200/50 overflow-hidden border-4 border-white">
          <img src="/logo.jpeg" alt="Herverse Logo" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* App Name */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent mb-3"
      >
        Herverse
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-gray-600 text-lg leading-relaxed max-w-xs mb-12"
      >
        every women every phase
      </motion.p>

      {/* Illustration elements */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        className="flex gap-4 mb-12"
      >
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center">
          <CalendarDays className="w-7 h-7 text-rose-500" />
        </div>
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
          <HeartPulse className="w-7 h-7 text-purple-500" />
        </div>
        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-pink-500" />
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-xs"
      >
        <Button
          onClick={onNext}
          className="w-full py-6 text-lg font-semibold rounded-2xl bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 shadow-lg shadow-rose-200/50 transition-all duration-300 hover:scale-105"
        >
          Get Started
        </Button>
      </motion.div>

      {/* Footer text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-sm text-gray-400"
      >
        Made for women everywhere
      </motion.p>
    </motion.div>
  );
}