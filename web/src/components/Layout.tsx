import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { signOut } = useAuth();
  const location = useLocation();

  // Função simples para destacar o menu ativo
  const isActive = (path: string) => location.pathname === path;

  // 🛠️ FUNÇÃO DE LOGOUT REFORÇADA
  const handleLogout = () => {
    try {
      signOut();
    } catch (e) {
      // Prevenção caso o signOut falhe
    }
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login'; // Redireciona e força a limpeza da memória
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      {/* Sidebar Fixa */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          <div className="px-2 mb-8">
            <h2 className="text-2xl font-bold text-blue-500 tracking-wide">FieldOps</h2>
            <p className="text-xs text-slate-400">Gestão de Campo</p>
          </div>

          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                isActive('/dashboard')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/work-orders"
              className={`block px-4 py-2.5 rounded-lg font-medium transition ${
                isActive('/work-orders')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Operações
            </Link>

            <a
              href="#"
              className="block px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition"
            >
              Equipes
            </a>
          </nav>
        </div>

        {/* 🚀 BOTAO ATUALIZADO AQUI */}
        <button
          onClick={handleLogout}
          className="w-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white py-2.5 px-4 rounded-lg font-medium transition text-left flex items-center justify-between"
        >
          <span>Sair da conta</span>
          <span>→</span>
        </button>
      </aside>

      {/* Conteúdo Dinâmico das Telas */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}