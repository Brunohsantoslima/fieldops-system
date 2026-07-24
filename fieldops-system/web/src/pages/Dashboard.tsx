import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
interface DashboardStats {
  activeOperations: number;
  teamsInField: number;
  pendingTasks: number;
}

export function Dashboard() {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeOperations: 0,
    teamsInField: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        // Usa a nossa 'api' configurada (porta 3333 + Token automático)
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800">
      {/* Menu Lateral */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4">
        <div>
          <div className="px-2 mb-8">
            <h2 className="text-2xl font-bold text-blue-500 tracking-wide">FieldOps</h2>
            <p className="text-xs text-slate-400">Gestão de Campo</p>
          </div>

          <nav className="space-y-1">
            <a href="#" className="block px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium">
              Dashboard
            </a>
            <a href="#" className="block px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition">
              Operações
            </a>
            <a href="#" className="block px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg font-medium transition">
              Equipes
            </a>
          </nav>
        </div>

        <button 
          onClick={signOut}
          className="w-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white py-2.5 px-4 rounded-lg font-medium transition text-left flex items-center justify-between"
        >
          <span>Sair da conta</span>
          <span>→</span>
        </button>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Painel Geral</h1>
            <p className="text-sm text-slate-500">Acompanhamento de operações em tempo real</p>
          </div>
        </header>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-slate-500">Operações Ativas</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                {loading ? '...' : stats.activeOperations}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-slate-500">Equipes em Campo</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                {loading ? '...' : stats.teamsInField}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <p className="text-sm font-medium text-slate-500">Tarefas Pendentes</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                {loading ? '...' : stats.pendingTasks}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}