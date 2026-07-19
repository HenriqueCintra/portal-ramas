import React, { useState } from 'react';
import { UserCheck, CheckCircle2 } from 'lucide-react';

export default function ParceiroForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    instituicao: '',
    cpf: '',
    titulacao: '',
    areaAtuacao: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={28} style={{ color: 'var(--color-secondary)' }} />
          Pesquisador e Parceiro
        </h2>
        <p style={{ color: 'var(--color-text-light)' }}>Cadastro de pesquisadores individuais, extensionistas e consultores associados.</p>
      </div>

      {submitted && (
        <div className="alert-success">
          <CheckCircle2 size={24} />
          <div>
            <strong>Cadastro de Parceiro / Pesquisador realizado com sucesso!</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Nome Completo *</label>
            <input
              type="text"
              name="nome"
              className="form-control"
              required
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Nome do pesquisador ou parceiro"
            />
          </div>

          <div className="form-group">
            <label>CPF *</label>
            <input
              type="text"
              name="cpf"
              className="form-control"
              required
              value={formData.cpf}
              onChange={handleInputChange}
              placeholder="000.000.000-00"
            />
          </div>

          <div className="form-group">
            <label>Titulação Acadêmica</label>
            <select name="titulacao" className="form-control" value={formData.titulacao} onChange={handleInputChange}>
              <option value="">Selecione...</option>
              <option value="Graduando">Graduando / Estudante</option>
              <option value="Graduado">Graduado / Técnico</option>
              <option value="Especialista">Especialista</option>
              <option value="Mestre">Mestre</option>
              <option value="Doutor">Doutor</option>
              <option value="Pós-Doutor">Pós-Doutor</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Instituição de Vínculo *</label>
            <input
              type="text"
              name="instituicao"
              className="form-control"
              required
              value={formData.instituicao}
              onChange={handleInputChange}
              placeholder="Ex: Universidade Federal Rural de Pernambuco (UFRPE)"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Área de Atuação / Linha de Pesquisa *</label>
            <input
              type="text"
              name="areaAtuacao"
              className="form-control"
              required
              value={formData.areaAtuacao}
              onChange={handleInputChange}
              placeholder="Ex: Fitotecnia, Melhoramento Genético, Irrigação de Mandioca"
            />
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn btn-primary">
            Salvar Pesquisador
          </button>
        </div>
      </form>
    </div>
  );
}
