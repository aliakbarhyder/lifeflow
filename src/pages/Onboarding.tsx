import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Target,
  BookOpen,
  Brain,
  Award,
  Zap,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button, Card, AliAvatar, Toggle } from '@/components';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to LifeFlow AI',
    subtitle: 'Your AI-powered productivity companion',
    description: 'Master your focus, supercharge your learning, and achieve your goals with the help of ALI AI.',
    icon: <Zap size={48} className="text-crimson" />,
    action: null,
  },
  {
    id: 'focus',
    title: 'Smart Focus Shield',
    subtitle: 'Block distractions, stay productive',
    description: 'Block distracting websites during focus sessions. Track your progress and build streaks.',
    icon: <Target size={48} className="text-crimson" />,
    action: 'features.focus',
  },
  {
    id: 'learning',
    title: 'AI-Powered Learning',
    subtitle: 'Flashcards, quizzes, and more',
    description: 'Create flashcards and quizzes automatically. Let ALI help you learn faster and retain more.',
    icon: <Brain size={48} className="text-purple-400" />,
    action: 'features.learning',
  },
  {
    id: 'notes',
    title: 'Universal Notes',
    subtitle: 'Capture everything, find anything',
    description: 'Create notes, quotes, and highlights. Tag and search through your knowledge instantly.',
    icon: <BookOpen size={48} className="text-blue-400" />,
    action: 'features.notes',
  },
  {
    id: 'achievements',
    title: 'Achievements & Growth',
    subtitle: 'Level up your productivity',
    description: 'Earn XP, unlock badges, and track your progress. Compete with yourself and celebrate wins.',
    icon: <Award size={48} className="text-yellow-400" />,
    action: 'features.achievements',
  },
  {
    id: 'ready',
    title: "You're All Set!",
    subtitle: 'Ready to transform your productivity',
    description: "Let's start your journey to becoming more focused, productive, and successful.",
    icon: <Sparkles size={48} className="text-green-400" />,
    action: null,
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [settings, setSettings] = useState({
    enableNotifications: true,
    enableAutoFocus: false,
    enableAnalytics: true,
  });

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</span>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Skip
            </button>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-crimson to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="text-center py-12 px-8">
              {/* ALI Avatar */}
              <div className="flex justify-center mb-6">
                <AliAvatar size="xl" glow animated />
              </div>

              {/* Icon */}
              <motion.div
                className="flex justify-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <div className="p-6 rounded-full bg-white/5">
                  {step.icon}
                </div>
              </motion.div>

              {/* Content */}
              <motion.h1
                className="text-3xl font-bold mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {step.title}
              </motion.h1>
              
              <motion.p
                className="text-lg text-crimson mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {step.subtitle}
              </motion.p>
              
              <motion.p
                className="text-gray-400 mb-8 max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {step.description}
              </motion.p>

              {/* Settings (only on last step) */}
              {isLastStep && (
                <motion.div
                  className="space-y-4 mb-8 max-w-sm mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="p-4 rounded-xl bg-white/5">
                    <Toggle
                      checked={settings.enableNotifications}
                      onChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
                      label="Enable Notifications"
                      description="Get reminders and updates"
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <Toggle
                      checked={settings.enableAutoFocus}
                      onChange={(checked) => setSettings({ ...settings, enableAutoFocus: checked })}
                      label="Auto Focus Mode"
                      description="Automatically start focus sessions"
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <Toggle
                      checked={settings.enableAnalytics}
                      onChange={(checked) => setSettings({ ...settings, enableAnalytics: checked })}
                      label="Analytics"
                      description="Track your productivity trends"
                    />
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={isFirstStep}
            icon={<ChevronLeft size={18} />}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-crimson w-6'
                    : index < currentStep
                    ? 'bg-crimson/50'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <Button
            variant="primary"
            onClick={handleNext}
            icon={isLastStep ? <Check size={18} /> : <ChevronRight size={18} />}
          >
            {isLastStep ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}