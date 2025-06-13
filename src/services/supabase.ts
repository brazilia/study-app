import { createClient } from '@supabase/supabase-js';
import { Upload, Question, StudySession } from '../types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

// Upload functions
export const createUpload = async (upload: Omit<Upload, 'id' | 'date'>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('uploads')
    .insert([{
      name: upload.name,
      file_size: upload.file_size,
      file_type: upload.file_type,
      processed: upload.processed,
      user_id: user.id
    }])
    .select()
    .single();
  
  return { data, error };
};

export const getUserUploads = async () => {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const updateUploadProcessed = async (uploadId: string, processed: boolean) => {
  const { data, error } = await supabase
    .from('uploads')
    .update({ processed, updated_at: new Date().toISOString() })
    .eq('id', uploadId)
    .select()
    .single();
  
  return { data, error };
};

// Question functions
export const createQuestions = async (questions: Omit<Question, 'id'>[], uploadId: string) => {
  const questionsWithUploadId = questions.map(q => ({
    question: q.question,
    answer: q.answer,
    options: q.options,
    type: q.type || 'multiple_choice',
    difficulty: q.difficulty || 'medium',
    upload_id: uploadId
  }));

  const { data, error } = await supabase
    .from('questions')
    .insert(questionsWithUploadId)
    .select();
  
  return { data, error };
};

export const getQuestionsByUpload = async (uploadId: string) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('upload_id', uploadId);
  
  return { data, error };
};

// Study session functions
export const createStudySession = async (session: Omit<StudySession, 'id' | 'completed_at'>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('study_sessions')
    .insert([{
      user_id: user.id,
      upload_id: session.upload_id,
      mode: session.mode,
      score: session.score,
      total_questions: session.total_questions,
      time_spent: session.time_spent
    }])
    .select()
    .single();
  
  return { data, error };
};

export const getUserStudySessions = async () => {
  const { data, error } = await supabase
    .from('study_sessions')
    .select(`
      *,
      uploads(name)
    `)
    .order('completed_at', { ascending: false });
  
  return { data, error };
};

// File storage functions
export const uploadFile = async (file: File) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const fileName = `${user.id}/${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file);
  
  if (error) return { data: null, error };
  
  // Create upload record in database
  const uploadRecord = await createUpload({
    name: file.name,
    file_size: file.size,
    file_type: file.type,
    processed: false
  });
  
  return { data: { file: data, upload: uploadRecord.data }, error: uploadRecord.error };
};

export const downloadFile = async (fileName: string) => {
  const { data, error } = await supabase.storage
    .from('uploads')
    .download(fileName);
  
  return { data, error };
};

// Auth state listener
export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};