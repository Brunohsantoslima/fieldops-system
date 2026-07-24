import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginScreen } from './pages/LoginScreen';
import { Dashboard } from './pages/Dashboard';
import { Layout } from './components/Layout';
import { RotaPrivada } from './components/RotaPrivada';
import { WorkOrders } from './pages/WorkOrders';
import { WorkOrderDetails } from './pages/WorkOrderDetails';
import { CreateWorkOrder } from './pages/CreateWorkOrder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública de Login */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Rotas protegidas envelopadas pelo Layout e RotaPrivada */}
        <Route
          element={
            <RotaPrivada>
              <Layout />
            </RotaPrivada>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Módulo de Operações / Work Orders */}
          <Route path="/work-orders" element={<WorkOrders />} />
          <Route path="/work-orders/new" element={<CreateWorkOrder />} />
          <Route path="/work-orders/:id" element={<WorkOrderDetails />} />
        </Route>

        {/* Redirecionamento padrão para rotas desconhecidas */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}