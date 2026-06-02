import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  Award,
  CheckCircle,
} from 'lucide-react';
import { Card, Button, Textarea, AliAvatar, AliTypingIndicator } from '@/components';
import { reflectionsOps, focusSessionsOps } from '@/store/db';
import type { ReflectionReport, FocusSession } from '@/types';
import { generateId, formatDate, getDateString } from '@/utils/helpers';

interface ReflectionPanelProps {
  onComplete?: () => void;
}

export function ReflectionPanel({ onComplete }: ReflectionPanelProps) {
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [accomplishments, setAccomplishments] = useState('');
  const [reflection, setReflection] = useState<ReflectionReport | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  const handleSubmit = async () => {
    setStep('processing');
    
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate reflection
    const report: ReflectionReport = {
      id: generateId(),
      date: getDateString(),
      focusSessionId: generateId(),
      accomplishments,
      productivityScore: Math.floor(Math.random() * 30) + 70,
      insights: generateInsights(accomplishments),
      suggestions: generateSuggestions(),
      createdAt: new Date(),
    };

    await reflectionsOps.add(report);
    setReflection(report);
    setStep('result');
  };

  const generateInsights = (text: string): string[] => {
    const insights: string[] = [];
    
    if (text.toLowerCase().includes('completed') || text.toLowerCase().includes('finished')) {
      insights.push('You demonstrated strong completion orientation during this session.');
    }
    if (text.length > 100) {
      insights.push('You engaged deeply with your work, showing high focus levels.');
    }
    if (text.toLowerCase().includes('learn') || text.toLowerCase().includes('study')) {
      insights.push('Learning activities help build long-term knowledge retention.');
    }
    if (text.toLowerCase().includes('problem') || text.toLowerCase().includes('solve')) {
      insights.push('Problem-solving sessions strengthen critical thinking skills.');
    }
    
    insights.push('Consistent focus sessions lead to compound productivity gains.');
    insights.push('Taking breaks actually improves focus when you return.');
    
    return insights.slice(0, 4);
  };

  const generateSuggestions = (): string[] => {
    return [
      'Try breaking large tasks into smaller, manageable chunks',
      'Consider using the Pomodoro technique for better focus',
      'Review your accomplishments before starting your next session',
      'Take a short walk between focus sessions to refresh your mind',
      'Keep a daily journal to track patterns in your productivity',
    ];
  };

  const handleComplete = () => {
    onComplete?.();
  };

  return (
    <div className="space-y-6">
      {step === 'input' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <AliAvatar size="lg" animated />
            <div>
              <h3 className="text-xl font-bold">Great job!</h3>
              <p className="text-gray-400">Let's reflect on your session</p>
            </div>
          </div>

          {/* Prompt */}
          <Card className="bg-gradient-to-br from-purple-600/10 to-crimson/10">
            <div className="flex items-start gap-3">
              <Lightbulb size={24} className="text-yellow-400 mt-1" />
              <div>
                <p className="text-lg font-medium mb-2">What did you accomplish?</p>
                <p className="text-sm text-gray-400">
                  Take a moment to reflect on what you achieved during this focus session. 
                  This helps reinforce your progress and identify patterns.
                </p>
              </div>
            </div>
          </Card>

          {/* Input */}
          <Textarea
            placeholder="I completed the introduction section of my report, reviewed notes for the upcoming exam, and organized my project files..."
            value={accomplishments}
            onChange={(e) => setAccomplishments(e.target.value)}
            rows={5}
          />

          {/* Quick Options */}
          <div className="flex flex-wrap gap-2">
            {['Completed tasks', 'Learned something', 'Made progress', 'Solved a problem'].map((option) => (
              <button
                key={option}
                onClick={() => setAccomplishments((prev) => (prev ? prev + ' ' + option : option))}
                className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-gray-300 hover:bg-white/20 transition-colors"
              >
                + {option}
              </button>
            ))}
          </div>

          {/* Submit */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!accomplishments.trim()}
            className="w-full"
            icon={<Brain size={20} />}
          >
            Generate Reflection
          </Button>
        </motion.div>
      )}

      {step === 'processing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 space-y-6"
        >
          <AliTypingIndicator />
          <div>
            <p className="text-xl font-bold mb-2">ALI is analyzing your session...</p>
            <p className="text-gray-400">Generating personalized insights</p>
          </div>
          <div className="flex justify-center gap-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-crimson rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {step === 'result' && reflection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Score */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 mb-4">
              <Award size={18} />
              <span className="font-semibold">Reflection Complete</span>
            </div>
            <div className="text-6xl font-bold gradient-text">{reflection.productivityScore}</div>
            <p className="text-gray-400 mt-2">Productivity Score</p>
          </div>

          {/* Accomplishments */}
          <Card>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-400" />
              What You Accomplished
            </h4>
            <p className="text-gray-300">{reflection.accomplishments}</p>
          </Card>

          {/* Insights */}
          <Card className="bg-gradient-to-br from-purple-600/10 to-transparent">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-yellow-400" />
              Key Insights
            </h4>
            <div className="space-y-3">
              {reflection.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-300">{insight}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Suggestions */}
          <Card>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" />
              Suggestions for Next Session
            </h4>
            <div className="space-y-2">
              {reflection.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Target size={16} className="text-crimson" />
                  <p className="text-sm text-gray-300">{suggestion}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Complete */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleComplete}
            className="w-full"
          >
            Continue
          </Button>
        </motion.div>
      )}
    </div>
  );
}