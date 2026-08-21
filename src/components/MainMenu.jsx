import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Layers,
  UserCheck,
  CalendarDays,
  Coins,
  BarChart3,
  Package,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function LockedCard({ icon, title, description, reason }) {
  return (
    <div className="glass-card menu-card menu-card-locked" tabIndex={0}>
      {/* Lock badge */}
      <div className="lock-badge">
        <Lock size={14} />
        Acesso Restrito
      </div>

      <div className="menu-card-icon menu-card-icon-locked">{icon}</div>
      <h2 style={{ opacity: 0.55 }}>{title}</h2>
      <p style={{ opacity: 0.55 }}>{description}</p>

      {/* Blocked overlay message */}
      <div className="locked-info">
        <Lock size={18} />
        <span>{reason}</span>
      </div>
    </div>
  );
}

export default function MainMenu() {
  const { canAccess, user } = useAuth();
  const navigate = useNavigate();

  const financeiroLocked = !canAccess('/financeiro');

  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Painel de Controle</h1>
        <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem' }}>
          Selecione um módulo para iniciar a coleta, análise e gestão de dados.
        </p>
      </div>

      <div className="menu-grid">
        {/* Cadastro Geral */}
        <Link to="/cadastro" className="glass-card menu-card">
          <div className="menu-card-icon">
            <FolderPlus size={36} />
          </div>
          <h2>CADASTRO GERAL</h2>
          <p>
            Gerencie e cadastre produtores/agricultores, cooperativas, prefeituras, escolas,
            instituições de pesquisa e parceiros integrados ao projeto.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
            <UserCheck size={16} />
          </div>
        </Link>

        {/* Atividades */}
        <Link to="/atividades" className="glass-card menu-card">
          <div className="menu-card-icon">
            <Layers size={36} />
          </div>
          <h2>ATIVIDADES</h2>
          <p>
            Lance consultorias técnicas, gerencie a doação de mudas/sementes e alimentos biofortificados,
            ou preencha os registros detalhados do Caderno de Campo.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
            <CalendarDays size={16} />
          </div>
        </Link>

        {/* Financeiro & Eventos — condicional */}
        {financeiroLocked ? (
          <LockedCard
            icon={<Coins size={36} />}
            title="FINANCEIRO & EVENTOS"
            description="Controle receitas e despesas do projeto e gerencie eventos e capacitações de campo"
            reason="Disponível apenas para o perfil Professor"
          />
        ) : (
          <Link to="/financeiro" className="glass-card menu-card">
            <div className="menu-card-icon">
              <Coins size={36} style={{ color: 'var(--color-secondary)' }} />
            </div>
            <h2>FINANCEIRO & EVENTOS</h2>
            <p>
              Controle receitas e despesas do projeto e gerencie eventos e capacitações de campo
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
              <Coins size={16} />
            </div>
          </Link>
        )}

        {/* Dashboards */}
        <Link to="/analytics" className="glass-card menu-card">
          <div className="menu-card-icon">
            <BarChart3 size={36} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <h2>DASHBOARDS & GRÁFICOS</h2>
          <p>Visualize relatórios e análises dos dados coletados em campo.</p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
            <BarChart3 size={16} />
          </div>
        </Link>

        {/* Inventário — novo módulo */}
        <Link to="/inventario" className="glass-card menu-card">
          <div className="menu-card-icon">
            <Package size={36} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h2>INVENTÁRIO</h2>
          <p>
            Cadastre e controle ferramentas, sementes, mudas, equipamentos e insumos disponíveis no projeto.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
            <Package size={16} />
          </div>
        </Link>
      </div>
    </div>
  );
}
