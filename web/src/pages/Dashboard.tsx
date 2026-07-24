import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface DashboardStats {
  activeOperations: number;
  teamsInField: number;
  pendingTasks: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeOperations: 0,
    teamsInField: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.get('/dashboard');
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
    <>
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
    </>
  );
}