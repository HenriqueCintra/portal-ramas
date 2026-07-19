import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, LogOut, User } from 'lucide-react';
import Breadcrumbs from './components/Common/Breadcrumbs';
import LoginScreen from './components/LoginScreen';
import MainMenu from './components/MainMenu';
import CadastroGeralModule from './components/CadastroGeral/CadastroGeralModule';
import AtividadesModule from './components/Atividades/AtividadesModule';
import ConsultoriaForm from './components/Atividades/ConsultoriaForm';
import DoacaoForm from './components/Atividades/DoacaoForm';
import CadernoCampoModule from './components/Atividades/CadernoCampoModule';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/';

  const handleLogout = () => {
    // Clear storage if needed and navigate to Login
    navigate('/');
  };

  return (
    <div className="app-container">
      {/* Conditionally render header based on current route */}
      {!isLoginPage && (
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <Sprout className="brand-icon" size={24} style={{ color: 'var(--color-secondary)' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
              Ramas da Esperança
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
              <User size={18} style={{ color: 'var(--color-secondary)' }} />
              <span>Técnico de Campo</span>
            </div>
            
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
        {/* Render Breadcrumbs only if logged in */}
        {!isLoginPage && <Breadcrumbs />}

        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/dashboard" element={<MainMenu />} />
          <Route path="/cadastro" element={<CadastroGeralModule />} />
          
          {/* Activities Module and sub-routes */}
          <Route path="/atividades" element={<AtividadesModule />} />
          <Route path="/atividades/consultoria" element={<ConsultoriaForm />} />
          <Route path="/atividades/doacao" element={<DoacaoForm />} />
          <Route path="/atividades/caderno" element={<CadernoCampoModule />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
