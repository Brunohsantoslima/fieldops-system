import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

// Interface ajustada para aceitar tanto 'assignee' quanto 'assignedTo'
interface WorkOrder {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: {
    name: string;
  };
  assignedTo?: {
    name: string;
  };
}

export function WorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkOrders() {
      try {
        const response = await api.get('/work-orders');
        // Suporta tanto retorno paginado ({ data: [...] }) quanto array simples ([...])
        setWorkOrders(response.data.data || response.data || []);
      } catch (error) {
        console.error('Erro ao buscar operações:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkOrders();
  }, []);

  return (
    <div className="p-6">
      {/* Cabeçalho com Título e Botão de Criar Nova Operação */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Operações em Campo</h1>
        <Link 
          to="/work-orders/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition shadow-sm"
        >
          + Nova Operação
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-slate-500 font-medium">Carregando operações...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <th className="p-4">Título</th>
                <th className="p-4">Status</th>
                <th className="p-4">Prioridade</th>
                <th className="p-4">Técnico</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-4 font-medium text-slate-800">{order.title}</td>
                  <td className="p-4 text-slate-600">{order.status}</td>
                  <td className="p-4 text-slate-600">{order.priority}</td>
                  <td className="p-4 text-slate-600">
                    {order.assignee?.name || order.assignedTo?.name || 'Não atribuído'}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/work-orders/${order.id}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Ver detalhes →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}