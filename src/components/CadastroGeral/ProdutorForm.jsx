import React, { useState } from 'react';
import { User, TreePine, CheckCircle2 } from 'lucide-react';

export default function ProdutorForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // Perfil Socioeconomico
    nomeCompleto: '',
    cpf: '',
    email: '',
    escolaridade: '',
    telefone: '',
    rendaMensal: '',
    estadoCivil: '',
    integrantesFamilia: '',
    atividadePrincipal: '',
    atividadeSecundaria: '',
    programaRenda: 'Não',
    
    // Area de Cultivo
    localizacao: '',
    tamanhoArea: '',
    disponibilidadeAgua: [],
    fazIrrigacao: 'Não',
    tipoIrrigacao: '',
    culturasCultivadas: '',
    destinoVenda: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const current = prev.disponibilidadeAgua;
      if (checked) {
        return { ...prev, disponibilidadeAgua: [...current, value] };
      } else {
        return { ...prev, disponibilidadeAgua: current.filter((item) => item !== value) };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setSubmitted(false);
      // Reset form or keep it filled
    }, 4000);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Produtor / Agricultor</h2>
        <p style={{ color: 'var(--color-text-light)' }}>Cadastro de perfis de produtores rurais e suas respectivas áreas de cultivo.</p>
      </div>

      {submitted && (
        <div className="alert-success">
          <CheckCircle2 size={24} />
          <div>
            <strong>Cadastro realizado com sucesso!</strong> Os dados do Produtor foram salvos localmente.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* CARD 1: Perfil Socioeconômico */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 className="form-section-title">
            <User size={20} />
            1. Perfil Socioeconômico
          </h3>
          
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Nome Completo *</label>
              <input
                type="text"
                name="nomeCompleto"
                className="form-control"
                required
                value={formData.nomeCompleto}
                onChange={handleInputChange}
                placeholder="Nome completo do produtor"
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
              <label>Telefone</label>
              <input
                type="tel"
                name="telefone"
                className="form-control"
                value={formData.telefone}
                onChange={handleInputChange}
                placeholder="(81) 99999-9999"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="exemplo@email.com"
              />
            </div>

            <div className="form-group">
              <label>Escolaridade</label>
              <select name="escolaridade" className="form-control" value={formData.escolaridade} onChange={handleInputChange}>
                <option value="">Selecione...</option>
                <option value="Fundamental Incompleto">Fundamental Incompleto</option>
                <option value="Fundamental Completo">Fundamental Completo</option>
                <option value="Médio Incompleto">Médio Incompleto</option>
                <option value="Médio Completo">Médio Completo</option>
                <option value="Superior Completo">Superior Completo</option>
                <option value="Não Alfabetizado">Não Alfabetizado</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estado Civil</label>
              <select name="estadoCivil" className="form-control" value={formData.estadoCivil} onChange={handleInputChange}>
                <option value="">Selecione...</option>
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
                <option value="União Estável">União Estável</option>
              </select>
            </div>

            <div className="form-group">
              <label>Integrantes da Família</label>
              <input
                type="number"
                name="integrantesFamilia"
                className="form-control"
                value={formData.integrantesFamilia}
                onChange={handleInputChange}
                placeholder="Quantidade de pessoas"
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Renda Média Mensal (R$)</label>
              <input
                type="text"
                name="rendaMensal"
                className="form-control"
                value={formData.rendaMensal}
                onChange={handleInputChange}
                placeholder="Ex: 1.500,00"
              />
            </div>

            <div className="form-group">
              <label>Atividade Principal</label>
              <input
                type="text"
                name="atividadePrincipal"
                className="form-control"
                value={formData.atividadePrincipal}
                onChange={handleInputChange}
                placeholder="Ex: Cultivo de Mandioca"
              />
            </div>

            <div className="form-group">
              <label>Atividade Secundária</label>
              <input
                type="text"
                name="atividadeSecundaria"
                className="form-control"
                value={formData.atividadeSecundaria}
                onChange={handleInputChange}
                placeholder="Ex: Avicultura"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Participa de programa de transferência de renda? (Bolsa Família, etc.)</label>
              <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="programaRenda"
                    value="Sim"
                    checked={formData.programaRenda === 'Sim'}
                    onChange={handleInputChange}
                  /> Sim
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="programaRenda"
                    value="Não"
                    checked={formData.programaRenda === 'Não'}
                    onChange={handleInputChange}
                  /> Não
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Área de Cultivo */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 className="form-section-title">
            <TreePine size={20} />
            2. Área de Cultivo
          </h3>
          
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Localização (Município/Comunidade/Coordenadas) *</label>
              <input
                type="text"
                name="localizacao"
                className="form-control"
                required
                value={formData.localizacao}
                onChange={handleInputChange}
                placeholder="Ex: Sítio Bonito, Buíque - PE"
              />
            </div>

            <div className="form-group">
              <label>Tamanho da Área (Hectares)</label>
              <input
                type="number"
                step="0.01"
                name="tamanhoArea"
                className="form-control"
                value={formData.tamanhoArea}
                onChange={handleInputChange}
                placeholder="Ex: 5.5"
              />
            </div>

            <div className="form-group">
              <label>Faz Irrigação?</label>
              <select name="fazIrrigacao" className="form-control" value={formData.fazIrrigacao} onChange={handleInputChange}>
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </select>
            </div>

            {formData.fazIrrigacao === 'Sim' && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Qual o tipo de irrigação?</label>
                <input
                  type="text"
                  name="tipoIrrigacao"
                  className="form-control"
                  value={formData.tipoIrrigacao}
                  onChange={handleInputChange}
                  placeholder="Ex: Gotejamento, Microaspersão"
                />
              </div>
            )}

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Disponibilidade de Água (Selecione todos os que se aplicam)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                {['Adutora', 'Poço', 'Açude', 'Cisterna'].map((item) => (
                  <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'normal', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      value={item}
                      checked={formData.disponibilidadeAgua.includes(item)}
                      onChange={handleCheckboxChange}
                    /> {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Culturas que já cultiva</label>
              <input
                type="text"
                name="culturasCultivadas"
                className="form-control"
                value={formData.culturasCultivadas}
                onChange={handleInputChange}
                placeholder="Ex: Mandioca biofortificada, Feijão, Milho"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Para onde vende a produção?</label>
              <input
                type="text"
                name="destinoVenda"
                className="form-control"
                value={formData.destinoVenda}
                onChange={handleInputChange}
                placeholder="Ex: Feira local, PAA, PNAE, atravessador"
              />
            </div>
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn btn-primary">
            Salvar Cadastro
          </button>
        </div>
      </form>
    </div>
  );
}
