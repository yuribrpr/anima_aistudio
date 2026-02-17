
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.48.1';

// Credenciais inseridas diretamente para evitar erros de parsing de variáveis de ambiente no browser
const supabaseUrl = 'https://qecdecxjtdzcihlqhpaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlY2RlY3hqdGR6Y2lobHFocGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyODU5NTksImV4cCI6MjA4Njg2MTk1OX0.GRUbrF4QYxwH1Z-ms0w0rsLznhiBEeRWwmbQDMhry6A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
