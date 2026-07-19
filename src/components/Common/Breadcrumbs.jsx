import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If we are on the login screen, don't show breadcrumbs
  if (location.pathname === '/' || pathnames.length === 0) {
    return null;
  }

  // Label mapping for paths
  const routeLabels = {
    dashboard: 'Início',
    cadastro: 'Cadastro Geral',
    atividades: 'Atividades',
    consultoria: 'Consultoria Técnica',
    doacao: 'Doações',
    caderno: 'Caderno de Campo',
  };

  return (
    <div className="nav-header-section">
      <div className="breadcrumbs">
        <Link to="/dashboard" className="breadcrumb-item">
          <Home size={16} />
          <span>Início</span>
        </Link>
        
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = routeLabels[value] || value;

          // Skip rendering Dashboard as duplicated first item if we just came from Home
          if (value === 'dashboard') return null;

          return (
            <React.Fragment key={to}>
              <ChevronRight size={14} className="breadcrumb-separator" />
              {isLast ? (
                <span className="breadcrumb-active">{label}</span>
              ) : (
                <Link to={to} className="breadcrumb-item">
                  {label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm">
        <ArrowLeft size={16} />
        Voltar
      </button>
    </div>
  );
}
