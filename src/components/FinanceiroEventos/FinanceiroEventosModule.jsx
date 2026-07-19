import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  CalendarDays, 
  PlusCircle, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Users, 
  Search
} from 'lucide-react';
import { getEntities, saveEntity, deleteEntity } from '../../utils/storage';

export default function FinanceiroEventosModule() {
  const [activeSubTab, setActiveSubTab] = useState('financeiro');
  const [transactions, setTransactions] = useState([]);
  const [events, setEvents] = useState([]);

  // States for financial form
  const [finType, setFinType] = useState('Despesa');
  const [finCategory, setFinCategory] = useState('Mudas');
  const [finValue, setFinValue] = useState('');
  const [finDate, setFinDate] = useState('');
  const [finDescription, setFinDescription] = useState('');
  const [finStatus, setFinStatus] = useState('Pago');

  // States for events form
  const [evTitle, setEvTitle] = useState('');
  const [evType, setEvType] = useState('Oficina');
  const [evDate, setEvDate] = useState('');
  const [evTime, setEvTime] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evDescription, setEvDescription] = useState('');
  const [evParticipants, setEvParticipants] = useState('');
  const [evCost, setEvCost] = useState('');

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todos');

  // Success alert states
  const [showFinAlert, setShowFinAlert] = useState(false);
  const [showEvAlert, setShowEvAlert] = useState(false);

  // Load data
  const loadData = () => {
    setTransactions(getEntities('financeiro'));
    setEvents(getEntities('eventos'));
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('database-updated', handleUpdate);
    return () => window.removeEventListener('database-updated', handleUpdate);
  }, []);

  // Form Submissions
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!finValue || !finDate || !finDescription) return;

    const newTx = {
      tipo: finType,
      categoria: finCategory,
      valor: parseFloat(finValue),
      data: finDate,
      descricao: finDescription,
      status: finStatus
    };

    saveEntity('financeiro', newTx);
    setShowFinAlert(true);
    setTimeout(() => setShowFinAlert(false), 3000);

    // Reset fields
    setFinValue('');
    setFinDate('');
    setFinDescription('');
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!evTitle || !evDate || !evLocation) return;

    const costVal = evCost ? parseFloat(evCost) : 0;

    const newEvent = {
      titulo: evTitle,
      tipo: evType,
      data: evDate,
      hora: evTime || '00:00',
      local: evLocation,
      descricao: evDescription,
      participantes: evParticipants ? parseInt(evParticipants) : 0,
      custo: costVal
    };

    // Save event
    saveEntity('eventos', newEvent);

    // If cost > 0, auto add an expense in financeiro
    if (costVal > 0) {
      saveEntity('financeiro', {
        tipo: 'Despesa',
        categoria: 'Evento',
        valor: costVal,
        data: evDate,
        descricao: `Custo Evento: ${evTitle}`,
        status: 'Pago'
      });
    }

    setShowEvAlert(true);
    setTimeout(() => setShowEvAlert(false), 3000);

    // Reset fields
    setEvTitle('');
    setEvDate('');
    setEvTime('');
    setEvLocation('');
    setEvDescription('');
    setEvParticipants('');
    setEvCost('');
  };

  const handleDeleteTx = (id) => {
    if (window.confirm('Deseja realmente excluir esta transação?')) {
      deleteEntity('financeiro', id);
    }
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('Deseja realmente excluir este evento?')) {
      deleteEntity('eventos', id);
    }
  };

  // Financial summary calculations
  const totalReceitas = transactions
    .filter(t => t.tipo === 'Receita')
    .reduce((sum, t) => sum + (t.valor || 0), 0);

  const totalDespesas = transactions
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, t) => sum + (t.valor || 0), 0);

  const saldo = totalReceitas - totalDespesas;

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.descricao.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.categoria.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'Todos' || t.tipo === filterType;
    const matchesCategory = filterCategory === 'Todos' || t.categoria === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Coins size={36} style={{ color: 'var(--color-secondary)' }} />
          Controle Financeiro & Eventos
        </h1>
        <p style={{ color: 'var(--color-text-light)' }}>
          Gerencie o fluxo financeiro do projeto e cadastre eventos de campo, integrando despesas automaticamente.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveSubTab('financeiro')}
          className="btn"
          style={{
            background: activeSubTab === 'financeiro' ? 'var(--color-primary)' : 'transparent',
            color: activeSubTab === 'financeiro' ? 'white' : 'var(--color-text-light)',
            boxShadow: activeSubTab === 'financeiro' ? 'var(--glass-shadow)' : 'none',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <Coins size={18} />
          Controle Financeiro
        </button>
        <button
          onClick={() => setActiveSubTab('eventos')}
          className="btn"
          style={{
            background: activeSubTab === 'eventos' ? 'var(--color-primary)' : 'transparent',
            color: activeSubTab === 'eventos' ? 'white' : 'var(--color-text-light)',
            boxShadow: activeSubTab === 'eventos' ? 'var(--glass-shadow)' : 'none',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <CalendarDays size={18} />
          Eventos & Capacitações
        </button>
      </div>

      {activeSubTab === 'financeiro' && (
        <div>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '5px solid var(--color-success)' }}>
              <div>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', fontWeight: 600 }}>Total Receitas</p>
                <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0', color: 'var(--color-success)' }}>
                  R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '0.75rem', borderRadius: '50%' }}>
                <ArrowUpRight size={24} />
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '5px solid var(--color-danger)' }}>
              <div>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', fontWeight: 600 }}>Total Despesas</p>
                <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0', color: 'var(--color-danger)' }}>
                  R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: '50%' }}>
                <ArrowDownRight size={24} />
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: `5px solid ${saldo >= 0 ? 'var(--color-secondary)' : 'var(--color-danger)'}` }}>
              <div>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', fontWeight: 600 }}>Saldo Atual</p>
                <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0', color: saldo >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                  R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div style={{ background: 'rgba(82, 183, 136, 0.1)', color: 'var(--color-primary)', padding: '0.75rem', borderRadius: '50%' }}>
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
            {/* Form */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={20} style={{ color: 'var(--color-secondary)' }} />
                Nova Transação
              </h3>

              {showFinAlert && (
                <div className="alert-success" style={{ padding: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Transação salva com sucesso!
                </div>
              )}

              <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>Tipo *</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input type="radio" name="tipo" checked={finType === 'Receita'} onChange={() => setFinType('Receita')} />
                      Receita
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                      <input type="radio" name="tipo" checked={finType === 'Despesa'} onChange={() => setFinType('Despesa')} />
                      Despesa
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Categoria</label>
                  <select className="form-control" value={finCategory} onChange={(e) => setFinCategory(e.target.value)}>
                    <option value="Mudas">Mudas</option>
                    <option value="Sementes">Sementes</option>
                    <option value="Logística">Logística</option>
                    <option value="Consultoria">Consultoria</option>
                    <option value="Evento">Evento</option>
                    <option value="Doação">Doação</option>
                    <option value="Patrocínio">Patrocínio</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="0.00"
                    required
                    value={finValue}
                    onChange={(e) => setFinValue(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={finDate}
                    onChange={(e) => setFinDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Descrição *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Descrição da transação"
                    required
                    value={finDescription}
                    onChange={(e) => setFinDescription(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={finStatus} onChange={(e) => setFinStatus(e.target.value)}>
                    <option value="Pago">Pago / Recebido</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  Lançar Transação
                </button>
              </form>
            </div>

            {/* List */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Histórico de Lançamentos</h3>
                
                {/* Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Pesquisar..."
                      style={{ paddingLeft: '2.25rem', width: '160px', height: '38px', fontSize: '0.85rem' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="form-control"
                    style={{ width: '100px', height: '38px', fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="Todos">Tipos</option>
                    <option value="Receita">Receitas</option>
                    <option value="Despesa">Despesas</option>
                  </select>

                  <select
                    className="form-control"
                    style={{ width: '110px', height: '38px', fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="Todos">Categorias</option>
                    <option value="Mudas">Mudas</option>
                    <option value="Sementes">Sementes</option>
                    <option value="Logística">Logística</option>
                    <option value="Consultoria">Consultoria</option>
                    <option value="Evento">Evento</option>
                    <option value="Doação">Doação</option>
                    <option value="Patrocínio">Patrocínio</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                  Nenhuma transação encontrada.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="form-control" style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Data</th>
                        <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Descrição</th>
                        <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Categoria</th>
                        <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)', textAlign: 'right' }}>Valor</th>
                        <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)', textAlign: 'center' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>
                            {new Date(tx.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              {tx.tipo === 'Receita' ? (
                                <ArrowUpRight size={14} style={{ color: 'var(--color-success)' }} />
                              ) : (
                                <ArrowDownRight size={14} style={{ color: 'var(--color-danger)' }} />
                              )}
                              <span>{tx.descricao}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>
                            <span style={{ 
                              padding: '0.2rem 0.4rem', 
                              borderRadius: 'var(--radius-sm)', 
                              fontSize: '0.75rem', 
                              fontWeight: 600,
                              background: 'rgba(82, 183, 136, 0.12)', 
                              color: 'var(--color-primary-light)' 
                            }}>
                              {tx.categoria}
                            </span>
                          </td>
                          <td style={{ 
                            padding: '0.75rem 0.5rem', 
                            fontSize: '0.85rem', 
                            fontWeight: 600,
                            textAlign: 'right',
                            color: tx.tipo === 'Receita' ? 'var(--color-success)' : 'var(--color-danger)' 
                          }}>
                            {tx.tipo === 'Receita' ? '+' : '-'} R$ {tx.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteTx(tx.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.25rem', borderColor: 'transparent', color: 'var(--color-danger)' }}
                              title="Excluir Transação"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'eventos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
          {/* Form Eventos */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} style={{ color: 'var(--color-secondary)' }} />
              Novo Evento
            </h3>

            {showEvAlert && (
              <div className="alert-success" style={{ padding: '0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Evento e custos registrados!
              </div>
            )}

            <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Título do Evento *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: I Oficina de Farinhas"
                  required
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tipo de Evento</label>
                <select className="form-control" value={evType} onChange={(e) => setEvType(e.target.value)}>
                  <option value="Oficina">Oficina / Capacitação</option>
                  <option value="Dia de Campo">Dia de Campo</option>
                  <option value="Reunião Técnica">Reunião Técnica</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={evDate}
                    onChange={(e) => setEvDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hora</label>
                  <input
                    type="time"
                    className="form-control"
                    value={evTime}
                    onChange={(e) => setEvTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Localização *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Sítio Poço Verde"
                  required
                  value={evLocation}
                  onChange={(e) => setEvLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Número de Participantes Previsto</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ex: 30"
                  value={evParticipants}
                  onChange={(e) => setEvParticipants(e.target.value)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Custo Estimado (R$)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0.00"
                  value={evCost}
                  onChange={(e) => setEvCost(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                  Se preenchido, lançará automaticamente uma despesa.
                </span>
              </div>

              <div className="form-group">
                <label>Descrição detalhada</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                  placeholder="Escreva breve resumo do evento..."
                  value={evDescription}
                  onChange={(e) => setEvDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Salvar Evento
              </button>
            </form>
          </div>

          {/* List Eventos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
              Eventos Cadastrados ({events.length})
            </h3>
            
            {events.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                Nenhum evento registrado até o momento.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {events.map((ev) => (
                  <div key={ev.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                      title="Excluir Evento"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        background: 'var(--color-primary)', 
                        color: 'white' 
                      }}>
                        {ev.tipo.toUpperCase()}
                      </span>
                      {ev.custo > 0 && (
                        <span style={{ 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: 'var(--radius-sm)', 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          background: 'rgba(217, 119, 6, 0.15)', 
                          color: 'var(--color-accent)' 
                        }}>
                          CUSTO: R$ {ev.custo.toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', color: 'var(--color-primary)' }}>
                        {ev.titulo}
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', lineHeight: '1.4' }}>
                        {ev.descricao}
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} style={{ color: 'var(--color-secondary)' }} />
                        <span>{new Date(ev.data + 'T00:00:00').toLocaleDateString('pt-BR')} às {ev.hora}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} style={{ color: 'var(--color-secondary)' }} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={ev.local}>
                          {ev.local}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Users size={14} style={{ color: 'var(--color-secondary)' }} />
                        <span>{ev.participantes} participantes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
