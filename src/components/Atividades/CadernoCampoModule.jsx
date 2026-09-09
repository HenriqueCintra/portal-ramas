import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Save, Loader2, AlertCircle, Cloud, CloudOff } from 'lucide-react';
import { getEntities, saveEntity } from '../../utils/storage';
import { getSupabase } from '../../utils/supabaseClient';
import Step1_Area from './steps/Step1_Area';
import Step2_Parcelas from './steps/Step2_Parcelas';
import Step3_Tratos from './steps/Step3_Tratos';
import Step4_Meteorologia from './steps/Step4_Meteorologia';
import Step5_Irrigacao from './steps/Step5_Irrigacao';
import Step6_Nutricao from './steps/Step6_Nutricao';
import Step7_Pragas from './steps/Step7_Pragas';
import Step8_Doencas from './steps/Step8_Doencas';
import Step9_Agrotoxicos from './steps/Step9_Agrotoxicos';
import Step10_Colheita from './steps/Step10_Colheita';

export default function CadernoCampoModule() {
  const [activeStep, setActiveStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [isOnline, setIsOnline] = useState(false);

  const [formData, setFormData] = useState({
    area: {},
    parcelas: [],
    tratos: [],
    meteorologia: [],
    irrigacao: [],
    nutricao: [],
    pragas: [],
    doencas: [],
    agrotoxicos: [],
    colheita: [],
  });

  useEffect(() => {
    const sb = getSupabase();
    setIsOnline(!!sb);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getEntities('caderno');
        if (data && data.length > 0) {
          // Sort by id (cad_<timestamp>) to pick the most recent saved record
          const sorted = [...data].sort((a, b) =>
            String(b.id).localeCompare(String(a.id))
          );
          const latest = sorted[0];
          setFormData({
            area: latest.area || {},
            parcelas: latest.parcelas || [],
            tratos: latest.tratos || [],
            meteorologia: latest.meteorologia || [],
            irrigacao: latest.irrigacao || [],
            nutricao: latest.nutricao || [],
            pragas: latest.pragas || [],
            doencas: latest.doencas || [],
            agrotoxicos: latest.agrotoxicos || [],
            colheita: latest.colheita || [],
          });
        }
      } catch (e) {
        console.error('Erro ao carregar caderno de campo:', e);
      }
    };
    loadData();
  }, []);

  const handleStepDataChange = (stepKey, data) => {
    setFormData((prev) => ({ ...prev, [stepKey]: data }));
  };

  const stepsInfo = [
    { num: 1, key: 'area', label: 'Area' },
    { num: 2, key: 'parcelas', label: 'Parcelas' },
    { num: 3, key: 'tratos', label: 'Tratos' },
    { num: 4, key: 'meteorologia', label: 'Clima' },
    { num: 5, key: 'irrigacao', label: 'Irrigacao' },
    { num: 6, key: 'nutricao', label: 'Nutricao' },
    { num: 7, key: 'pragas', label: 'Pragas' },
    { num: 8, key: 'doencas', label: 'Doencas' },
    { num: 9, key: 'agrotoxicos', label: 'Defensivos' },
    { num: 10, key: 'colheita', label: 'Colheita' },
  ];

  const handleNext = () => { if (activeStep < 10) setActiveStep((p) => p + 1); };
  const handlePrev = () => { if (activeStep > 1) setActiveStep((p) => p - 1); };

  const doSave = useCallback(async (isFinal = false) => {
    setSaving(true);
    setSaveStatus(null);
    try {
      // Each save creates a NEW record (append-only) — id is generated inside saveEntity
      await saveEntity('caderno', formData);
      setSaveStatus('success');
      const dest = isOnline ? 'no banco de dados Supabase' : 'localmente (sem conexao com o banco)';
      setSaveMessage(
        isFinal
          ? 'Caderno de Campo finalizado! Novo registro salvo ' + dest + '.'
          : 'Rascunho salvo como novo registro ' + dest + '.'
      );
    } catch (err) {
      console.error('Erro ao salvar caderno:', err);
      setSaveStatus('error');
      setSaveMessage('Erro ao salvar. Verifique a conexao e tente novamente.');
    } finally {
      setSaving(false);
      if (isFinal) window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSaveStatus(null), 6000);
    }
  }, [formData, isOnline]);

  const handleSaveDraft = () => doSave(false);
  const handleFinish = (e) => { e.preventDefault(); doSave(true); };

  const renderStep = () => {
    const props = (key) => ({ data: formData[key], onChange: (d) => handleStepDataChange(key, d) });
    switch (activeStep) {
      case 1: return <Step1_Area {...props('area')} />;
      case 2: return <Step2_Parcelas {...props('parcelas')} />;
      case 3: return <Step3_Tratos {...props('tratos')} />;
      case 4: return <Step4_Meteorologia {...props('meteorologia')} />;
      case 5: return <Step5_Irrigacao {...props('irrigacao')} />;
      case 6: return <Step6_Nutricao {...props('nutricao')} />;
      case 7: return <Step7_Pragas {...props('pragas')} />;
      case 8: return <Step8_Doencas {...props('doencas')} />;
      case 9: return <Step9_Agrotoxicos {...props('agrotoxicos')} />;
      case 10: return <Step10_Colheita {...props('colheita')} />;
      default: return null;
    }
  };

  return (
    <div className="stepper-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Caderno de Campo</h2>
          <p style={{ color: 'var(--color-text-light)' }}>
            Acompanhamento completo de parcelas, nutricao, clima e colheitas (Etapas 1 a 10).
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.4rem 0.85rem', borderRadius: '999px',
          fontSize: '0.8rem', fontWeight: 600,
          background: isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(156,163,175,0.1)',
          color: isOnline ? 'var(--color-success)' : 'var(--color-text-muted)',
          border: '1px solid ' + (isOnline ? 'rgba(16,185,129,0.3)' : 'var(--color-border)'),
        }}>
          {isOnline ? <Cloud size={14} /> : <CloudOff size={14} />}
          {isOnline ? 'Supabase conectado' : 'Modo local'}
        </div>
      </div>

      {saveStatus === 'success' && (
        <div className="alert-success">
          <CheckCircle2 size={20} />
          <div><strong>{saveMessage}</strong></div>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div><strong>{saveMessage}</strong></div>
        </div>
      )}

      <div className="stepper-header">
        {stepsInfo.map((step) => (
          <button
            key={step.num}
            onClick={() => setActiveStep(step.num)}
            className={'stepper-step' + (activeStep === step.num ? ' active' : '') + (activeStep > step.num ? ' completed' : '')}
          >
            <div className="step-bubble">{step.num}</div>
            <span className="step-label">{step.label}</span>
          </button>
        ))}
      </div>

      <div className="stepper-body">{renderStep()}</div>

      <div className="step-nav-footer">
        <button
          type="button" onClick={handlePrev} disabled={activeStep === 1}
          className="btn btn-secondary"
          style={{ visibility: activeStep === 1 ? 'hidden' : 'visible' }}
        >
          <ChevronLeft size={18} /> Anterior
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500 }}>
            Etapa {activeStep} de 10
          </span>
          <button
            type="button" onClick={handleSaveDraft} disabled={saving}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
          >
            {saving ? <Loader2 size={13} className="spin-icon" /> : <Save size={13} />}
            {saving ? 'Salvando...' : 'Salvar rascunho'}
          </button>
        </div>

        {activeStep < 10 ? (
          <button type="button" onClick={handleNext} className="btn btn-primary">
            Proximo <ChevronRight size={18} />
          </button>
        ) : (
          <button type="button" onClick={handleFinish} disabled={saving} className="btn btn-accent"
            style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
            {saving
              ? <><Loader2 size={18} className="spin-icon" /> Salvando...</>
              : <><Save size={18} /> Finalizar e Salvar</>
            }
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}
