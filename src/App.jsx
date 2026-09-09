import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Sprout, LogOut, GraduationCap, BookOpen } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Breadcrumbs from './components/Common/Breadcrumbs';
import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
import CadastroGeralModule from './components/CadastroGeral/CadastroGeralModule';
import AtividadesModule from './components/Atividades/AtividadesModule';
import ConsultoriaForm from './components/Atividades/ConsultoriaForm';
import ConsultoriaInteligenteModule from './components/Atividades/ConsultoriaInteligenteModule';
import DoacaoForm from './components/Atividades/DoacaoForm';
import CadernoCampoModule from './components/Atividades/CadernoCampoModule';
import FinanceiroEventosModule from './components/FinanceiroEventos/FinanceiroEventosModule';
import DashboardModule from './components/Dashboard/DashboardModule';
import InventarioModule from './components/Inventario/InventarioModule';

// Guard de rota: exige login e verifica permissão
function ProtectedRoute({ children, route }) {
  const { user, canAccess } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (route && !canAccess(route)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: '1rem',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}
        >
          🔒
        </div>
        <h2 style={{ color: 'var(--color-danger)' }}>Acesso Restrito</h2>
        <p style={{ color: 'var(--color-text-light)', maxWidth: 420 }}>
          Seu perfil (<strong>{user.label}</strong>) não tem permissão para acessar este módulo.
          Entre em contato com o Professor Orientador.
        </p>
      </div>
    );
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isLoginPage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleIcon = () => {
    if (!user) return null;
    if (user.role === 'professor') return <GraduationCap size={16} />;
    return <BookOpen size={16} />;
  };

  return (
    <div className="app-container">
      {/* Header */}
      {!isLoginPage && (
        <header className="app-header">
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            <Sprout className="brand-icon" size={24} style={{ color: 'var(--color-secondary)' }} />
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: 'var(--color-primary)',
              }}
            >
              Ramas da Esperança
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '999px',
                  background: user.bgColor,
                  color: user.color,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {getRoleIcon()}
                <span>{user.label}</span>
                <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>— {user.name}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.6rem', display: 'flex', gap: '0.25rem', borderColor: 'var(--color-border)' }}
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </header>
      )}

      {/* Main viewport */}
      <main className="app-main">
        {!isLoginPage && <Breadcrumbs />}

        <Routes>
          <Route path="/" element={<LoginScreen />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainMenu />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cadastro"
            element={
              <ProtectedRoute route="/cadastro">
                <CadastroGeralModule />
              </ProtectedRoute>
            }
          />

          {/* Activities */}
          <Route
            path="/atividades"
            element={
              <ProtectedRoute>
                <AtividadesModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/atividades/consultoria"
            element={
              <ProtectedRoute route="/atividades/consultoria">
                <ConsultoriaForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/atividades/consultoria-inteligente"
            element={
              <ProtectedRoute route="/atividades/consultoria-inteligente">
                <ConsultoriaInteligenteModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/atividades/doacao"
            element={
              <ProtectedRoute route="/atividades/doacao">
                <DoacaoForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/atividades/caderno"
            element={
              <ProtectedRoute>
                <CadernoCampoModule />
              </ProtectedRoute>
            }
          />

          {/* Financeiro — rota protegida por perfil */}
          <Route
            path="/financeiro"
            element={
              <ProtectedRoute route="/financeiro">
                <FinanceiroEventosModule />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <DashboardModule />
              </ProtectedRoute>
            }
          />

          {/* Inventário — novo */}
          <Route
            path="/inventario"
            element={
              <ProtectedRoute route="/inventario">
                <InventarioModule />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
