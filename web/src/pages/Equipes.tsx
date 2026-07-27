import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId: string | null;
}

export function Equipes() {
  // 🔐 TRAVA REAL: Pegamos o usuário do contexto e verificamos se ele é admin
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin'; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Estado para saber se estamos editando alguém (guarda o ID do usuário)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'technician',
    teamId: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Busca os usuários
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3333/users'); 
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✏️ Função para abrir o modal em modo de EDIÇÃO
  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Deixamos em branco para não expor a senha atual
      role: user.role,
      teamId: user.teamId || '',
    });
    setIsModalOpen(true);
  };

  // ➕ Função para abrir o modal em modo de CRIAÇÃO
  const handleNewUserClick = () => {
    setEditingUserId(null);
    setFormData({ name: '', email: '', password: '', role: 'technician', teamId: '' });
    setIsModalOpen(true);
  };

  // Salva os dados (Cria ou Edita)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        teamId: formData.teamId ? formData.teamId : null,
      };

      // Se tiver editingUserId, é edição (PUT). Se não tiver, é criação (POST).
      const url = editingUserId 
        ? `http://localhost:3333/users/${editingUserId}` 
        : 'http://localhost:3333/register';
      
      const method = editingUserId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar usuário');
      }

      alert(editingUserId ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!');
      setIsModalOpen(false);
      fetchUsers(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Equipes</h1>
          <p className="text-sm text-gray-500">Gerencie e cadastre membros do sistema</p>
        </div>
        {/* Só mostra o botão de Novo Usuário se for Admin */}
        {isAdmin && (
          <button
            onClick={handleNewUserClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            + Novo Usuário
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loadingUsers ? (
          <div className="p-8 text-center text-gray-500">Carregando usuários...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nome</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">E-mail</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Função</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Equipe</th>
                {/* Coluna de ações só aparece para Admin */}
                {isAdmin && <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{user.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.teamId === 'team-alpha' && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">Team Alpha</span>}
                      {user.teamId === 'team-beta' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Team Beta</span>}
                      {!user.teamId && <span className="text-gray-400 text-xs">Sem Equipe</span>}
                    </td>
                    {/* Botão de editar só aparece para Admin */}
                    {isAdmin && (
                      <td className="px-6 py-4 text-sm text-right">
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Editar
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Misto (Cadastro / Edição) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingUserId ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
            </h2>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {editingUserId && <span className="text-gray-400 text-xs">(Deixe em branco para manter)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUserId} // Só é obrigatória se for cadastro novo
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Função (Role)</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="technician">Técnico</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipe</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                >
                  <option value="">Sem Equipe</option>
                  <option value="team-alpha">Team Alpha</option>
                  <option value="team-beta">Team Beta</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}