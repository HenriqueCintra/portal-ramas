import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Gift, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Info,
  Database
} from 'lucide-react';
import { getEntities } from '../../utils/storage';
import ConfigBancoPanel from './ConfigBancoPanel';

export default function DashboardModule() {
  const [activeMainTab, setActiveMainTab] = useState('analytics');
  const [isLoading, setIsLoading] = useState(true);

  const [produtores, setProdutores] = useState([]);
  const [associacoes, setAssociacoes] = useState([]);
  const [prefeituras, setPrefeituras] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [instituicoes, setInstituicoes] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [doacoes, setDoacoes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [events, setEvents] = useState([]);

  // Data Explorer state
  const [explorerTab, setExplorerTab] = useState('produtores');
  const [explorerSearch, setExplorerSearch] = useState('');
  const [explorerFilter, setExplorerFilter] = useState('Todos');

  // Chart Tooltips state
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });

  // Refs for chart downloading
  const chartFinanceRef = useRef(null);
  const chartDonationRef = useRef(null);
  const chartEntityRef = useRef(null);
  const chartEventRef = useRef(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [
        prodList,
        assocList,
        prefList,
        escList,
        instList,
        parcList,
        doacList,
        txList,
        evList
      ] = await Promise.all([
        getEntities('produtor'),
        getEntities('associacao'),
        getEntities('prefeitura'),
        getEntities('escola'),
        getEntities('instituicao'),
        getEntities('parceiro'),
        getEntities('doacoes'),
        getEntities('financeiro'),
        getEntities('eventos')
      ]);

      setProdutores(prodList);
      setAssociacoes(assocList);
      setPrefeituras(prefList);
      setEscolas(escList);
      setInstituicoes(instList);
      setParceiros(parcList);
      setDoacoes(doacList);
      setTransactions(txList);
      setEvents(evList);
    } catch (e) {
      console.error("Erro ao carregar dados no painel:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const handleUpdate = () => loadAllData();
    window.addEventListener('database-updated', handleUpdate);
    return () => window.removeEventListener('database-updated', handleUpdate);
  }, []);

  // Aggregated Metrics
  const totalEntitiesCount = produtores.length + associacoes.length + prefeituras.length + escolas.length + instituicoes.length + parceiros.length;
  
  // Total mudas delivered (approx sum of parsed strings)
  const totalMudas = doacoes
    .filter(d => d.tipo === 'mudas')
    .reduce((sum, d) => {
      const num = parseInt(d.mudasQuantidade) || 0;
      return sum + num;
    }, 0);

  // Total food distributed in kg
  const totalAlimentosKg = doacoes
    .filter(d => d.tipo === 'alimentos')
    .reduce((sum, d) => {
      const num = parseFloat(d.alimentosQuantidade) || 0;
      return sum + num;
    }, 0);

  // Financial status
  const incomeTotal = transactions.filter(t => t.tipo === 'Receita').reduce((sum, t) => sum + (t.valor || 0), 0);
  const expenseTotal = transactions.filter(t => t.tipo === 'Despesa').reduce((sum, t) => sum + (t.valor || 0), 0);
  const financialBalance = incomeTotal - expenseTotal;

  // Chart 1: Financial Flux (grouped by month)
  // We'll extract last 6 months based on transaction dates
  const getMonthlyFinances = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData = {};

    // Grouping
    transactions.forEach(t => {
      if (!t.data) return;
      const date = new Date(t.data + 'T00:00:00');
      const monthIdx = date.getMonth();
      const monthLabel = months[monthIdx];
      
      if (!monthlyData[monthLabel]) {
        monthlyData[monthLabel] = { label: monthLabel, index: monthIdx, receita: 0, despesa: 0 };
      }
      if (t.tipo === 'Receita') monthlyData[monthLabel].receita += t.valor;
      else monthlyData[monthLabel].despesa += t.valor;
    });

    // Ensure at least the months where we have data are shown, sorted by calendar index
    return Object.values(monthlyData).sort((a, b) => a.index - b.index);
  };

  const monthlyFinances = getMonthlyFinances();

  // Chart 2: Top Donation Varieties (counts of donations)
  const getDonationVarietyCounts = () => {
    const varietyMap = {};
    doacoes.forEach(d => {
      const varName = d.tipo === 'mudas' ? d.mudasVariedade : d.alimentosVariedade;
      if (!varName) return;
      const cleanName = varName.split(' ')[0] + ' ' + (varName.split(' ')[1] || ''); // Keep first two words for readability
      varietyMap[cleanName] = (varietyMap[cleanName] || 0) + 1;
    });
    return Object.entries(varietyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
  };

  const donationVarieties = getDonationVarietyCounts();

  // Chart 3: Entity Type Distribution
  const entityDistribution = [
    { type: 'Produtor', count: produtores.length, color: '#1b4332' },
    { type: 'Associação', count: associacoes.length, color: '#2d6a4f' },
    { type: 'Prefeitura', count: prefeituras.length, color: '#52b788' },
    { type: 'Escola', count: escolas.length, color: '#74c69d' },
    { type: 'Instituição', count: instituicoes.length, color: '#95d5b2' },
    { type: 'Parceiro', count: parceiros.length, color: '#d97706' }
  ];

  // Chart 4: Events Attendance over time
  const getEventsAttendance = () => {
    return events
      .map(ev => ({
        label: ev.titulo.substring(0, 15) + '...',
        fullTitle: ev.titulo,
        count: ev.participantes || 0,
        date: ev.data
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const eventAttendance = getEventsAttendance();

  // Download Chart Functions
  const triggerDownload = (fileName, dataUrl) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSVG = (ref, name) => {
    if (!ref.current) return;
    const svgEl = ref.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    triggerDownload(`${name}.svg`, dataUrl);
  };

  const downloadPNG = (ref, name) => {
    if (!ref.current) return;
    const svgEl = ref.current;
    const svgString = new XMLSerializer().serializeToString(svgEl);
    
    const svgSize = svgEl.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = svgSize.width * 2; // double scaling for crispness
    canvas.height = svgSize.height * 2;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff'; // white background
      ctx.fillRect(0, 0, svgSize.width, svgSize.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      const pngUrl = canvas.toDataURL('image/png');
      triggerDownload(`${name}.png`, pngUrl);
    };
    img.src = url;
  };

  // CSV Export Functions
  const getExplorerData = () => {
    switch (explorerTab) {
      case 'produtores':
        return produtores.map(p => ({
          Nome: p.nomeCompleto,
          CPF: p.cpf,
          Localização: p.localizacao,
          Culturas: p.culturasCultivadas,
          Renda: p.rendaMensal,
          Área: `${p.tamanhoArea} ha`
        }));
      case 'doacoes':
        return doacoes.map(d => ({
          Tipo: d.tipo === 'mudas' ? 'Muda/Semente' : 'Alimento',
          Variedade: d.tipo === 'mudas' ? d.mudasVariedade : d.alimentosVariedade,
          Quantidade: d.tipo === 'mudas' ? d.mudasQuantidade : d.alimentosQuantidade,
          Destino: d.tipo === 'mudas' ? d.mudasLocalDestino : d.alimentosLocalDestino,
          Responsável: d.tipo === 'mudas' ? d.mudasResponsavel : d.alimentosResponsavel,
          Data: d.dataRegistro
        }));
      case 'financas':
        return transactions.map(t => ({
          Tipo: t.tipo,
          Categoria: t.categoria,
          Valor: `R$ ${t.valor.toFixed(2)}`,
          Data: t.data,
          Descrição: t.descricao,
          Status: t.status
        }));
      case 'eventos':
        return events.map(e => ({
          Título: e.titulo,
          Tipo: e.tipo,
          Local: e.local,
          Data: e.data,
          Hora: e.hora,
          Participantes: e.participantes,
          Custo: `R$ ${e.custo.toFixed(2)}`
        }));
      default:
        return [];
    }
  };

  const exportCSV = () => {
    const data = getExplorerData();
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n'); // Add UTF-8 BOM for Excel compatibility
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    triggerDownload(`relatorio_${explorerTab}_export.csv`, url);
  };

  // Tab Filtering for tabular view
  const getFilteredExplorerRows = () => {
    const rows = getExplorerData();
    return rows.filter(row => {
      const values = Object.values(row).join(' ').toLowerCase();
      const matchesSearch = values.includes(explorerSearch.toLowerCase());
      
      if (explorerTab === 'doacoes' && explorerFilter !== 'Todos') {
        const typeMatch = explorerFilter === 'Mudas' ? row.Tipo === 'Muda/Semente' : row.Tipo === 'Alimento';
        return matchesSearch && typeMatch;
      }
      if (explorerTab === 'financas' && explorerFilter !== 'Todos') {
        return matchesSearch && row.Tipo === explorerFilter;
      }
      if (explorerTab === 'eventos' && explorerFilter !== 'Todos') {
        return matchesSearch && row.Tipo === explorerFilter;
      }
      return matchesSearch;
    });
  };

  const filteredExplorerRows = getFilteredExplorerRows();

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart3 size={36} style={{ color: 'var(--color-secondary)' }} />
          Dashboard & Relatórios Analíticos
        </h1>
        <p style={{ color: 'var(--color-text-light)' }}>
          Visualize dados estatísticos e monitore o impacto do projeto, com filtros e exportação de gráficos.
        </p>
      </div>

      {/* Abas de Navegação Principal */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveMainTab('analytics')}
          className="btn"
          style={{
            background: activeMainTab === 'analytics' ? 'var(--color-primary)' : 'transparent',
            color: activeMainTab === 'analytics' ? 'white' : 'var(--color-text-light)',
            boxShadow: activeMainTab === 'analytics' ? 'var(--glass-shadow)' : 'none',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem'
          }}
        >
          <BarChart3 size={18} />
          Painel de Indicadores
        </button>
        <button
          onClick={() => setActiveMainTab('config')}
          className="btn"
          style={{
            background: activeMainTab === 'config' ? 'var(--color-primary)' : 'transparent',
            color: activeMainTab === 'config' ? 'white' : 'var(--color-text-light)',
            boxShadow: activeMainTab === 'config' ? 'var(--glass-shadow)' : 'none',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem'
          }}
        >
          <Database size={18} />
          Conectar Banco Online
        </button>
      </div>

      {activeMainTab === 'analytics' ? (
        isLoading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <svg 
              className="spin-animation" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="var(--color-secondary)" 
              strokeWidth="3" 
              style={{ width: '48px', height: '48px', margin: '0 auto 1rem auto' }}
            >
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="16" />
            </svg>
            <p style={{ color: 'var(--color-text-light)' }}>Carregando informações...</p>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .spin-animation {
                animation: spin 1s linear infinite;
              }
            `}</style>
          </div>
        ) : (
          <div>
            {/* Metric Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(27, 67, 50, 0.08)', color: 'var(--color-primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.75rem', color: 'var(--color-primary)' }}>{totalEntitiesCount}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Entidades Cadastradas</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(82, 183, 136, 0.08)', color: 'var(--color-secondary)' }}>
            <Gift size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.75rem', color: 'var(--color-primary)' }}>{totalMudas.toLocaleString('pt-BR')}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Mudas & Sementes (unid)</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(217, 119, 6, 0.08)', color: 'var(--color-accent)' }}>
            <Gift size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.75rem', color: 'var(--color-primary)' }}>{totalAlimentosKg.toLocaleString('pt-BR')} kg</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Alimentos Biofortificados</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-md)', 
            background: financialBalance >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', 
            color: financialBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' 
          }}>
            {financialBalance >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          </div>
          <div>
            <h4 style={{ fontSize: '1.75rem', color: financialBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              R$ {financialBalance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Saldo Financeiro</p>
          </div>
        </div>
      </div>

      {/* SVG Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        {/* Chart 1: Finance Flux */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Fluxo Financeiro Mensal (R$)
            </h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => downloadSVG(chartFinanceRef, 'fluxo_financeiro')} title="Baixar SVG">
                <Download size={14} /> SVG
              </button>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => downloadPNG(chartFinanceRef, 'fluxo_financeiro')} title="Baixar PNG">
                <Download size={14} /> PNG
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '260px' }}>
            {monthlyFinances.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-text-muted)' }}>Sem lançamentos financeiros.</div>
            ) : (
              <svg 
                id="chart-finance" 
                ref={chartFinanceRef} 
                viewBox="0 0 500 250" 
                style={{ width: '100%', height: '100%' }}
              >
                {/* Horizontal grid lines */}
                <line x1="40" y1="40" x2="480" y2="40" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="40" y1="90" x2="480" y2="90" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="40" y1="190" x2="480" y2="190" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
                
                {/* Base Axis */}
                <line x1="40" y1="200" x2="480" y2="200" stroke="var(--color-text-light)" strokeWidth="1.5" />
                
                {/* Y-Axis Label limits */}
                <text x="35" y="45" fill="var(--color-text-muted)" fontSize="9" textAnchor="end">15k</text>
                <text x="35" y="95" fill="var(--color-text-muted)" fontSize="9" textAnchor="end">10k</text>
                <text x="35" y="145" fill="var(--color-text-muted)" fontSize="9" textAnchor="end">5k</text>
                <text x="35" y="195" fill="var(--color-text-muted)" fontSize="9" textAnchor="end">0</text>

                {monthlyFinances.map((item, idx) => {
                  const x = 50 + idx * 70;
                  // Max range is 15000
                  const heightRec = Math.min((item.receita / 15000) * 150, 150);
                  const heightDes = Math.min((item.despesa / 15000) * 150, 150);
                  
                  return (
                    <g key={item.label}>
                      {/* Receitas (Green) */}
                      <rect 
                        x={x} 
                        y={200 - heightRec} 
                        width="20" 
                        height={heightRec} 
                        fill="var(--color-success)" 
                        rx="2"
                        onMouseEnter={(e) => setTooltip({ 
                          show: true, 
                          x: e.clientX, 
                          y: e.clientY - 40, 
                          content: `Receita (${item.label}): R$ ${item.receita.toLocaleString('pt-BR')}` 
                        })}
                        onMouseLeave={() => setTooltip(p => ({ ...p, show: false }))}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                      {/* Despesas (Red) */}
                      <rect 
                        x={x + 24} 
                        y={200 - heightDes} 
                        width="20" 
                        height={heightDes} 
                        fill="var(--color-danger)" 
                        rx="2"
                        onMouseEnter={(e) => setTooltip({ 
                          show: true, 
                          x: e.clientX, 
                          y: e.clientY - 40, 
                          content: `Despesa (${item.label}): R$ ${item.despesa.toLocaleString('pt-BR')}` 
                        })}
                        onMouseLeave={() => setTooltip(p => ({ ...p, show: false }))}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                      {/* Month label */}
                      <text x={x + 22} y="220" fill="var(--color-text-light)" fontSize="10" fontWeight="600" textAnchor="middle">{item.label}</text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--color-success)', borderRadius: '3px' }}></span>
              Receitas
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--color-danger)', borderRadius: '3px' }}></span>
              Despesas
            </span>
          </div>
        </div>

        {/* Chart 2: Top Varieties Donations */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Frequência de Variedades Doadas (Entregas)</h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => downloadSVG(chartDonationRef, 'variedades_doacoes')} title="Baixar SVG">
                <Download size={14} /> SVG
              </button>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => downloadPNG(chartDonationRef, 'variedades_doacoes')} title="Baixar PNG">
                <Download size={14} /> PNG
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '260px' }}>
            {donationVarieties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-text-muted)' }}>Sem doações cadastradas.</div>
            ) : (
              <svg 
                id="chart-donations" 
                ref={chartDonationRef} 
                viewBox="0 0 500 250" 
                style={{ width: '100%', height: '100%' }}
              >
                {donationVarieties.map((item, idx) => {
                  const y = 30 + idx * 40;
                  const maxVal = Math.max(...donationVarieties.map(v => v.count), 1);
                  const barWidth = (item.count / maxVal) * 320;
                  
                  return (
                    <g key={item.name}>
                      <text x="10" y={y + 16} fill="var(--color-text-main)" fontSize="10" fontWeight="600" textAnchor="start">
                        {item.name}
                      </text>
                      
                      {/* Background Bar */}
                      <rect x="130" y={y} width="320" height="22" fill="#e6f4ea" rx="4" />
                      
                      {/* Active Bar */}
                      <rect 
                        x="130" 
                        y={y} 
                        width={barWidth} 
                        height="22" 
                        fill="var(--color-primary-light)" 
                        rx="4"
                        onMouseEnter={(e) => setTooltip({ 
                          show: true, 
                          x: e.clientX, 
                          y: e.clientY - 40, 
                          content: `${item.name}: ${item.count} distribuições` 
                        })}
                        onMouseLeave={() => setTooltip(p => ({ ...p, show: false }))}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                      
                      {/* Value label */}
                      <text x={135 + barWidth} y={y + 15} fill="var(--color-primary)" fontSize="10" fontWeight="700">
                        {item.count}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Chart 3: Entity Type Distribution */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Proporção de Entidades Cadastradas</h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => downloadSVG(chartEntityRef, 'entidades_proporcao')} title="Baixar SVG">
                <Download size={14} /> SVG
              </button>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => downloadPNG(chartEntityRef, 'entidades_proporcao')} title="Baixar PNG">
                <Download size={14} /> PNG
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', alignItems: 'center', height: '260px' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <svg 
                id="chart-entity" 
                ref={chartEntityRef} 
                viewBox="0 0 200 200" 
                style={{ width: '100%', height: '100%' }}
              >
                {/* SVG Donut Chart */}
                {(() => {
                  let accumulatedPercent = 0;
                  const totalCount = entityDistribution.reduce((sum, d) => sum + d.count, 0);

                  if (totalCount === 0) {
                    return <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-border)" strokeWidth="30" />;
                  }

                  return entityDistribution.map((item) => {
                    if (item.count === 0) return null;
                    const percent = item.count / totalCount;
                    const strokeDash = percent * 439.8; // circumference for R=70 (2 * pi * 70 = 439.8)
                    const strokeOffset = 439.8 - (accumulatedPercent * 439.8);
                    accumulatedPercent += percent;

                    return (
                      <circle
                        key={item.type}
                        cx="100"
                        cy="100"
                        r="70"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="30"
                        strokeDasharray={`${strokeDash} 439.8`}
                        strokeDashoffset={strokeOffset}
                        transform="rotate(-90 100 100)"
                        onMouseEnter={(e) => setTooltip({ 
                          show: true, 
                          x: e.clientX, 
                          y: e.clientY - 40, 
                          content: `${item.type}: ${item.count} (${(percent * 100).toFixed(0)}%)` 
                        })}
                        onMouseLeave={() => setTooltip(p => ({ ...p, show: false }))}
                        style={{ cursor: 'pointer', transition: 'stroke-width 0.2s', strokeWidth: '30' }}
                      />
                    );
                  });
                })()}
                
                {/* Central text */}
                <circle cx="100" cy="100" r="50" fill="white" />
                <text x="100" y="95" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontWeight="600">TOTAL</text>
                <text x="100" y="115" textAnchor="middle" fill="var(--color-primary)" fontSize="18" fontWeight="800">
                  {entityDistribution.reduce((sum, d) => sum + d.count, 0)}
                </text>
              </svg>
            </div>

            {/* Donut Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {entityDistribution.map((item) => (
                <div key={item.type} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', background: item.color, borderRadius: '3px' }}></span>
                  <span style={{ fontWeight: 600 }}>{item.type}:</span>
                  <span style={{ color: 'var(--color-text-light)' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Events Attendance Line Chart */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Adesão e Presença nos Eventos</h3>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => downloadSVG(chartEventRef, 'adesao_eventos')} title="Baixar SVG">
                <Download size={14} /> SVG
              </button>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }} onClick={() => downloadPNG(chartEventRef, 'adesao_eventos')} title="Baixar PNG">
                <Download size={14} /> PNG
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '260px' }}>
            {eventAttendance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-text-muted)' }}>Sem eventos cadastrados.</div>
            ) : (
              <svg 
                id="chart-event" 
                ref={chartEventRef} 
                viewBox="0 0 500 250" 
                style={{ width: '100%', height: '100%' }}
              >
                {/* Grid lines */}
                <line x1="50" y1="40" x2="450" y2="40" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="50" y1="90" x2="450" y2="90" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="50" y1="140" x2="450" y2="140" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="50" y1="190" x2="450" y2="190" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 4" />
                
                <line x1="50" y1="200" x2="450" y2="200" stroke="var(--color-text-light)" strokeWidth="1.5" />
                
                <text x="45" y="45" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">100</text>
                <text x="45" y="95" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">75</text>
                <text x="45" y="145" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">50</text>
                <text x="45" y="195" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">25</text>

                {/* Plotting Line */}
                {(() => {
                  const points = eventAttendance.map((item, idx) => {
                    const step = 400 / Math.max(eventAttendance.length - 1, 1);
                    const x = 50 + idx * step;
                    const y = 200 - (item.count / 100) * 160; // scale max 100 participants
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <polyline
                      fill="none"
                      stroke="var(--color-primary-light)"
                      strokeWidth="3"
                      points={points}
                    />
                  );
                })()}

                {/* Render Dots */}
                {eventAttendance.map((item, idx) => {
                  const step = 400 / Math.max(eventAttendance.length - 1, 1);
                  const x = 50 + idx * step;
                  const y = 200 - (item.count / 100) * 160;
                  
                  return (
                    <g key={item.label}>
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        fill="white"
                        stroke="var(--color-primary)"
                        strokeWidth="3"
                        onMouseEnter={(e) => setTooltip({ 
                          show: true, 
                          x: e.clientX, 
                          y: e.clientY - 40, 
                          content: `${item.fullTitle}: ${item.count} participantes` 
                        })}
                        onMouseLeave={() => setTooltip(p => ({ ...p, show: false }))}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      />
                      <text x={x} y="220" fill="var(--color-text-light)" fontSize="8" fontWeight="600" textAnchor="middle">
                        {new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

      </div>

      {/* Data Explorer section */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Navegador de Dados Cadastrados</h2>
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Navegue, pesquise e exporte relatórios consolidados em formato de planilhas CSV.</p>
          </div>

          <button className="btn btn-accent" onClick={exportCSV} style={{ display: 'flex', gap: '0.5rem' }}>
            <FileSpreadsheet size={18} />
            Exportar Tabela para CSV
          </button>
        </div>

        {/* Explorer Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
          {['produtores', 'doacoes', 'financas', 'eventos'].map(tab => (
            <button
              key={tab}
              className="btn btn-sm"
              onClick={() => {
                setExplorerTab(tab);
                setExplorerSearch('');
                setExplorerFilter('Todos');
              }}
              style={{
                background: explorerTab === tab ? 'var(--color-primary)' : 'transparent',
                color: explorerTab === tab ? 'white' : 'var(--color-text-light)',
                border: explorerTab === tab ? 'none' : '1px solid transparent',
                fontWeight: 600
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search Bar & Inner filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Pesquisar nos dados carregados..."
              style={{ paddingLeft: '2.5rem' }}
              value={explorerSearch}
              onChange={(e) => setExplorerSearch(e.target.value)}
            />
          </div>

          {explorerTab === 'doacoes' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} style={{ color: 'var(--color-text-light)' }} />
              <select className="form-control" style={{ width: '160px', height: '42px' }} value={explorerFilter} onChange={e => setExplorerFilter(e.target.value)}>
                <option value="Todos">Todas Doações</option>
                <option value="Mudas">Mudas & Sementes</option>
                <option value="Alimentos">Alimentos</option>
              </select>
            </div>
          )}

          {explorerTab === 'financas' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} style={{ color: 'var(--color-text-light)' }} />
              <select className="form-control" style={{ width: '160px', height: '42px' }} value={explorerFilter} onChange={e => setExplorerFilter(e.target.value)}>
                <option value="Todos">Fluxos</option>
                <option value="Receita">Receitas</option>
                <option value="Despesa">Despesas</option>
              </select>
            </div>
          )}

          {explorerTab === 'eventos' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} style={{ color: 'var(--color-text-light)' }} />
              <select className="form-control" style={{ width: '160px', height: '42px' }} value={explorerFilter} onChange={e => setExplorerFilter(e.target.value)}>
                <option value="Todos">Todos Eventos</option>
                <option value="Oficina">Oficinas</option>
                <option value="Dia de Campo">Dias de Campo</option>
                <option value="Reunião Técnica">Reunião Técnica</option>
              </select>
            </div>
          )}
        </div>

        {/* Data Table */}
        {filteredExplorerRows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
            Nenhum registro corresponde aos filtros selecionados.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="form-control" style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                  {Object.keys(filteredExplorerRows[0]).map(key => (
                    <th key={key} style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredExplorerRows.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {Object.values(row).map((val, cellIdx) => (
                      <td key={cellIdx} style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
          </div>
        )
      ) : (
        <ConfigBancoPanel />
      )}

      {/* Floating Interactive Tooltip */}
      {tooltip.show && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 15,
          top: tooltip.y,
          background: 'rgba(27, 67, 50, 0.95)',
          color: '#ffffff',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          fontWeight: 600,
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <Info size={12} style={{ color: 'var(--color-secondary)' }} />
          <span>{tooltip.content}</span>
        </div>
      )}
    </div>
  );
}
