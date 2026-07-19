import React, { useState } from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import { saveEntity } from '../../utils/storage';


export default function AssociacaoForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cnpj: '',
    localizacao: '',
    numeroAssociados: '',
    culturasProduzidas: '',
    principaisClientes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveEntity('associacao', formData);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={28} style={{ color: 'var(--color-secondary)' }} />
          Associação / Cooperativa
        </h2>
        <p style={{ color: 'var(--color-text-light)' }}>Cadastro de associações comunitárias e cooperativas agroecológicas.</p>
      </div>

      {submitted && (
        <div className="alert-success">
          <CheckCircle2 size={24} />
          <div>
            <strong>Cadastro de Associação realizado com sucesso!</strong> Os dados foram armazenados.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Nome Completo / Razão Social *</label>
            <input
              type="text"
              name="nomeCompleto"
              className="form-control"
              required
              value={formData.nomeCompleto}
              onChange={handleInputChange}
              placeholder="Razão social ou nome fantasia"
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
            <label>Número de Associados / Cooperados</label>
            <input
              type="number"
              name="numeroAssociados"
              className="form-control"
              value={formData.numeroAssociados}
              onChange={handleInputChange}
              placeholder="Ex: 45"
              min="1"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Localização (Sede / Município) *</label>
            <input
              type="text"
              name="localizacao"
              className="form-control"
              required
              value={formData.localizacao}
              onChange={handleInputChange}
              placeholder="Endereço da sede ou comunidade"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Culturas Produzidas / Comercializadas</label>
            <input
              type="text"
              name="culturasProduzidas"
              className="form-control"
              value={formData.culturasProduzidas}
              onChange={handleInputChange}
              placeholder="Ex: Mandioca, Batata-doce, Feijão Verde"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Principais Clientes / Destinos da Produção</label>
            <input
              type="text"
              name="principaisClientes"
              className="form-control"
              value={formData.principaisClientes}
              onChange={handleInputChange}
              placeholder="Ex: Merenda escolar, Conab, Redes de supermercado"
            />
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn btn-primary">
            Salvar Associação
          </button>
        </div>
      </form>
    </div>
  );
}
