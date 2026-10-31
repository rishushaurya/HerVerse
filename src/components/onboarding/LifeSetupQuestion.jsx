import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function LifeSetupQuestion({ 
  question, 
  description,
  options, 
  selected, 
  onSelect, 
  onNext, 
  onBack,
  onSkip,
  icon: Icon,
  currentStep,
  totalSteps
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="min-h-screen bg-gradient-to-b from-rose-50 to-purple-50 px-6 py-8"
      style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #F5F3FF 100%)' }}
    >
      {/* Progress */}
      <div className="max-w-sm mx-auto mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
          <button onClick={onSkip} className="text-sm text-rose-400 font-medium">Skip</button>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            className="h-full bg-gradient-to-r from-rose-400 to-purple-400 rounded-full"
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8 max-w-sm mx-auto">
        {Icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Icon className="w-8 h-8 text-rose-500" />
          </motion.div>
        )}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{question}</h2>
        {description && <p className="text-gray-500">{description}</p>}
      </div>

      {/* Options */}
      <div className="space-y-3 max-w-sm mx-auto mb-32">
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(option.value)}
            className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all duration-300 ${
              selected === option.value 
                ? 'border-rose-400 bg-rose-50 shadow-lg shadow-rose-100' 
                : 'border-gray-100 bg-white hover:border-rose-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              {option.icon && (
                <span className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <option.icon className="w-5 h-5 text-rose-500" aria-hidden="true" />
                </span>
              )}
              <div className="text-left">
                <p className="font-medium text-gray-800">{option.label}</p>
                {option.description && (
                  <p className="text-sm text-gray-500">{option.description}</p>
                )}
              </div>
            </div>
            {selected === option.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
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