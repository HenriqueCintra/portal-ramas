import React, { useState } from 'react';
import { GraduationCap, CheckCircle2 } from 'lucide-react';
import { saveEntity } from '../../utils/storage';


export default function EscolaForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    local: '',
    cnpj: '',
    representante: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveEntity('escola', formData);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GraduationCap size={28} style={{ color: 'var(--color-secondary)' }} />
          Escola (Ensino Fundamental / Médio)
        </h2>
        <p style={{ color: 'var(--color-text-light)' }}>Cadastro de escolas integradas ao projeto para recebimento de alimentos ou atividades educacionais.</p>
      </div>

      {submitted && (
        <div className="alert-success">
          <CheckCircle2 size={24} />
          <div>
            <strong>Cadastro de Escola realizado com sucesso!</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Nome da Escola *</label>
            <input
              type="text"
              name="nome"
              className="form-control"
              required
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Ex: Escola Estadual Tomé de Souza"
            />
          </div>

          <div className="form-group">
            <label>CNPJ / Código INEP</label>
            <input
              type="text"
              name="cnpj"
              className="form-control"
              value={formData.cnpj}
              onChange={handleInputChange}
              placeholder="00.000.000/0000-00 ou código"
            />
          </div>

          <div className="form-group">
            <label>Localização / Endereço *</label>
            <input
              type="text"
              name="local"
              className="form-control"
              required
              value={formData.local}
              onChange={handleInputChange}
              placeholder="Ex: Distrito de Carneiro, Buíque - PE"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Representante junto ao Projeto (Diretor / Coordenador) *</label>
            <input
              type="text"
              name="representante"
              className="form-control"
              required
              value={formData.representante}
              onChange={handleInputChange}
              placeholder="Nome do representante responsável na escola"
            />
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn btn-primary">
            Salvar Escola
          </button>
        </div>
      </form>
    </div>
  );
}
