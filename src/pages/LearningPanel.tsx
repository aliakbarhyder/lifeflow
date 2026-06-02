import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  BookOpen,
  Brain,
  Zap,
  Play,
  CheckCircle,
  XCircle,
  ChevronRight,
  Lightbulb,
  FileText,
  Shuffle,
} from 'lucide-react';
import { Card, Button, Input, Textarea, Modal, AliAvatar } from '@/components';
import { flashcardsOps, notesOps } from '@/store/db';
import type { Flashcard, Quiz, QuizQuestion } from '@/types';
import { generateId } from '@/utils/helpers';

export function LearningPanel() {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'notes'>('flashcards');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isStudying, setIsStudying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    const all = await flashcardsOps.getAll();
    setFlashcards(all);
  };

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setIsStudying(false);
      setCurrentIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const markCard = async (correct: boolean) => {
    const card = flashcards[currentIndex];
    const updated: Flashcard = {
      ...card,
      correctCount: card.correctCount + (correct ? 1 : 0),
      incorrectCount: card.incorrectCount + (correct ? 0 : 1),
      nextReview: correct ? undefined : new Date(Date.now() + 86400000),
    };
    await flashcardsOps.update(updated);
    loadFlashcards();
    handleNext();
  };

  const handleSaveFlashcard = async (data: Partial<Flashcard>) => {
    const newCard: Flashcard = {
      id: generateId(),
      front: data.front || '',
      back: data.back || '',
      tags: data.tags || [],
      difficulty: data.difficulty || 'medium',
      correctCount: 0,
      incorrectCount: 0,
      createdAt: new Date(),
    };
    await flashcardsOps.add(newCard);
    loadFlashcards();
    setIsCreating(false);
  };

  const startQuiz = () => {
    if (flashcards.length < 4) return;
    
    const questions: QuizQuestion[] = flashcards.slice(0, 10).map((card, i) => {
      const wrongOptions = flashcards
        .filter((_, idx) => idx !== i)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((c) => c.back);
      
      const options = [...wrongOptions, card.back].sort(() => Math.random() - 0.5);
      
      return {
        id: generateId(),
        question: card.front,
        options,
        correctAnswer: options.indexOf(card.back),
      };
    });

    setQuiz({
      id: generateId(),
      title: 'Flashcard Quiz',
      questions,
      createdAt: new Date(),
    });
    setQuizMode(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
  };

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;
    
    if (selectedAnswer === quiz!.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setQuizMode(false);
    }
  };

  const generateFromNotes = async () => {
    const notes = await notesOps.getAll();
    if (notes.length === 0) return;

    // Simple flashcard generation from notes
    const generated: Flashcard[] = notes.slice(0, 5).map((note) => ({
      id: generateId(),
      front: note.title,
      back: note.content.substring(0, 200),
      tags: note.tags,
      difficulty: 'medium' as const,
      correctCount: 0,
      incorrectCount: 0,
      createdAt: new Date(),
    }));

    for (const card of generated) {
      await flashcardsOps.add(card);
    }
    loadFlashcards();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Center</h2>
          <p className="text-gray-400 text-sm">Master your knowledge with AI-powered tools</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5">
        {[
          { id: 'flashcards', label: 'Flashcards', icon: <BookOpen size={18} /> },
          { id: 'quiz', label: 'Quiz', icon: <Brain size={18} /> },
          { id: 'notes', label: 'From Notes', icon: <FileText size={18} /> },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveTab(mode.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === mode.id
                ? 'bg-crimson text-white'
                : 'text-gray-400 hover:bg-white/10'
            }`}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'flashcards' && (
        <>
          {!isStudying ? (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center">
                  <p className="text-3xl font-bold text-crimson">{flashcards.length}</p>
                  <p className="text-sm text-gray-400">Total Cards</p>
                </Card>
                <Card className="text-center">
                  <p className="text-3xl font-bold text-green-400">
                    {flashcards.filter((c) => c.correctCount > 0).length}
                  </p>
                  <p className="text-sm text-gray-400">Mastered</p>
                </Card>
                <Card className="text-center">
                  <p className="text-3xl font-bold text-yellow-400">
                    {flashcards.filter((c) => c.incorrectCount > 0).length}
                  </p>
                  <p className="text-sm text-gray-400">Needs Review</p>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Play size={20} />}
                  onClick={() => setIsStudying(true)}
                  disabled={flashcards.length === 0}
                  className="flex-1"
                >
                  Start Study Session
                </Button>
                <Button
                  variant="secondary"
                  icon={<Plus size={20} />}
                  onClick={() => setIsCreating(true)}
                >
                  Add Card
                </Button>
              </div>

              {/* Recent Cards */}
              {flashcards.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold mb-4">Recent Cards</h3>
                  <div className="space-y-3">
                    {flashcards.slice(0, 5).map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{card.front}</p>
                          <p className="text-sm text-gray-400 truncate">{card.back}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-400">{card.correctCount} ✓</span>
                          <span className="text-red-400">{card.incorrectCount} ✗</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <motion.div
              key="study"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Card {currentIndex + 1} of {flashcards.length}
                </span>
                <button
                  onClick={() => {
                    setIsStudying(false);
                    setCurrentIndex(0);
                  }}
                  className="text-sm text-crimson hover:underline"
                >
                  End Session
                </button>
              </div>

              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-crimson to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                />
              </div>

              {/* Flashcard */}
              <Card className="min-h-[300px] flex flex-col items-center justify-center cursor-pointer" onClick={handleFlip}>
                <AnimatePresence mode="wait">
                  {!showAnswer ? (
                    <motion.div
                      key="front"
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 90 }}
                      className="text-center"
                    >
                      <p className="text-xl font-semibold mb-4">{flashcards[currentIndex].front}</p>
                      <p className="text-gray-400">Click to reveal answer</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      exit={{ opacity: 0, rotateY: 90 }}
                      className="text-center"
                    >
                      <p className="text-xl font-semibold mb-4 text-crimson">{flashcards[currentIndex].back}</p>
                      <p className="text-gray-400">Did you know it?</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="danger"
                  icon={<XCircle size={20} />}
                  onClick={() => markCard(false)}
                  className="flex-1"
                >
                  Didn't Know
                </Button>
                <Button
                  variant="primary"
                  icon={<CheckCircle size={20} />}
                  onClick={() => markCard(true)}
                  className="flex-1"
                >
                  Got It!
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleNext}
                  disabled={currentIndex === flashcards.length - 1}
                >
                  Skip
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {!quizMode ? (
            <>
              <Card className="text-center py-12">
                <Brain size={48} className="mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-bold mb-2">Ready for a Quiz?</h3>
                <p className="text-gray-400 mb-6">
                  Test your knowledge with a quick quiz based on your flashcards
                </p>
                <Button
                  variant="primary"
                  icon={<Zap size={18} />}
                  onClick={startQuiz}
                  disabled={flashcards.length < 4}
                >
                  Start Quiz
                </Button>
                {flashcards.length < 4 && (
                  <p className="text-sm text-gray-500 mt-4">
                    Add at least 4 flashcards to start a quiz
                  </p>
                )}
              </Card>
            </>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Question {currentQuestion + 1} of {quiz!.questions.length}
                </span>
                <span className="text-sm font-medium">Score: {score}</span>
              </div>

              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-crimson to-purple-500"
                  style={{ width: `${((currentQuestion + 1) / quiz!.questions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <Card>
                <h3 className="text-xl font-semibold mb-6">{quiz!.questions[currentQuestion].question}</h3>
                <div className="space-y-3">
                  {quiz!.questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedAnswer === index
                          ? 'bg-crimson text-white'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </Card>

              <Button
                variant="primary"
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
                className="w-full"
              >
                {currentQuestion < quiz!.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <Card className="text-center py-12">
          <FileText size={48} className="mx-auto mb-4 text-blue-400" />
          <h3 className="text-xl font-bold mb-2">Generate Flashcards from Notes</h3>
          <p className="text-gray-400 mb-6">
            Automatically create flashcards from your saved notes
          </p>
          <Button
            variant="primary"
            icon={<Lightbulb size={18} />}
            onClick={generateFromNotes}
          >
            Generate from Notes
          </Button>
        </Card>
      )}

      {/* Create Flashcard Modal */}
      <Modal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create Flashcard"
        size="lg"
      >
        <FlashcardForm
          onSave={handleSaveFlashcard}
          onCancel={() => setIsCreating(false)}
        />
      </Modal>
    </div>
  );
}

interface FlashcardFormProps {
  onSave: (data: Partial<Flashcard>) => void;
  onCancel: () => void;
}

function FlashcardForm({ onSave, onCancel }: FlashcardFormProps) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Flashcard['difficulty']>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ front, back, tags, difficulty });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        label="Front (Question)"
        placeholder="Enter the question or term..."
        value={front}
        onChange={(e) => setFront(e.target.value)}
        rows={3}
        required
      />

      <Textarea
        label="Back (Answer)"
        placeholder="Enter the answer or definition..."
        value={back}
        onChange={(e) => setBack(e.target.value)}
        rows={3}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Difficulty</label>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
                difficulty === d
                  ? 'bg-crimson text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Tags</label>
        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-crimson/20 text-crimson text-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="ml-2 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag..."
            className="flex-1 min-w-[100px] bg-transparent outline-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = (e.target as HTMLInputElement).value.trim();
                if (value && !tags.includes(value)) {
                  setTags([...tags, value]);
                }
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          Create Card
        </Button>
      </div>
    </form>
  );
}