import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './pages/LoginScreen';
import { Dashboard } from './pages/Dashboard';
import type { JSX } from 'react/jsx-runtime';

// Função que bloqueia quem não está logado
function RotaPrivada({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Se já estiver logado, não deixa ver o login de novo, manda pro dashboard */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginScreen />} />
        
        {/* Rota protegida do Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <RotaPrivada>
              <Dashboard />
            </RotaPrivada>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}