import { createContext, useContext, useState, type ReactNode } from 'react';

// Define o formato das informações que vamos guardar
interface AuthContextData {
  token: string | null;
  signIn: (token: string) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

// Cria o contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Cria o provedor que vai abraçar o sistema
export function AuthProvider({ children }: { children: ReactNode }) {
  // O estado inicial procura o token no navegador
  const [token, setToken] = useState<string | null>(() => {
    const storagedToken = localStorage.getItem('@FieldOps:token');
    return storagedToken ? storagedToken : null;
  });

  // Função para logar e salvar o token
  function signIn(newToken: string) {
    localStorage.setItem('@FieldOps:token', newToken);
    setToken(newToken);
  }

  // Função para deslogar e apagar o token
  function signOut() {
    localStorage.removeItem('@FieldOps:token');
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, signIn, signOut, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// Atalho para usar o contexto em qualquer tela
export function useAuth() {
  return useContext(AuthContext);
}