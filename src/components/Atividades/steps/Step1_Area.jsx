import React from 'react';

export default function Step1_Area({ data, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--color-primary)' }}>1. Detalhamento da Área</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Supervisor / Orientador *</label>
          <input
            type="text"
            name="supervisor"
            className="form-control"
            value={data.supervisor || ''}
            onChange={handleChange}
            placeholder="Nome do supervisor"
            required
          />
        </div>

        <div className="form-group">
          <label>Responsável Técnico *</label>
          <input
            type="text"
            name="responsavelTecnico"
            className="form-control"
            value={data.responsavelTecnico || ''}
            onChange={handleChange}
            placeholder="Nome do engenheiro agronômo/responsável"
            required
          />
        </div>

        <div className="form-group">
          <label>Bolsista *</label>
          <input
            type="text"
            name="bolsista"
            className="form-control"
            value={data.bolsista || ''}
            onChange={handleChange}
            placeholder="Nome do bolsista"
            required
          />
        </div>

        <div className="form-group">
          <label>Município *</label>
          <input
            type="text"
            name="municipio"
            className="form-control"
            value={data.municipio || ''}
            onChange={handleChange}
            placeholder="Município / Comunidade"
            required
          />
        </div>

        <div className="form-group">
          <label>Telefones *</label>
          <input
            type="tel"
            name="telefones"
            className="form-control"
            value={data.telefones || ''}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            required
          />
        </div>

        <div className="form-group">
          <label>E-mail *</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={data.email || ''}
            onChange={handleChange}
            placeholder="contato@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Data de Plantio *</label>
          <input
            type="date"
            name="dataPlantio"
            className="form-control"
            value={data.dataPlantio || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Setor / Lote</label>
          <input
            type="text"
            name="setor"
            className="form-control"
            value={data.setor || ''}
            onChange={handleChange}
            placeholder="Ex: Setor A2"
          />
        </div>

        <div className="form-group">
          <label>Cultura Principal *</label>
          <input
            type="text"
            name="cultura"
            className="form-control"
            value={data.cultura || ''}
            onChange={handleChange}
            placeholder="Ex: Mandioca"
            required
          />
        </div>

        <div className="form-group">
          <label>Variedade *</label>
          <input
            type="text"
            name="variedade"
            className="form-control"
            value={data.variedade || ''}
            onChange={handleChange}
            placeholder="Ex: BRS Gema de Ovo"
            required
          />
        </div>

        <div className="form-group">
          <label>Espaçamento (m) *</label>
          <input
            type="text"
            name="espacamento"
            className="form-control"
            value={data.espacamento || ''}
            onChange={handleChange}
            placeholder="Ex: 1,0 x 0,8"
            required
          />
        </div>

        <div className="form-group">
          <label>Experimento / Código do Projeto</label>
          <input
            type="text"
            name="experimento"
            className="form-control"
            value={data.experimento || ''}
            onChange={handleChange}
            placeholder="Ex: Exp-Biofortificados-2026"
          />
        </div>
      </div>
    </div>
  );
}
