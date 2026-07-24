import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function CreateWorkOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados do Formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium'); // Minúsculo exigido pelo Zod ("low" | "medium" | "high")
  const [teamId, setTeamId] = useState('team-alpha');  // Preenchido automaticamente com o ID válido

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/work-orders', {
        title,
        description,
        priority, // "low", "medium" ou "high"
        teamId 
      });

      // Redireciona para a listagem após criar
      navigate('/work-orders');
    } catch (err: any) {
      const detalhes = JSON.stringify(err.response?.data?.message || err.response?.data || '');
      setError(`Erro do backend: ${detalhes}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Nova Ordem de Serviço</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm break-all">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Título da Operação *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Manutenção do servidor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">ID da Equipe (Team ID) *</label>
          <input
            type="text"
            required
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Prioridade *</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Baixa (Low)</option>
            <option value="medium">Média (Medium)</option>
            <option value="high">Alta (High)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Descrição *</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detalhe o serviço..."
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={() => navigate('/work-orders')} 
            className="text-slate-500 hover:text-slate-700 px-4 py-2 font-medium"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Operação'}
          </button>
        </div>
      </form>
    </div>
  );
}