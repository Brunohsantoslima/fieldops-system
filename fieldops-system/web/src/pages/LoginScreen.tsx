import { useAuth } from '../contexts/AuthContext'; 
// OBS: ajuste os pontos (../) de acordo com onde a sua página de login está salva
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../services/auth';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

// ==========================================
// 1. O CONTRATO DO FORMULÁRIO (ZOD)
// ==========================================
const loginSchema = z.object({
  email: z.string().email('Por favor, insira um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

// ==========================================
// 2. COMPONENTE VISUAL
// ==========================================
export function LoginScreen() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { signIn } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setGlobalError(null);
      
      // Chama a nossa API isolada
      const response = await authService.login(data);
      
      // Salva a sessão no navegador
      signIn(response.token);
      
      // Feedback de sucesso
      setIsSuccess(true);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setGlobalError('E-mail ou senha incorretos.');
      } else {
        setGlobalError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
      }
    }
  };

  

  // ... resto das suas variáveis, estados e funções ...
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Login realizado com sucesso!</h2>
          <p className="text-slate-600">O token JWT foi salvo. Em breve redirecionaremos para o painel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Acesse sua conta</h2>
        <p className="mt-2 text-center text-sm text-slate-600">Insira suas credenciais para continuar</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-slate-200">
          
          {globalError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  placeholder="nome@empresa.com"
                  {...register('email')}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600 font-medium">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Autenticando...</>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}