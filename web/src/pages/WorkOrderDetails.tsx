import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface User {
  id: string;
  name: string;
}

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  version: number;
  teamId: string;
  assignee?: { name: string } | null;
  checklist?: ChecklistItem[];
}

export function WorkOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  
  // NOVO: Estado para guardar as notas de resolução
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // 1. Carrega os dados da OS e dos Usuários
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const osResponse = await api.get(`/work-orders/${id}`);
        setWorkOrder(osResponse.data.data || osResponse.data);

        const usersResponse = await api.get('/users'); 
        setUsers(usersResponse.data.data || usersResponse.data);
        
      } catch (err: any) {
        setError('Erro ao carregar os dados. Verifique a conexão com o backend.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // 2. Atualiza o Status da OS no Backend
  async function handleStatusChange(newStatus: string) {
    try {
      setUpdating(true);
      setError('');

      const payload: any = { status: newStatus };

      // Trava de segurança para In Progress
      if (newStatus === 'in_progress') {
        if (!selectedAssigneeId) {
          setError('Você precisa selecionar um técnico antes de colocar a OS em andamento.');
          setUpdating(false);
          return;
        }
        payload.assigneeId = selectedAssigneeId;
      }

      // NOVO: Adiciona as notas de resolução quando concluir
      if (newStatus === 'done') {
        if (resolutionNotes.trim().length < 10) {
           setError('A conclusão da OS exige notas de resolução com pelo menos 10 caracteres.');
           setUpdating(false);
           return;
        }
        payload.resolutionNotes = resolutionNotes.trim();
      }

      await api.patch(`/work-orders/${id}`, payload);
      
      // Recarrega a OS
      const response = await api.get(`/work-orders/${id}`);
      setWorkOrder(response.data.data || response.data);
      
      // Limpa os campos
      setSelectedAssigneeId('');
      setResolutionNotes('');
      
    } catch (err: any) {
      const errorData = err.response?.data;
      const msg = errorData?.message || JSON.stringify(errorData) || err.message;
      setError(`Erro (400): ${msg}`);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-500">Carregando detalhes...</div>;
  }

  if (!workOrder) {
    return (
      <div className="p-8">
        <p className="text-red-500 mb-4">{error || 'Ordem de serviço não encontrada.'}</p>
        <button onClick={() => navigate('/work-orders')} className="text-blue-600 underline">
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link to="/work-orders" className="text-sm font-medium text-blue-600 hover:underline mb-6 inline-block">
        ← Voltar para lista
      </Link>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{workOrder.title}</h1>
            <p className="text-xs text-slate-400 mt-1">ID: {workOrder.id}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full uppercase">
              Status: {workOrder.status}
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase">
              Prioridade: {workOrder.priority}
            </span>
          </div>
        </div>

        {/* MÁQUINA DE ESTADOS / BOTÕES DE AÇÃO */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col gap-4">
          
          {/* Seletor de Técnico (Apenas se Open) */}
          {workOrder.status === 'open' && (
            <div className="flex flex-col gap-1">
              <label htmlFor="assignee" className="text-xs font-bold text-slate-500 uppercase">
                Atribuir Técnico:
              </label>
              <select
                id="assignee"
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                disabled={updating}
                className="p-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-1/2"
              >
                <option value="">-- Selecione um técnico --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* NOVO: Campo de Notas de Resolução (Apenas se In Progress) */}
          {workOrder.status === 'in_progress' && (
             <div className="flex flex-col gap-1">
               <label htmlFor="resolution" className="text-xs font-bold text-slate-500 uppercase">
                 Notas de Resolução (obrigatório para concluir):
               </label>
               <textarea
                 id="resolution"
                 rows={3}
                 value={resolutionNotes}
                 onChange={(e) => setResolutionNotes(e.target.value)}
                 disabled={updating}
                 placeholder="Descreva o que foi feito (mínimo 10 caracteres)..."
                 className="p-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
               />
             </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-2">
            <span className="text-sm font-medium text-slate-700">Ações de Status:</span>
            <div className="flex gap-2">
              <button
                disabled={updating || workOrder.status !== 'in_progress'}
                onClick={() => handleStatusChange('open')}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Abrir (Open)
              </button>
              <button
                disabled={updating || workOrder.status !== 'open'}
                onClick={() => handleStatusChange('in_progress')}
                className="px-3 py-1.5 bg-amber-500 text-white rounded text-xs font-medium hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Em Andamento
              </button>
              <button
                disabled={updating || workOrder.status !== 'in_progress' || resolutionNotes.trim().length < 10}
                onClick={() => handleStatusChange('done')}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Concluir (Done)
              </button>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição</h3>
          <p className="text-slate-700 text-sm whitespace-pre-wrap">{workOrder.description}</p>
        </div>

        {/* Rodapé de Informações */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase">Técnico Responsável</span>
            <span className="text-slate-700 font-medium">
              {workOrder.assignee?.name || 'Não atribuído'}
            </span>
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase">Versão do Documento</span>
            <span className="text-slate-700 font-medium">v{workOrder.version || 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
}