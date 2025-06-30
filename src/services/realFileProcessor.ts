import { Question, Language } from '../types';

export class RealFileProcessor {
  
  // Extract text from different file types
  static async extractText(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.txt') || fileType === 'text/plain') {
      return await file.text();
    } 
    else if (fileName.endsWith('.pdf')) {
      return await this.extractFromPDF(file);
    }
    else if (fileName.endsWith('.docx')) {
      return await this.extractFromDOCX(file);
    }
    else {
      throw new Error('Unsupported file type. Please use .txt, .pdf, or .docx files.');
    }
  }
  
  // PDF text extraction (browser-compatible)
  static async extractFromPDF(file: File): Promise<string> {
    // For now, PDFs are not supported in the browser without additional setup
    // You can add pdf.js later for proper PDF support
    throw new Error(`PDF files are not yet supported. Please convert "${file.name}" to a text file (.txt) for now, or use the paste text feature.`);
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
      throw new Error('Failed to extract text from DOCX file. Please install mammoth package.');
    }
  }
  
  // Generate questions using OpenAI
  static async generateQuestionsWithAI(text: string, language: Language = 'en', questionCount: number = 5): Promise<Question[]> {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please add REACT_APP_OPENAI_API_KEY to your .env file');
    }
    
    if (text.length < 100) {
      throw new Error('Text too short to generate meaningful questions (minimum 100 characters)');
    }
    
    // Truncate text if too long (to save API costs)
    const maxTextLength = 3000;
    const processedText = text.length > maxTextLength 
      ? text.substring(0, maxTextLength) + '...' 
      : text;
    
    const prompt = language === 'kz' 
      ? `Келесі мәтіннен ДӘЛМЕ-ДӘЛ ${questionCount} көп нұсқалы сұрақтар жасаңыз:

Мәтін: ${processedText}

JSON форматында жауап беріңіз:
{
  "questions": [
    {
      "question": "Сұрақ мәтіні?",
      "answer": "Дұрыс жауап",
      "options": ["Дұрыс жауап", "Қате нұсқа 1", "Қате нұсқа 2", "Қате нұсқа 3"]
    }
  ]
}`
      : `Generate EXACTLY ${questionCount} multiple choice questions from this text:

Text: ${processedText}

Respond in JSON format:
{
  "questions": [
    {
      "question": "Question text?",
      "answer": "Correct answer",
      "options": ["Correct answer", "Wrong option 1", "Wrong option 2", "Wrong option 3"]
    }
  ]
}`;
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: language === 'kz' 
                ? `Сіз білім беру сұрақтарын жасайтын мамансыз. МІНДЕТТІ түрде тек JSON форматында жауап беріңіз, markdown белгілерінсіз. Дәл ${questionCount} сұрақ жасаңыз.`
                : `You are an educational expert. Respond ONLY in valid JSON format, no markdown. Generate exactly ${questionCount} questions.`
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('OpenAI Response:', data);
      let content = data.choices[0].message.content;
      console.log('Raw AI Content:', content);
      
      // Clean up the response - remove markdown code blocks if present
      content = content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('Cleaned content:', content);
      
      // Parse JSON response
      const parsed = JSON.parse(content);
      console.log('Parsed JSON:', parsed);
      const questions = parsed.questions || [];
      
      if (questions.length === 0) {
        throw new Error('No questions were generated');
      }
      
      return questions.map((q: any, index: number) => ({
        id: `ai_${Date.now()}_${index}`,
        question: q.question,
        answer: q.answer,
        options: q.options || [q.answer, 'Option A', 'Option B', 'Option C'],
        type: 'multiple_choice' as const
      }));
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (error instanceof SyntaxError) {
        throw new Error('Failed to parse AI response. Please try again.');
      }
      throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Main processing function (without saving)
  static async processFile(file: File, language: Language = 'en', questionCount: number = 5): Promise<Question[]> {
    try {
      console.log(`Processing file: ${file.name} (${file.size} bytes)`);
      
      // Step 1: Extract text
      const text = await this.extractText(file);
      console.log(`Extracted ${text.length} characters`);
      
      if (text.length < 50) {
        throw new Error('File contains too little text to generate questions (minimum 50 characters)');
      }
      
      // Step 2: Generate questions with AI
      const questions = await this.generateQuestionsWithAI(text, language, questionCount);
      
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
  
  // Save file to Supabase and process
  static async saveFileAndProcess(file: File, language: Language = 'en', questionCount: number = 5): Promise<{questions: Question[], uploadId?: string}> {
    try {
      // Import Supabase dynamically to avoid errors if not configured
      let supabase: any = null;
      let session: any = null;
      let uploadId: string | undefined;
      
      try {
        const supabaseModule = await import('./supabase');
        supabase = supabaseModule.supabase;
        
        // Check if user is signed in
        const { data: { session: userSession } } = await supabase.auth.getSession();
        session = userSession;
      } catch (error) {
        console.warn('Supabase not configured or not available:', error);
        // Continue without saving
      }
      
      if (supabase && session?.user) {
        try {
          console.log('Attempting to save file to storage...');
          // Save file to Supabase storage
          const fileName = `${session.user.id}/${Date.now()}_${file.name}`;
          
          const { data: storageData, error: storageError } = await supabase.storage
            .from('study-files')
            .upload(fileName, file);
          
          if (storageError) {
            console.error('Storage error:', storageError);
            // Continue without saving file
          } else {
            console.log('File uploaded successfully:', storageData.path);
            
            // Create upload record in database
            const { data: uploadData, error: uploadError } = await supabase
              .from('uploads')
              .insert([{
                name: file.name,
                file_size: file.size,
                file_type: file.type,
                processed: false,
                user_id: session.user.id
              }])
              .select()
              .single();
            
            if (!uploadError && uploadData) {
              uploadId = uploadData.id;
              console.log('Upload record created:', uploadId);
            } else {
              console.error('Upload record error:', uploadError);
            }
          }
        } catch (storageError) {
          console.error('Storage operation failed:', storageError);
          // Continue without saving
        }
      } else {
        console.log('Skipping file save - user not signed in or Supabase not available');
      }
      
      // Process the file regardless of storage success
      const questions = await this.processFile(file, language, questionCount);
      
      // If we have an upload ID, save the questions and mark as processed
      if (supabase && uploadId && session?.user) {
        try {
          const { error: questionsError } = await supabase
            .from('questions')
            .insert(
              questions.map(q => ({
                upload_id: uploadId,
                question: q.question,
                answer: q.answer,
                options: q.options,
                type: q.type || 'multiple_choice'
              }))
            );
          
          if (questionsError) {
            console.warn('Failed to save questions:', questionsError);
          } else {
            console.log('Questions saved to database');
            
            // Mark upload as processed
            await supabase
              .from('uploads')
              .update({ processed: true })
              .eq('id', uploadId);
            
            console.log('Upload marked as processed');
          }
        } catch (dbError) {
          console.warn('Database operation failed:', dbError);
          // Questions still generated successfully
        }
      }
      
      return { questions, uploadId };
      
    } catch (error) {
      console.error('Save and process error:', error);
      // Fallback to just processing without saving
      const questions = await this.processFile(file, language, questionCount);
      return { questions };
    }
  }
  
  // Process text directly (for paste functionality)
  static async processText(text: string, language: Language = 'en', questionCount: number = 5): Promise<Question[]> {
    try {
      if (text.length < 50) {
        throw new Error('Text too short to generate questions (minimum 50 characters)');
      }
      
      return await this.generateQuestionsWithAI(text, language, questionCount);
    } catch (error) {
      console.error('Text processing error:', error);
      throw error;
    }
  }
  
  // Get supported file types
  static getSupportedFileTypes(): string[] {
    return ['.txt', '.pdf', '.docx'];
  }
  
  // Validate file before processing
  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const supportedTypes = ['.txt', '.pdf', '.docx'];
    const fileName = file.name.toLowerCase();
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 10MB.' };
    }
    
    const isSupported = supportedTypes.some(type => fileName.endsWith(type));
    if (!isSupported) {
      return { valid: false, error: `Unsupported file type. Supported types: ${supportedTypes.join(', ')}` };
    }
    
    return { valid: true };
  }
}