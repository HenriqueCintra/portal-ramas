import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Save } from 'lucide-react';
import { getEntities, saveEntity } from '../../utils/storage';
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
  const [submitted, setSubmitted] = useState(false);

  // Centralized state for all 10 sheets
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
    colheita: []
  });

  // Load last saved Caderno de Campo on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getEntities('caderno');
        if (data && data.length > 0) {
          const latest = data[data.length - 1];
          setFormData({
            id: latest.id,
            area: latest.area || {},
            parcelas: latest.parcelas || [],
            tratos: latest.tratos || [],
            meteorologia: latest.meteorologia || [],
            irrigacao: latest.irrigacao || [],
            nutricao: latest.nutricao || [],
            pragas: latest.pragas || [],
            doencas: latest.doencas || [],
            agrotoxicos: latest.agrotoxicos || [],
            colheita: latest.colheita || []
          });
        }
      } catch (e) {
        console.error("Erro ao carregar caderno de campo do banco:", e);
      }
    };
    loadData();
  }, []);

  const handleStepDataChange = (stepKey, data) => {
    setFormData((prev) => ({
      ...prev,
      [stepKey]: data
    }));
  };

  const stepsInfo = [
    { num: 1, key: 'area', label: 'Área' },
    { num: 2, key: 'parcelas', label: 'Parcelas' },
    { num: 3, key: 'tratos', label: 'Tratos' },
    { num: 4, key: 'meteorologia', label: 'Clima' },
    { num: 5, key: 'irrigacao', label: 'Irrigação' },
    { num: 6, key: 'nutricao', label: 'Nutrição' },
    { num: 7, key: 'pragas', label: 'Pragas' },
    { num: 8, key: 'doencas', label: 'Doenças' },
    { key: 'agrotoxicos', num: 9, label: 'Defensivos' },
    { key: 'colheita', num: 10, label: 'Colheita' }
  ];

  const handleNext = () => {
    if (activeStep < 10) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      await saveEntity('caderno', formData);
    } catch (e) {
      console.error("Erro ao salvar caderno de campo no banco:", e);
    }

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  const renderActiveStepComponent = () => {
    switch (activeStep) {
      case 1:
        return (
          <Step1_Area
            data={formData.area}
            onChange={(data) => handleStepDataChange('area', data)}
          />
        );
      case 2:
        return (
          <Step2_Parcelas
            data={formData.parcelas}
            onChange={(data) => handleStepDataChange('parcelas', data)}
          />
        );
      case 3:
        return (
          <Step3_Tratos
            data={formData.tratos}
            onChange={(data) => handleStepDataChange('tratos', data)}
          />
        );
      case 4:
        return (
          <Step4_Meteorologia
            data={formData.meteorologia}
            onChange={(data) => handleStepDataChange('meteorologia', data)}
          />
        );
      case 5:
        return (
          <Step5_Irrigacao
            data={formData.irrigacao}
            onChange={(data) => handleStepDataChange('irrigacao', data)}
          />
        );
      case 6:
        return (
          <Step6_Nutricao
            data={formData.nutricao}
            onChange={(data) => handleStepDataChange('nutricao', data)}
          />
        );
      case 7:
        return (
          <Step7_Pragas
            data={formData.pragas}
            onChange={(data) => handleStepDataChange('pragas', data)}
          />
        );
      case 8:
        return (
          <Step8_Doencas
            data={formData.doencas}
            onChange={(data) => handleStepDataChange('doencas', data)}
          />
        );
      case 9:
        return (
          <Step9_Agrotoxicos
            data={formData.agrotoxicos}
            onChange={(data) => handleStepDataChange('agrotoxicos', data)}
          />
        );
      case 10:
        return (
          <Step10_Colheita
            data={formData.colheita}
            onChange={(data) => handleStepDataChange('colheita', data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="stepper-container">
      <div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Caderno de Campo</h2>
        <p style={{ color: 'var(--color-text-light)' }}>
          Acompanhamento completo de parcelas, nutrição, clima e colheitas (Etapas 1 a 10).
        </p>
      </div>

      {submitted && (
        <div className="alert-success">
          <CheckCircle2 size={24} />
          <div>
            <strong>Caderno de Campo finalizado e salvo com sucesso!</strong> Os dados foram persistidos no seu navegador.
          </div>
        </div>
      )}

      {/* Stepper Headers */}
      <div className="stepper-header">
        {stepsInfo.map((step) => {
          const isCurrent = activeStep === step.num;
          const isCompleted = activeStep > step.num;

          return (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              className={`stepper-step ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="step-bubble">
                {step.num}
              </div>
              <span className="step-label">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Content */}
      <div className="stepper-body">
        {renderActiveStepComponent()}
      </div>

      {/* Stepper Navigation Footer */}
      <div className="step-nav-footer">
        <button
          type="button"
          onClick={handlePrev}
          disabled={activeStep === 1}
          className="btn btn-secondary"
          style={{ visibility: activeStep === 1 ? 'hidden' : 'visible' }}
        >
          <ChevronLeft size={18} />
          Anterior
        </button>

        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 500 }}>
          Etapa {activeStep} de 10
        </span>

        {activeStep < 10 ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary"
          >
            Próximo
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="btn btn-accent"
            style={{ gap: '0.5rem' }}
          >
            <Save size={18} />
            Finalizar e Salvar
          </button>
        )}
      </div>
    </div>
  );
}
