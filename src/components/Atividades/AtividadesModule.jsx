import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Gift, CalendarRange, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function LockedActivityCard({ icon, title, description, isComplex }) {
  return (
    <div
      className="glass-card activity-select-card menu-card-locked"
      style={{
        border: isComplex ? '2px solid rgba(82, 183, 136, 0.12)' : '1px solid var(--glass-border)',
        position: 'relative',
        cursor: 'not-allowed',
        opacity: 0.75,
      }}
    >
      {/* Lock badge */}
      <div className="lock-badge">
        <Lock size={14} />
        Acesso Restrito
      </div>

      <div className="activity-icon-container" style={{ opacity: 0.45 }}>
        {icon}
      </div>

      <h3 style={{ opacity: 0.5 }}>{title}</h3>
      <p style={{ opacity: 0.5 }}>{description}</p>

      <div className="locked-info" style={{ marginTop: '1.5rem' }}>
        <Lock size={16} />
        <span>Disponível apenas para o perfil Professor</span>
      </div>
    </div>
  );
}

export default function AtividadesModule() {
  const navigate = useNavigate();
  const { canAccess } = useAuth();

  const activities = [
    {
      id: 'consultoria',
      title: 'Consultoria Técnica',
      description: 'Lançar vistorias de campo, recomendações de manejo e anexar fotos das lavouras.',
      path: '/atividades/consultoria',
      icon: <ClipboardCheck size={24} />,
    },
    {
      id: 'consultoria-inteligente',
      title: 'Consultoria Inteligente (IA)',
      description: 'Diagnosticar pragas e doenças com IA enviando fotos, áudios e vídeos.',
      path: '/atividades/consultoria-inteligente',
      icon: <Sparkles size={24} />,
      isComplex: true,
    },
    {
      id: 'doacao',
      title: 'Doação de Mudas e Alimentos',
      description: 'Registrar a entrega de mudas/sementes e distribuição de colheitas biofortificadas.',
      path: '/atividades/doacao',
      icon: <Gift size={24} />,
    },
    {
      id: 'caderno',
      title: 'Caderno de Campo (10 Abas)',
      description: 'Preencher a planilha de acompanhamento completo em etapas estruturadas.',
      path: '/atividades/caderno',
      icon: <CalendarRange size={24} />,
      isComplex: false,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Registro de Atividades</h1>
        <p style={{ color: 'var(--color-text-light)', fontSize: '1rem' }}>
          Selecione a modalidade de atividade realizada em campo para continuar.
        </p>
      </div>

      <div className="activities-selection-grid">
        {activities.map((act) => {
          const locked = !canAccess(act.path);

          if (locked) {
            return (
              <LockedActivityCard
                key={act.id}
                icon={act.icon}
                title={act.title}
                description={act.description}
                isComplex={act.isComplex}
              />
            );
          }

          return (
            <div
              key={act.id}
              onClick={() => navigate(act.path)}
              className="glass-card activity-select-card"
              style={{
                border: act.isComplex
                  ? '2px solid rgba(82, 183, 136, 0.25)'
                  : '1px solid var(--glass-border)',
                position: 'relative',
              }}
            >
              {act.isComplex && (
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'var(--color-primary-light)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  COMPLEXO
                </span>
              )}

              <div className="activity-icon-container">{act.icon}</div>

              <h3>{act.title}</h3>
              <p>{act.description}</p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: 'var(--color-primary-light)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  marginTop: '1.5rem',
                }}
              >
                Acessar formulário
                <ArrowRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
