// src/services/auth.ts
import { api } from '../lib/api';
import type { User } from '../types';

// ==========================================
// CONTRATOS DA REQUISIÇÃO E RESPOSTA
// ==========================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ==========================================
// FUNÇÕES DE SERVIÇO
// ==========================================

export const authService = {
  /**
   * Envia as credenciais para o backend e retorna o token e os dados do usuário.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // ⚠️ ATENÇÃO: Ajuste a rota '/sessions' ou '/login' de acordo com o seu backend
    const response = await api.post<AuthResponse>('/login', credentials);
    
    return response.data;
  },

  /**
   * Salva os dados de autenticação no armazenamento local do navegador.
   */
  setSession(token: string, user: User) {
    localStorage.setItem('@FieldOps:token', token);
    localStorage.setItem('@FieldOps:user', JSON.stringify(user));
  },

  /**
   * Limpa a sessão (Logout).
   */
  clearSession() {
    localStorage.removeItem('@FieldOps:token');
    localStorage.removeItem('@FieldOps:user');
  }
};