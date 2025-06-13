import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answer: string;
  options?: string[];
}

interface TestModeProps {
  questions: Question[];
  onComplete: (score: number, totalQuestions: number) => void;
  translations: {
    score: string;
    submitAnswer: string;
    nextQuestion: string;
    complete: string;
    backToHome: string;
    correct: string;
    incorrect: string;
    correctAnswer: string;
  };
}

const TestMode: React.FC<TestModeProps> = ({ questions, onComplete, translations: t }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  if (questions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">No questions available</p>
        <button
          onClick={() => onComplete(0, 0)}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          {t.backToHome}
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCorrect = selectedAnswer === currentQuestion.answer;

  const submitAnswer = () => {
    if (!selectedAnswer) return;
    
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      onComplete(score + (isCorrect ? 1 : 0), questions.length);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!showResult && selectedAnswer) {
        submitAnswer();
      } else if (showResult) {
        nextQuestion();
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8" onKeyDown={handleKeyPress} tabIndex={0}>
      <div className="flex justify-between items-center mb-8">
        <p className="text-sm text-gray-600">
          {currentIndex + 1} / {questions.length}
        </p>
        <p className="text-sm text-gray-600">
          {t.score}: {score}/{questions.length}
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h3 className="text-lg mb-6 leading-relaxed font-medium">
          {currentQuestion.question}
        </h3>
        
        <div className="space-y-3">
          {currentQuestion.options?.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQuestion.answer;
            
            let optionClass = "flex items-center p-4 border rounded cursor-pointer transition-all";
            
            if (showResult) {
              if (isCorrectOption) {
                optionClass += " bg-green-50 border-green-200 text-green-800";
              } else if (isSelected && !isCorrectOption) {
                optionClass += " bg-red-50 border-red-200 text-red-800";
              } else {
                optionClass += " border-gray-200 text-gray-600 cursor-default";
              }
            } else {
              if (isSelected) {
                optionClass += " bg-black text-white border-black";
              } else {
                optionClass += " border-gray-200 hover:bg-gray-50 hover:border-gray-300";
              }
            }

            return (
              <label key={index} className={optionClass}>
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={isSelected}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="sr-only"
                  disabled={showResult}
                />
                <div className="flex items-center justify-between w-full">
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrectOption && (
                    <Check size={20} className="text-green-600 ml-2" />
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <X size={20} className="text-red-600 ml-2" />
                  )}
                </div>
              </label>
            );
          })}
        </div>
        
        {showResult && (
          <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center space-x-2">
              {isCorrect ? (
                <Check size={20} className="text-green-600" />
              ) : (
                <X size={20} className="text-red-600" />
              )}
              <span className={isCorrect ? 'text-green-800 font-medium' : 'text-red-800'}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            {!isCorrect && (
              <p className="mt-2 text-red-700">
                {t.correctAnswer}: <strong>{currentQuestion.answer}</strong>
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="text-center mt-6">
        {!showResult ? (
          <button
            onClick={submitAnswer}
            disabled={!selectedAnswer}
            className="px-6 py-3 bg-black text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            {t.submitAnswer}
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            {isLastQuestion ? t.complete : t.nextQuestion}
          </button>
        )}
      </div>
      
      {!showResult && selectedAnswer && (
        <p className="text-center text-sm text-gray-500 mt-2">
          Press Enter to submit
        </p>
      )}
    </div>
  );
};

export default TestMode;