import React, { useState, useEffect } from 'react';
import { Upload, FileText, Brain, User, Type } from 'lucide-react';
import AuthModal from './components/AuthModal';
import Flashcards from './components/Flashcards';
import TestMode from './components/TestMode';
import { Language, Upload as UploadType, Question, StudyMode } from './types';
import { getTranslations } from './utils/translations';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('kz');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'processing' | 'study-select' | 'study'>('home');
  const [studyMode, setStudyMode] = useState<StudyMode>(null);
  const [uploads, setUploads] = useState<UploadType[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pastedText, setPastedText] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const t = getTranslations(language);

  // Mock data for demo
  useEffect(() => {
    if (isSignedIn) {
      setUploads([
        { id: '1', name: 'Math Exam.pdf', date: '2025-06-10', processed: true },
        { id: '2', name: 'History Quiz.docx', date: '2025-06-08', processed: true },
        { id: '3', name: 'Physics Test.txt', date: '2025-06-05', processed: true }
      ]);
    }
  }, [isSignedIn]);

  const mockQuestions: Question[] = [
    {
      id: '1',
      question: language === 'kz' ? 'Математикада 2+2 неге тең?' : 'What is 2+2 in mathematics?',
      answer: '4',
      options: ['3', '4', '5', '6']
    },
    {
      id: '2',
      question: language === 'kz' ? 'Жер планетасының табиғи серіктеші қандай?' : 'What is the natural satellite of Earth?',
      answer: language === 'kz' ? 'Ай' : 'Moon',
      options: language === 'kz' ? ['Күн', 'Ай', 'Марс', 'Венера'] : ['Sun', 'Moon', 'Mars', 'Venus']
    },
    {
      id: '3',
      question: language === 'kz' ? 'H2O формуласы нені білдіреді?' : 'What does the formula H2O represent?',
      answer: language === 'kz' ? 'Су' : 'Water',
      options: language === 'kz' ? ['Су', 'Оттегі', 'Сутегі', 'Озон'] : ['Water', 'Oxygen', 'Hydrogen', 'Ozone']
    }
  ];

  const handleFileUpload = async (file: File) => {
    setCurrentFile(file.name);
    setCurrentView('processing');
    
    try {
      // Import the real file processor
      const { RealFileProcessor } = await import('./services/realFileProcessor');
      
      // Process the actual file with AI
      const { questions: generatedQuestions } = await RealFileProcessor.saveFileAndProcess(file, language, questionCount);
      
      setQuestions(generatedQuestions);
      setCurrentView('study-select');
      
    } catch (error) {
      console.error('File processing failed:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentView('home');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const startStudy = (mode: 'flashcards' | 'test') => {
    setStudyMode(mode);
    setCurrentView('study');
  };

  const handleTextProcess = async () => {
    if (!pastedText.trim()) {
      alert('Please enter some text to generate questions from');
      return;
    }

    setCurrentFile('Pasted Text');
    setCurrentView('processing');
    
    try {
      // Import the real file processor
      const { RealFileProcessor } = await import('./services/realFileProcessor');
      
      // Process the pasted text directly
      const generatedQuestions = await RealFileProcessor.processText(pastedText, language, questionCount);
      
      setQuestions(generatedQuestions);
      setCurrentView('study-select');
      setPastedText(''); // Clear the text area
      
    } catch (error) {
      console.error('Text processing failed:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentView('home');
    }
  };
  const handleAuth = async (mode: 'signin' | 'signup', email: string, password: string) => {
    try {
      // Replace this with real Supabase auth later
      console.log('Auth attempt:', mode, email);
      
      // Mock authentication for now
      setIsSignedIn(true);
      setShowAuth(false);
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleStudyComplete = (score?: number, totalQuestions?: number) => {
    if (score !== undefined && totalQuestions !== undefined) {
      console.log(`Test completed: ${score}/${totalQuestions}`);
      // Here you could save the score to Supabase
    }
    setCurrentView('home');
    setStudyMode(null);
  };

  const renderHome = () => (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Text Input Section */}
      <div className="text-center">
        <h2 className="text-xl font-play mb-4">Paste Text</h2>
        <div>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={language === 'kz' 
              ? 'Мәтінді осы жерге енгізіңіз...' 
              : 'Paste your text here...'}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors resize-none text-sm"
          />
          
          {/* Question Count Selector */}
          <div className="flex items-center justify-center mt-3 space-x-4">
            <label className="text-sm text-gray-600">
              {language === 'kz' ? 'Сұрақ саны:' : 'Questions:'}
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:border-black text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <button
            onClick={handleTextProcess}
            disabled={!pastedText.trim()}
            className="mt-3 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto text-sm"
          >
            <Type size={16} />
            <span>{language === 'kz' ? 'Сұрақтар жасау' : 'Generate Questions'}</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center space-x-4">
        <div className="h-px bg-gray-300 flex-1"></div>
        <span className="text-gray-400 text-sm font-play">{language === 'kz' ? 'немесе' : 'or'}</span>
        <div className="h-px bg-gray-300 flex-1"></div>
      </div>

      {/* File Upload */}
      <div className="text-center">
        <h2 className="text-xl font-play mb-4">{t.uploadFile}</h2>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-black transition-colors cursor-pointer"
        >
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.txt"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload size={32} className="mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 text-sm">{t.dragDrop}</p>
          </label>
        </div>
      </div>

      {/* Sign In Prompt */}
      {!isSignedIn && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAuth(true)}
            className="flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-black transition-colors mx-auto"
          >
            <User size={16} />
            <span>{t.signInPrompt}</span>
          </button>
        </div>
      )}

      {/* User Uploads */}
      {isSignedIn && uploads.length > 0 && (
        <div>
          <h3 className="text-xl font-light mb-6">{t.yourUploads}</h3>
          <div className="space-y-4">
            {uploads.map((upload) => (
              <div key={upload.id} className="flex items-center justify-between p-4 border border-gray-200 rounded">
                <div>
                  <p className="font-medium">{upload.name}</p>
                  <p className="text-sm text-gray-600">{upload.date}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setCurrentFile(upload.name);
                      setQuestions(mockQuestions);
                      startStudy('flashcards');
                    }}
                    className="px-4 py-2 border border-black rounded hover:bg-black hover:text-white transition-colors"
                  >
                    {t.flashcards}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentFile(upload.name);
                      setQuestions(mockQuestions);
                      startStudy('test');
                    }}
                    className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                  >
                    {t.test}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center py-16">
      <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-lg">{t.processing}</p>
      <p className="text-gray-600 mt-2">{currentFile}</p>
    </div>
  );

  const renderStudySelect = () => (
    <div className="text-center py-16">
      <h2 className="text-2xl font-light mb-8">{t.chooseMethod}</h2>
      <p className="text-gray-600 mb-8">{currentFile}</p>
      <div className="flex justify-center space-x-6">
        <button
          onClick={() => startStudy('flashcards')}
          className="flex flex-col items-center p-8 border-2 border-gray-300 rounded-lg hover:border-black transition-colors"
        >
          <Brain size={40} className="mb-4" />
          <span className="text-lg">{t.flashcards}</span>
        </button>
        <button
          onClick={() => startStudy('test')}
          className="flex flex-col items-center p-8 border-2 border-gray-300 rounded-lg hover:border-black transition-colors"
        >
          <FileText size={40} className="mb-4" />
          <span className="text-lg">{t.test}</span>
        </button>
      </div>
    </div>
  );

  const renderStudy = () => {
    if (studyMode === 'flashcards') {
      return (
        <Flashcards
          questions={questions}
          onComplete={handleStudyComplete}
          translations={{
            showAnswer: t.showAnswer,
            nextCard: t.nextCard,
            prevCard: t.prevCard,
            complete: t.complete,
            backToHome: t.backToHome
          }}
        />
      );
    }

    if (studyMode === 'test') {
      return (
        <TestMode
          questions={questions}
          onComplete={handleStudyComplete}
          translations={{
            score: t.score,
            submitAnswer: t.submitAnswer,
            nextQuestion: t.nextQuestion,
            complete: t.complete,
            backToHome: t.backToHome,
            correct: t.correct,
            incorrect: t.incorrect,
            correctAnswer: t.correctAnswer
          }}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setCurrentView('home')}
                className="text-2xl font-play hover:opacity-70 transition-opacity"
              >
                dayne
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <div className="flex items-center space-x-2 text-sm">
                <button
                  onClick={() => setLanguage('kz')}
                  className={`${language === 'kz' ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`}
                >
                  ҚАЗ
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setLanguage('en')}
                  className={`${language === 'en' ? 'text-black' : 'text-gray-400'} hover:text-black transition-colors`}
                >
                  EN
                </button>
              </div>
              
              {/* User Status */}
              {isSignedIn && (
                <div className="flex items-center space-x-2 text-sm">
                  <User size={16} />
                  <span>Signed in</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {currentView === 'home' && renderHome()}
        {currentView === 'processing' && renderProcessing()}
        {currentView === 'study-select' && renderStudySelect()}
        {currentView === 'study' && renderStudy()}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onAuth={handleAuth}
        translations={{
          signIn: t.signIn,
          signUp: t.signUp,
          createAccount: t.createAccount,
          email: t.email,
          password: t.password,
          haveAccount: t.haveAccount,
          noAccount: t.noAccount
        }}
      />
    </div>
  );
};

export default App;