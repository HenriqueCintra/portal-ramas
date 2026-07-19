import React, { useState } from 'react';
import { Microscope, CheckCircle2 } from 'lucide-react';
import { saveEntity } from '../../utils/storage';


export default function InstituicaoForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    local: '',
    cnpj: '',
    representante: '',
    natureza: 'Pública'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveEntity('instituicao', formData);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Microscope size={28} style={{ color: 'var(--color-secondary)' }} />
          Instituição de Pesquisa
        </h2>
        <p style={{ color: 'var(--color-text-light)' }}>Cadastro de universidades, órgãos públicos de pesquisa ou fundações parceiras.</p>
      </div>

      {submitted && (
        <div className="alert-success">
          <CheckCircle2 size={24} />
          <div>
            <strong>Cadastro de Instituição de Pesquisa realizado com sucesso!</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Nome da Instituição *</label>
            <input
              type="text"
              name="nome"
              className="form-control"
              required
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Ex: IPA - Instituto Agronômico de Pernambuco"
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
            <label>Natureza Institucional</label>
            <select name="natureza" className="form-control" value={formData.natureza} onChange={handleInputChange}>
              <option value="Pública">Pública (Federal, Estadual ou Municipal)</option>
              <option value="Privada">Privada / Filantrópica</option>
              <option value="Mista">Sociedade de Economia Mista</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Local / Campus / Endereço *</label>
            <input
              type="text"
              name="local"
              className="form-control"
              required
              value={formData.local}
              onChange={handleInputChange}
              placeholder="Ex: Sede IPA Recife / Unidade Buíque"
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
              placeholder="Nome do pesquisador-chefe ou responsável institucional"
            />
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn btn-primary">
            Salvar Instituição
          </button>
        </div>
      </form>
    </div>
  );
}
