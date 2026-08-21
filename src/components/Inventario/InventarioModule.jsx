import React, { useState } from 'react';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  Filter,
  ClipboardList,
  MapPin,
  Tag,
  Hash,
  FileText,
  ChevronDown,
} from 'lucide-react';

const CATEGORIAS = [
  'Todas',
  'Ferramentas',
  'Sementes',
  'Mudas',
  'Equipamentos',
  'Insumos',
  'Materiais de Escritório',
  'Veículos',
  'Outros',
];

const UNIDADES = ['un', 'kg', 'g', 'L', 'mL', 'cx', 'pct', 'rolo', 'm', 'par'];

const dadosIniciais = [
  {
    id: 1,
    nome: 'Enxada',
    categoria: 'Ferramentas',
    quantidade: 12,
    unidade: 'un',
    localizacao: 'Galpão A',
    observacoes: 'Bom estado de conservação',
  },
  {
    id: 2,
    nome: 'Sementes de Milho Biofortificado',
    categoria: 'Sementes',
    quantidade: 50,
    unidade: 'kg',
    localizacao: 'Almoxarifado',
    observacoes: 'Variedade BRS Caatingueiro',
  },
  {
    id: 3,
    nome: 'Mudas de Mandioca',
    categoria: 'Mudas',
    quantidade: 200,
    unidade: 'un',
    localizacao: 'Viveiro',
    observacoes: 'Prontas para plantio',
  },
  {
    id: 4,
    nome: 'Pulverizador Manual',
    categoria: 'Equipamentos',
    quantidade: 5,
    unidade: 'un',
    localizacao: 'Galpão B',
    observacoes: 'Capacidade 5L cada',
  },
];

const emptyForm = {
  nome: '',
  categoria: 'Ferramentas',
  quantidade: '',
  unidade: 'un',
  localizacao: '',
  observacoes: '',
};

