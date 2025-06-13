import { Language, Translations } from '../types';

export const translations: Record<Language, Translations> = {
  kz: {
    logo: 'Оқу',
    flashcards: 'Флэшкарталар',
    test: 'Тест',
    signInPrompt: 'Файл тарихын сақтау үшін кіріңіз',
    uploadFile: 'Файл жүктеу',
    pasteText: 'Мәтін енгізу',
    dragDrop: 'Файлды осы жерге апарыңыз немесе таңдау үшін басыңыз',
    processing: 'Өңделуде...',
    chooseMethod: 'Дайындық әдісін таңдаңыз',
    yourUploads: 'Сіздің жүктеулеріңіз',
    showAnswer: 'Жауапты көрсету',
    nextCard: 'Келесі карта',
    prevCard: 'Алдыңғы карта',
    submitAnswer: 'Жауапты жіберу',
    nextQuestion: 'Келесі сұрақ',
    score: 'Ұпай',
    complete: 'Аяқталды!',
    backToHome: 'Басты бетке оралу',
    email: 'Электрондық пошта',
    password: 'Құпия сөз',
    signIn: 'Кіру',
    signUp: 'Тіркелу',
    createAccount: 'Аккаунт жасау',
    haveAccount: 'Аккаунтыңыз бар ма?',
    noAccount: 'Аккаунтыңыз жоқ па?',
    correct: 'Дұрыс!',
    incorrect: 'Дұрыс емес',
    correctAnswer: 'Дұрыс жауап'
  },
  en: {
    logo: 'Study',
    flashcards: 'Flashcards',
    test: 'Test',
    signInPrompt: 'Sign in to save your uploads',
    uploadFile: 'Upload File',
    pasteText: 'Paste Text',
    dragDrop: 'Drag file here or click to select',
    processing: 'Processing...',
    chooseMethod: 'Choose preparation method',
    yourUploads: 'Your uploads',
    showAnswer: 'Show Answer',
    nextCard: 'Next Card',
    prevCard: 'Previous Card',
    submitAnswer: 'Submit Answer',
    nextQuestion: 'Next Question',
    score: 'Score',
    complete: 'Complete!',
    backToHome: 'Back to Home',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    createAccount: 'Create Account',
    haveAccount: 'Have an account?',
    noAccount: 'No account?',
    correct: 'Correct!',
    incorrect: 'Incorrect',
    correctAnswer: 'Correct answer'
  }
};

export const getTranslations = (language: Language): Translations => {
  return translations[language];
};