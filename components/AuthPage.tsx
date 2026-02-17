
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { logActivity } from '../services/activityService';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (authError) throw authError;
        if (data.user) {
          await logActivity(data.user.id, 'login', 'Usuário autenticado via Supabase Cloud.');
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name
            }
          }
        });
        
        if (authError) throw authError;
        if (data.user) {
          await logActivity(data.user.id, 'action', 'Nova conta registrada na infraestrutura Supabase.');
          if (!data.session) {
             setError('Verifique seu email para confirmar o cadastro!');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center">
          <svg width="40" height="40" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
            <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="white"/>
          </svg>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isLogin ? 'Entrar no Nexus' : 'Criar sua conta Nexus'}
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Infraestrutura Supabase & Next.js Pattern
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input 
              label="Nome Completo" 
              placeholder="Ex: John Doe" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          )}
          <Input 
            label="Email" 
            type="email" 
            placeholder="email@exemplo.com" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <Input 
            label="Senha" 
            type="password" 
            placeholder="••••••••" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          {error && <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-md">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sincronizando...' : (isLogin ? 'Continuar' : 'Registrar')}
          </Button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-500 hover:text-white transition-colors"
          >
            {isLogin ? 'Ainda não tem conta? Registre-se' : 'Já possui conta? Entre agora'}
          </button>
        </div>
      </div>
      
      <footer className="mt-20 flex flex-col items-center gap-2">
        <span className="text-slate-700 text-[10px] uppercase tracking-[0.2em]">Powered by Supabase</span>
        <div className="flex gap-4 text-[10px] text-slate-500 uppercase">
          <a href="#" className="hover:text-white">Privacidade</a>
          <a href="#" className="hover:text-white">Termos</a>
        </div>
      </footer>
    </div>
  );
};