export default function InventarioModule() {
  const [itens, setItens] = useState(dadosIniciais);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filtered items
  const filteredItens = itens.filter((item) => {
    const matchBusca =
      item.nome.toLowerCase().includes(busca.toLowerCase()) ||
      item.localizacao.toLowerCase().includes(busca.toLowerCase()) ||
      item.observacoes.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria =
      filtroCategoria === 'Todas' || item.categoria === filtroCategoria;
    return matchBusca && matchCategoria;
  });

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({ ...item });
    setEditingId(item.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.nome.trim() || !form.quantidade) return;

    if (editingId !== null) {
      setItens((prev) =>
        prev.map((item) =>
          item.id === editingId ? { ...form, id: editingId } : item
        )
      );
      showSuccess('Item atualizado com sucesso!');
    } else {
      const newId = Date.now();
      setItens((prev) => [...prev, { ...form, id: newId }]);
      showSuccess('Item adicionado ao inventário!');
    }

    closeModal();
  };

  const handleDelete = (id) => {
    setItens((prev) => prev.filter((item) => item.id !== id));
    setDeleteId(null);
    showSuccess('Item removido do inventário.');
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getCategoryColor = (categoria) => {
    const colors = {
      Ferramentas: { bg: 'rgba(217, 119, 6, 0.12)', color: '#b45309' },
      Sementes: { bg: 'rgba(16, 185, 129, 0.12)', color: '#065f46' },
      Mudas: { bg: 'rgba(52, 211, 153, 0.12)', color: '#047857' },
      Equipamentos: { bg: 'rgba(99, 102, 241, 0.12)', color: '#4338ca' },
      Insumos: { bg: 'rgba(239, 68, 68, 0.12)', color: '#b91c1c' },
      'Materiais de Escritório': {
        bg: 'rgba(107, 114, 128, 0.12)',
        color: '#374151',
      },
      Veículos: { bg: 'rgba(59, 130, 246, 0.12)', color: '#1d4ed8' },
      Outros: { bg: 'rgba(156, 163, 175, 0.12)', color: '#6b7280' },
    };
    return colors[categoria] || { bg: 'rgba(82,183,136,0.12)', color: '#2d6a4f' };
  };

  const totalItens = itens.length;
  const totalQuantidade = itens.reduce(
    (acc, i) => acc + Number(i.quantidade || 0),
    0
  );
  const totalCategorias = new Set(itens.map((i) => i.categoria)).size;

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Header */}
      <div className="nav-header-section">
        <div>
          <h1
            style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <Package size={32} style={{ color: 'var(--color-secondary)' }} />
            Inventário
          </h1>
          <p style={{ color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
            Gerencie os materiais, equipamentos e insumos do projeto
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={18} />
          Adicionar Item
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="alert-success" style={{ marginBottom: '1.5rem' }}>
          <Check size={20} />
          {successMsg}
        </div>
      )}

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {totalItens}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
            Tipos de Itens
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--color-secondary)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {totalQuantidade}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
            Quantidade Total
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {totalCategorias}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
            Categorias
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="Buscar itens..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Category filter */}
          <div style={{ position: 'relative', minWidth: '200px' }}>
            <Filter
              size={16}
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
            />
            <select
              className="form-control"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              style={{ paddingLeft: '2.5rem', appearance: 'none' }}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{
                position: 'absolute',
                right: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
            />
          </div>

          <div
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {filteredItens.length} de {itens.length} item(s)
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredItens.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--color-text-muted)',
            }}
          >
            <Package size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
            <p style={{ fontSize: '1rem' }}>Nenhum item encontrado.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Tente ajustar os filtros ou adicione um novo item.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ margin: 0, border: 'none' }}>
            <table className="excel-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ClipboardList size={14} /> Item
                    </span>
                  </th>
                  <th>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Tag size={14} /> Categoria
                    </span>
                  </th>
                  <th>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Hash size={14} /> Qtd.
                    </span>
                  </th>
                  <th>Unidade</th>
                  <th>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} /> Localização
                    </span>
                  </th>
                  <th>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={14} /> Observações
                    </span>
                  </th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItens.map((item) => {
                  const catColor = getCategoryColor(item.categoria);
                  return (
                    <tr key={item.id}>
                      <td
                        style={{
                          paddingLeft: '1.5rem',
                          fontWeight: 600,
                          color: 'var(--color-text-main)',
                        }}
                      >
                        {item.nome}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: catColor.bg,
                            color: catColor.color,
                          }}
                        >
                          {item.categoria}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            color: 'var(--color-primary)',
                          }}
                        >
                          {item.quantidade}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
                        {item.unidade}
                      </td>
                      <td style={{ color: 'var(--color-text-light)' }}>
                        {item.localizacao || '—'}
                      </td>
                      <td
                        style={{
                          color: 'var(--color-text-muted)',
                          fontSize: '0.85rem',
                          maxWidth: '220px',
                        }}
                      >
                        <span
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.observacoes || '—'}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <button
                            className="inv-action-btn inv-edit"
                            onClick={() => openEdit(item)}
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="inv-action-btn inv-delete"
                            onClick={() => setDeleteId(item.id)}
                            title="Remover"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========== MODAL FORM ========== */}
      {showModal && (
        <div className="inv-modal-overlay" onClick={closeModal}>
          <div
            className="inv-modal glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inv-modal-header">
              <h2 style={{ fontSize: '1.4rem' }}>
                {editingId !== null ? 'Editar Item' : 'Adicionar Item ao Inventário'}
              </h2>
              <button className="inv-close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Nome */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Nome do Item *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Enxada, Sementes de Feijão..."
                  value={form.nome}
                  onChange={(e) => handleFormChange('nome', e.target.value)}
                />
              </div>

              {/* Categoria + Quantidade + Unidade */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Categoria *</label>
                  <select
                    className="form-control"
                    value={form.categoria}
                    onChange={(e) => handleFormChange('categoria', e.target.value)}
                  >
                    {CATEGORIAS.filter((c) => c !== 'Todas').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Quantidade *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    min="0"
                    value={form.quantidade}
                    onChange={(e) => handleFormChange('quantidade', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Unidade</label>
                  <select
                    className="form-control"
                    value={form.unidade}
                    onChange={(e) => handleFormChange('unidade', e.target.value)}
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Localização */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Localização</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Galpão A, Almoxarifado, Viveiro..."
                  value={form.localizacao}
                  onChange={(e) => handleFormChange('localizacao', e.target.value)}
                />
              </div>

              {/* Observações */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Observações</label>
                <textarea
                  className="form-control"
                  placeholder="Informações adicionais sobre o item..."
                  value={form.observacoes}
                  onChange={(e) => handleFormChange('observacoes', e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!form.nome.trim() || !form.quantidade}
                >
                  <Check size={18} />
                  {editingId !== null ? 'Salvar Alterações' : 'Adicionar ao Inventário'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== DELETE CONFIRM ========== */}
      {deleteId !== null && (
        <div className="inv-modal-overlay" onClick={() => setDeleteId(null)}>
          <div
            className="inv-modal glass-card"
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <Trash2 size={28} style={{ color: 'var(--color-danger)' }} />
              </div>
              <h2 style={{ marginBottom: '0.5rem' }}>Confirmar Remoção</h2>
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
                Tem certeza que deseja remover este item do inventário? Esta ação não pode ser desfeita.
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                }}
              >
                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteId)}
                >
                  <Trash2 size={16} />
                  Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
