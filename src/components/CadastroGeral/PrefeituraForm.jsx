import React, { useState } from 'react';
import { Landmark, CheckCircle2 } from 'lucide-react';
import { saveEntity } from '../../utils/storage';


export default function PrefeituraForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    local: '',
    representante: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveEntity('prefeitura', formData);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Landmark size={28} style={{ color: 'var(--color-secondary)' }} />
          Prefeitura
        </h2>
        <p style={{ color: 'var(--color-text-light)' }}>Cadastro de prefeituras parceiras das ações de fomento agroecológico.</p>
      </div>

      {submitted && (
        <div className="alert-success">
          <CheckCircle2 size={24} />
          <div>
            <strong>Cadastro de Prefeitura realizado com sucesso!</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Nome / Município da Prefeitura *</label>
            <input
              type="text"
              name="nome"
              className="form-control"
              required
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Ex: Prefeitura Municipal de Buíque"
            />
          </div>

          <div className="form-group">
            <label>CNPJ *</label>
            <input
              type="text"
              name="cnpj"
              className="form-control"
              required
              value={formData.cnpj}
              onChange={handleInputChange}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="form-group">
            <label>Local / UF *</label>
            <input
              type="text"
              name="local"
              className="form-control"
              required
              value={formData.local}
              onChange={handleInputChange}
              placeholder="Ex: Buíque - PE"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Representante junto ao Projeto *</label>
            <input
              type="text"
              name="representante"
              className="form-control"
              required
              value={formData.representante}
              onChange={handleInputChange}
              placeholder="Nome do secretário de agricultura ou assessor encarregado"
            />
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn btn-primary">
            Salvar Prefeitura
          </button>
        </div>
      </form>
    </div>
  );
}
