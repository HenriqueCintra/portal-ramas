import React from 'react';
import { Link } from 'react-router-dom';
import { FolderPlus, Layers, UserCheck, CalendarDays, Coins, BarChart3 } from 'lucide-react';

export default function MainMenu() {
  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Painel de Controle</h1>
        <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem' }}>
          Selecione um módulo para iniciar a coleta, análise e gestão de dados.
        </p>
      </div>

      <div className="menu-grid">
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
            <UserCheck size={16} /> 6 Módulos de Entidade
          </div>
        </Link>

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
            <CalendarDays size={16} /> Registros de Campo & Fluxos
          </div>
        </Link>

        <Link to="/financeiro" className="glass-card menu-card">
          <div className="menu-card-icon">
            <Coins size={36} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <h2>FINANCEIRO & EVENTOS</h2>
          <p>
            Controle receitas e despesas do projeto e gerencie eventos e capacitações de campo, 
            integrando custos automaticamente.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
            <Coins size={16} /> Ledger de Caixa & Eventos
          </div>
        </Link>

        <Link to="/analytics" className="glass-card menu-card">
          <div className="menu-card-icon">
            <BarChart3 size={36} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <h2>DASHBOARDS & GRÁFICOS</h2>
          <p>
            Acompanhe o andamento geral em painéis estatísticos com gráficos interativos de doações, 
            fluxo de caixa e adesão aos eventos.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
            <BarChart3 size={16} /> Gráficos Interativos & Exportação
          </div>
        </Link>
      </div>
    </div>
  );
}
