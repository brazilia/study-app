import React, { useState } from 'react';

interface Question {
  id: string;
  question: string;
  answer: string;
  options?: string[];
}

interface FlashcardsProps {
  questions: Question[];
  onComplete: () => void;
  translations: {
    showAnswer: string;
    nextCard: string;
    prevCard: string;
    complete: string;
    backToHome: string;
  };
}

const Flashcards: React.FC<FlashcardsProps> = ({ questions, onComplete, translations: t }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">No questions available</p>
        <button
          onClick={onComplete}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          {t.backToHome}
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const nextCard = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      onComplete();
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!showAnswer) {
        setShowAnswer(true);
      } else {
        nextCard();
      }
    } else if (e.key === 'ArrowLeft') {
      prevCard();
    } else if (e.key === 'ArrowRight') {
      nextCard();
    }
  };

  return (
    <div 
      className="max-w-2xl mx-auto py-8 focus:outline-none" 
      tabIndex={0}
      onKeyDown={handleKeyPress}
    >
      <div className="text-center mb-8">
        <p className="text-sm text-gray-600">
          {currentIndex + 1} / {questions.length}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Press spacebar to flip, arrow keys to navigate
        </p>
      </div>
      
      <div 
        className="bg-white border border-gray-200 rounded-lg p-8 min-h-[300px] flex flex-col justify-center cursor-pointer transition-transform hover:scale-[1.02]"
        onClick={() => !showAnswer ? setShowAnswer(true) : nextCard()}
      >
        <div className="text-center">
          <p className="text-lg mb-6 leading-relaxed">{currentQuestion.question}</p>
          
          {showAnswer && (
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-black">
              <p className="font-medium text-lg">{currentQuestion.answer}</p>
            </div>
          )}
          
          {!showAnswer && (
            <div className="text-gray-400 text-sm">
              Click to reveal answer
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:border-black transition-colors"
        >
          {t.prevCard}
        </button>
        
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            {t.showAnswer}
          </button>
        ) : (
          <button
            onClick={nextCard}
            className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            {isLastQuestion ? t.complete : t.nextCard}
          </button>
        )}
        
        <button
          onClick={nextCard}
          disabled={isLastQuestion}
          className="px-4 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:border-black transition-colors"
        >
          {t.nextCard}
        </button>
      </div>
    </div>
  );
};

export default Flashcards;