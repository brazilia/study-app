import { Question, Language } from '../types';

// Simpler libraries for CRA compatibility
export class RealFileProcessor {
  
  static async extractText(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.txt') || fileType === 'text/plain') {
      return await file.text();
    } 
    else if (fileName.endsWith('.pdf')) {
      // For now, we'll use a simpler approach
      // Later we can add pdf-parse when we solve the build issues
      return await this.extractFromPDFSimple(file);
    }
    else if (fileName.endsWith('.docx')) {
      return await this.extractFromDOCX(file);
    }
    else {
      throw new Error('Unsupported file type. Please use .txt, .pdf, or .docx files.');
    }
  }
  
  // Simple PDF text extraction (fallback)
  static async extractFromPDFSimple(file: File): Promise<string> {
    // For now, return a placeholder that we can replace with real extraction
    return `PDF content extraction will be implemented. File: ${file.name}, Size: ${file.size} bytes`;
  }
  
  // DOCX extraction using mammoth
  static async extractFromDOCX(file: File): Promise<string> {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('DOCX extraction failed:', error);
      throw new Error('Failed to extract text from DOCX file');
    }
  }
  
  // Generate questions using OpenAI
  static async generateQuestionsWithAI(text: string, language: Language = 'en'): Promise<Question[]> {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add REACT_APP_OPENAI_API_KEY to your .env file');
    }
    
    if (text.length < 100) {
      throw new Error('Text too short to generate meaningful questions');
    }
    
    // Truncate text if too long (to save API costs)
    const maxTextLength = 3000;
    const processedText = text.length > maxTextLength 
      ? text.substring(0, maxTextLength) + '...' 
      : text;
    
    const prompt = language === 'kz' 
      ? `Келесі мәтіннен ДӘЛМЕ-ДӘЛ 5 көп нұсқалы сұрақтар жасаңыз. Сұрақтар мәтінде жазылған фактілерге негізделуі керек.

Мәтін: ${processedText}

МІНДЕТТІ түрде осы JSON форматын сақтаңыз:
{
  "questions": [
    {
      "question": "Нақты сұрақ мәтіні?",
      "answer": "Дұрыс жауап",
      "options": ["Дұрыс жауап", "Қате нұсқа 1", "Қате нұсқа 2", "Қате нұсқа 3"]
    }
  ]
}

Ережелер:
- Дәл 5 сұрақ жасаңыз
- Барлық сұрақтар мәтіннен алынған фактілерге негізделуі керек
- Қате нұсқалар ақылға қонымды болуы керек, бірақ мәтіннен алынбауы керек
- Жауап нұсқалардың ішінде болуы керек`
      : `Generate EXACTLY 5 multiple choice questions based on the following text. Questions must be factual and based on information explicitly stated in the text.

Text: ${processedText}

You MUST respond in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "answer": "Correct answer",
      "options": ["Correct answer", "Wrong option 1", "Wrong option 2", "Wrong option 3"]
    }
  ]
}

Rules:
- Generate exactly 5 questions
- All questions must be based on facts from the text
- Wrong options should be plausible but not mentioned in the text
- The correct answer must be one of the options`;
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: language === 'kz' 
                ? 'Сіз білім беру сұрақтарын жасайтын мамансыз. Тек дұрыс JSON форматында жауап беріңіз. Мәтіннен дәл ақпаратты пайдаланыңыз.'
                : 'You are an educational expert. Respond only in valid JSON format. Use only factual information from the provided text.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });
      console.log(process.env.REACT_APP_OPENAI_API_KEY ? 'API Key Found' : 'No API Key');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON response
      const parsed = JSON.parse(content);
      const questions = parsed.questions || [];
      
      return questions.map((q: any, index: number) => ({
        id: `ai_${Date.now()}_${index}`,
        question: q.question,
        answer: q.answer,
        options: q.options || [q.answer, 'Option A', 'Option B', 'Option C'],
        type: 'multiple_choice' as const
      }));
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Main processing function
  static async processFile(file: File, language: Language = 'en'): Promise<Question[]> {
    try {
      console.log(`Processing file: ${file.name} (${file.size} bytes)`);
      console.log(process.env.REACT_APP_OPENAI_API_KEY ? 'API Key Found' : 'No API Key');
      // Step 1: Extract text
      const text = await this.extractText(file);
      console.log(`Extracted ${text.length} characters`);
      
      if (text.length < 50) {
        throw new Error('File contains too little text to generate questions');
      }
      
      // Step 2: Generate questions with AI
      const questions = await this.generateQuestionsWithAI(text, language);
      
      if (questions.length === 0) {
        throw new Error('No questions could be generated from this content');
      }
      
      console.log(`Generated ${questions.length} questions`);
      return questions;
      
    } catch (error) {
      console.error('File processing error:', error);
      throw error;
    }
  }
}