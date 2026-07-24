// src/lib/api.ts
import axios from 'axios';

// Cria a instância do Axios com a URL base do seu backend
export const api = axios.create({
  // MUDE A PORTA ABAIXO SE O SEU BACKEND RODAR EM OUTRA PORTA (ex: 3000, 8080)
  baseURL: 'http://localhost:3333', 
});

// Interceptor: Antes de qualquer requisição sair do frontend, esse código roda.
api.interceptors.request.use((config) => {
  // Buscamos o token JWT que será salvo no login
  const token = localStorage.getItem('@FieldOps:token');

  // Se o token existir, injetamos no cabeçalho de Autorização
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});