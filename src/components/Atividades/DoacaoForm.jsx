import React, { useState, useEffect } from 'react';
import { Gift, TreePine, Apple, CheckCircle2 } from 'lucide-react';
import { saveEntity, getEntities } from '../../utils/storage';

export default function DoacaoForm({ embedded = false, entityType = '', defaultRecipient = '', defaultDestination = '' }) {
  const [submitted, setSubmitted] = useState(false);
  const [entitiesList, setEntitiesList] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState('');

  const [formData, setFormData] = useState({
    // Mudas e Sementes
    mudasVariedade: '',
    mudasQuantidade: '',
    mudasLote: '',
    mudasLocalDestino: defaultDestination,
    mudasResponsavel: defaultRecipient,
    mudasPrevisaoCultivo: '',

    // Alimentos Biofortificados
    alimentosVariedade: '',
    alimentosQuantidade: '',
    alimentosLocalDestino: defaultDestination,
    alimentosResponsavel: defaultRecipient
  });

  const entityLabels = {
    produtor: 'Produtor / Agricultor',
    associacao: 'Associação / Cooperativa',
    prefeitura: 'Prefeitura',
    escola: 'Escola (Fund. / Médio)',
    instituicao: 'Instituição de Pesquisa',
    parceiro: 'Pesquisador e Parceiro'
  };

  const entityTypeLabel = entityLabels[entityType] || 'Entidade';

  const getEntityName = (item) => item.nomeCompleto || item.nome;
  const getEntityLocation = (item) => item.localizacao || item.local || '';

  // Fetch list of entities of this type
  useEffect(() => {
    if (embedded && entityType) {
      const list = getEntities(entityType);
      setEntitiesList(list);
      setSelectedEntityId('');
    }
  }, [entityType, embedded]);

  // Listen for database changes
  useEffect(() => {
    const handleUpdate = (e) => {
      if (embedded && entityType && (!e.detail || e.detail.type === entityType)) {
        setEntitiesList(getEntities(entityType));
      }
    };
    window.addEventListener('database-updated', handleUpdate);
    return () => window.removeEventListener('database-updated', handleUpdate);
  }, [entityType, embedded]);

  const handleEntitySelect = (e) => {
    const id = e.target.value;
    setSelectedEntityId(id);
    if (!id) {
      setFormData(prev => ({
        ...prev,
        mudasResponsavel: defaultRecipient,
        mudasLocalDestino: defaultDestination,
        alimentosResponsavel: defaultRecipient,
        alimentosLocalDestino: defaultDestination
      }));
      return;
    }
    const selected = entitiesList.find(item => item.id === id);
    if (selected) {
      const name = getEntityName(selected);
      const loc = getEntityLocation(selected);
      setFormData(prev => ({
        ...prev,
        mudasResponsavel: name,
        mudasLocalDestino: loc,
        alimentosResponsavel: name,
        alimentosLocalDestino: loc
      }));
    }
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      mudasLocalDestino: defaultDestination || prev.mudasLocalDestino,
      mudasResponsavel: defaultRecipient || prev.mudasResponsavel,
      alimentosLocalDestino: defaultDestination || prev.alimentosLocalDestino,
      alimentosResponsavel: defaultRecipient || prev.alimentosResponsavel
    }));
  }, [defaultRecipient, defaultDestination]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    let savedSomething = false;

    if (formData.mudasVariedade && formData.mudasQuantidade) {
      saveEntity('doacoes', {
        tipo: 'mudas',
        mudasVariedade: formData.mudasVariedade,
        mudasQuantidade: formData.mudasQuantidade,
        mudasLote: formData.mudasLote,
        mudasLocalDestino: formData.mudasLocalDestino,
        mudasResponsavel: formData.mudasResponsavel,
        mudasPrevisaoCultivo: formData.mudasPrevisaoCultivo,
        dataRegistro: today
      });
      savedSomething = true;
    }

    if (formData.alimentosVariedade && formData.alimentosQuantidade) {
      saveEntity('doacoes', {
        tipo: 'alimentos',
        alimentosVariedade: formData.alimentosVariedade,
        alimentosQuantidade: formData.alimentosQuantidade,
        alimentosLocalDestino: formData.alimentosLocalDestino,
        alimentosResponsavel: formData.alimentosResponsavel,
        dataRegistro: today
      });
      savedSomething = true;
    }

    if (!savedSomething) {
      saveEntity('doacoes', {
        tipo: formData.mudasVariedade ? 'mudas' : 'alimentos',
        ...formData,
        dataRegistro: today
      });
    }

    setSubmitted(true);
    if (!embedded) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setTimeout(() => setSubmitted(false), 4000);

    // Limpar formulário
    setFormData({
      mudasVariedade: '',
      mudasQuantidade: '',
      mudasLote: '',
      mudasLocalDestino: defaultDestination,
      mudasResponsavel: defaultRecipient,
      mudasPrevisaoCultivo: '',
      alimentosVariedade: '',
      alimentosQuantidade: '',
      alimentosLocalDestino: defaultDestination,
      alimentosResponsavel: defaultRecipient
    });
    setSelectedEntityId('');
  };

  return (
    <div>
      {!embedded ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gift size={28} style={{ color: 'var(--color-secondary)' }} />
            Doações de Materiais e Alimentos
          </h2>
          <p style={{ color: 'var(--color-text-light)' }}>Registro das entregas de sementes, mudas biofortificadas ou distribuição de colheitas de biofortificados.</p>
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem', marginTop: '2.5rem', borderTop: '1px dashed var(--color-border)', paddingTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gift size={24} style={{ color: 'var(--color-secondary)' }} />
            Registrar Doação Vinculada
          </h2>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Insira registros de doações associadas a esta entidade cadastrada.</p>
        </div>
      )}

      {embedded && entitiesList.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(82, 183, 136, 0.08)', borderColor: 'rgba(82, 183, 136, 0.3)' }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--color-primary)', fontSize: '0.95rem' }}>
            Vincular Doação a um {entityTypeLabel} Cadastrado:
          </label>
          <select
            className="form-control"
            value={selectedEntityId}
            onChange={handleEntitySelect}
            style={{ maxWidth: '400px', background: 'white' }}
          >
            <option value="">-- Selecione uma entidade --</option>
            {entitiesList.map(ent => (
              <option key={ent.id} value={ent.id}>
                {getEntityName(ent)} {getEntityLocation(ent) ? `(${getEntityLocation(ent)})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {submitted && (
        <div className="alert-success">
          <CheckCircle2 size={24} />
          <div>
            <strong>Registro de Doações salvo com sucesso!</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Bloco 1: Mudas e Sementes */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 className="form-section-title">
            <TreePine size={20} />
            1. Distribuição de Mudas e Sementes
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Variedades Entregues *</label>
              <input
                type="text"
                name="mudasVariedade"
                className="form-control"
                value={formData.mudasVariedade}
                onChange={handleInputChange}
                placeholder="Ex: Mandioca BRS Kiriris, Feijão"
              />
            </div>

            <div className="form-group">
              <label>Quantidade Entregue *</label>
              <input
                type="text"
                name="mudasQuantidade"
                className="form-control"
                value={formData.mudasQuantidade}
                onChange={handleInputChange}
                placeholder="Ex: 500 manivas, 10 kg sementes"
              />
            </div>

            <div className="form-group">
              <label>Lote de Origem</label>
              <input
                type="text"
                name="mudasLote"
                className="form-control"
                value={formData.mudasLote}
                onChange={handleInputChange}
                placeholder="Ex: LOTE-2026/A"
              />
            </div>

            <div className="form-group">
              <label>Previsão de Cultivo (Mês/Ano)</label>
              <input
                type="month"
                name="mudasPrevisaoCultivo"
                className="form-control"
                value={formData.mudasPrevisaoCultivo}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Local de Destino (Comunidade/Propriedade) *</label>
              <input
                type="text"
                name="mudasLocalDestino"
                className="form-control"
                value={formData.mudasLocalDestino}
                onChange={handleInputChange}
                placeholder="Ex: Comunidade Quilombola de Melancia"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Responsável pelo Recebimento *</label>
              <input
                type="text"
                name="mudasResponsavel"
                className="form-control"
                value={formData.mudasResponsavel}
                onChange={handleInputChange}
                placeholder="Nome da liderança ou produtor receptor"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Alimentos Biofortificados */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 className="form-section-title">
            <Apple size={20} />
            2. Distribuição de Alimentos Biofortificados
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Variedades de Alimentos *</label>
              <input
                type="text"
                name="alimentosVariedade"
                className="form-control"
                value={formData.alimentosVariedade}
                onChange={handleInputChange}
                placeholder="Ex: Batata-doce BRS Amélia, Milho Biofortificado"
              />
            </div>

            <div className="form-group">
              <label>Quantidade Entregue (Kg/Unid) *</label>
              <input
                type="text"
                name="alimentosQuantidade"
                className="form-control"
                value={formData.alimentosQuantidade}
                onChange={handleInputChange}
                placeholder="Ex: 120 kg de raízes"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Local de Destino (Escola, Associação, Família) *</label>
              <input
                type="text"
                name="alimentosLocalDestino"
                className="form-control"
                value={formData.alimentosLocalDestino}
                onChange={handleInputChange}
                placeholder="Ex: Escola Municipal do Campo Carneiro"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Responsável pelo Recebimento *</label>
              <input
                type="text"
                name="alimentosResponsavel"
                className="form-control"
                value={formData.alimentosResponsavel}
                onChange={handleInputChange}
                placeholder="Nome da pessoa responsável pela cozinha ou distribuição"
              />
            </div>
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn btn-primary">
            Salvar Registros de Doação
          </button>
        </div>
      </form>
    </div>
  );
}
