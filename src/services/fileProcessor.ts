import { Question } from '../types';

// For PDF parsing
import * as pdfjsLib from 'pdfjs-dist';

// For DOCX parsing  
import mammoth from 'mammoth';

export class FileProcessor {
  
  // Extract text from different file types
  static async extractText(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    try {
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await this.extractFromPDF(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
        return await this.extractFromDOCX(file);
      } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return await this.extractFromTXT(file);
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error('Failed to extract text from file');
    }
  }
  
  // PDF text extraction
  static async extractFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  }
  
  // DOCX text extraction
  static async extractFromDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  
  // TXT text extraction
  static async extractFromTXT(file: File): Promise<string> {
    return await file.text();
  }
  
  // Generate questions from text using AI (OpenAI/Claude API)
  static async generateQuestions(text: string, language: 'kz' | 'en' = 'en'): Promise<Question[]> {
    // This would call your AI service (OpenAI, Claude, etc.)
    // For now, returning mock data
    
    console.log('Generating questions from text:', text.substring(0, 200) + '...');
    
    // Mock questions based on content length
    const questionCount = Math.min(Math.max(Math.floor(text.length / 500), 3), 20);
    
    return Array.from({ length: questionCount }, (_, i) => ({
      id: `q_${Date.now()}_${i}`,
      question: language === 'kz' 
        ? `Мәтіннен алынған сұрақ ${i + 1}?`
        : `Question ${i + 1} from the text?`,
      answer: language === 'kz' ? `Жауап ${i + 1}` : `Answer ${i + 1}`,
      options: language === 'kz' 
        ? [`Жауап ${i + 1}`, `Басқа нұсқа A`, `Басқа нұсқа B`, `Басқа нұсқа C`]
        : [`Answer ${i + 1}`, `Option A`, `Option B`, `Option C`],
      type: 'multiple_choice'
    }));
  }
  
  // Process file completely: extract text → generate questions
  static async processFile(file: File, language: 'kz' | 'en' = 'en'): Promise<Question[]> {
    try {
      // Step 1: Extract text
      const text = await this.extractText(file);
      
      if (!text || text.length < 50) {
        throw new Error('Not enough content to generate questions');
      }
      
      // Step 2: Generate questions
      const questions = await this.generateQuestions(text, language);
      
      return questions;
    } catch (error) {
      console.error('File processing error:', error);
      throw error;
    }
  }
}

// Alternative: Use AI API for question generation
export class AIQuestionGenerator {
  
  static async generateWithOpenAI(text: string, language: 'kz' | 'en'): Promise<Question[]> {
    // Replace with your OpenAI API key
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    const prompt = language === 'kz' 
      ? `Келесі мәтіннен көп нұсқалы сұрақтар жасаңыз:\n\n${text}\n\nJSON форматында 5-10 сұрақ қайтарыңыз.`
      : `Generate multiple choice questions from this text:\n\n${text}\n\nReturn 5-10 questions in JSON format.`;
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      const questionsText = data.choices[0].message.content;
      
      // Parse the JSON response
      const questions = JSON.parse(questionsText);
      
      return questions.map((q: any, i: number) => ({
        id: `ai_q_${Date.now()}_${i}`,
        question: q.question,
        answer: q.answer,
        options: q.options,
        type: 'multiple_choice'
      }));
      
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error('Failed to generate questions with AI');
    }
  }
}