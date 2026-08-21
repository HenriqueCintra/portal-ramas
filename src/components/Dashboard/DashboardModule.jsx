import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Gift, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Info,
  Database,
  X,
  MapPin,
  Calendar,
  Landmark,
  Layers,
  Sparkles
} from 'lucide-react';
import { getEntities } from '../../utils/storage';
import ConfigBancoPanel from './ConfigBancoPanel';

export default function DashboardModule() {
  const [activeMainTab, setActiveMainTab] = useState('analytics');
  const [isLoading, setIsLoading] = useState(true);

  // Core datasets from storage
  const [produtores, setProdutores] = useState([]);
  const [associacoes, setAssociacoes] = useState([]);
  const [prefeituras, setPrefeituras] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [instituicoes, setInstituicoes] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [doacoes, setDoacoes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [events, setEvents] = useState([]);

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Cross-filtering states
  const [filters, setFilters] = useState({
    cidade: null,
    estado: null,
    regiao: null,
    sexo: null,
    faixaEtaria: null,
    tipoDoacao: null, // 'mudas' or 'alimentos'
    categoriaFinanca: null,
    tipoFinanca: null, // 'Receita' or 'Despesa'
    tipoEvento: null
  });

  // Current active sub-dimension for geographic chart
  const [geoDimension, setGeoDimension] = useState('cidade'); // 'cidade', 'estado', 'regiao'

  // Data Explorer state
  const [explorerTab, setExplorerTab] = useState('produtores');
  const [explorerSearch, setExplorerSearch] = useState('');

  // Chart Tooltips state
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });

  // Refs for chart downloading
  const chartFinanceRef = useRef(null);
  const chartDonationRef = useRef(null);
  const chartGeoRef = useRef(null);
  const chartDemogSexRef = useRef(null);

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
      console.error("Erro ao carregar dados no painel analítico:", e);
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

  // --- LOCATION AND AGE HELPERS ---
  const parseLocation = (locString) => {
    if (!locString) return { city: 'Não Informado', state: 'Não Informado', region: 'Não Informado' };
    const str = locString.toLowerCase().trim();
    let city = 'Outros';
    let state = 'PE';

    if (str.includes('buíque') || str.includes('buique')) {
      city = 'Buíque';
    } else if (str.includes('arcoverde')) {
      city = 'Arcoverde';
    } else if (str.includes('recife')) {
      city = 'Recife';
    } else if (str.includes('serra talhada')) {
      city = 'Serra Talhada';
    } else {
      // Basic split
      const parts = locString.split(/[,-]/);
      if (parts.length > 1) {
        city = parts[parts.length - 2].trim();
      } else {
        city = parts[0].trim();
      }
      city = city.charAt(0).toUpperCase() + city.slice(1);
    }

    const stateMatch = locString.match(/\b([A-Z]{2})\b/);
    if (stateMatch) {
      state = stateMatch[1];
    } else if (str.includes('pernambuco')) {
      state = 'PE';
    }

    const regionMap = {
      'PE': 'Nordeste', 'PB': 'Nordeste', 'CE': 'Nordeste', 'RN': 'Nordeste', 'AL': 'Nordeste', 'SE': 'Nordeste', 'BA': 'Nordeste', 'PI': 'Nordeste', 'MA': 'Nordeste',
      'SP': 'Sudeste', 'RJ': 'Sudeste', 'MG': 'Sudeste', 'ES': 'Sudeste',
      'PR': 'Sul', 'SC': 'Sul', 'RS': 'Sul',
      'MS': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'DF': 'Centro-Oeste',
      'AM': 'Norte', 'PA': 'Norte', 'AC': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'AP': 'Norte', 'TO': 'Norte'
    };
    const region = regionMap[state] || 'Nordeste';

    return { city, state, region };
  };

  const getFaixaEtaria = (idade) => {
    if (idade === undefined || idade === null || idade === '') return 'Não informado';
    const val = parseInt(idade);
    if (isNaN(val)) return 'Não informado';
    if (val <= 29) return 'Até 29 anos';
    if (val <= 49) return '30 a 49 anos';
    if (val <= 69) return '50 a 69 anos';
    return '70 anos ou mais';
  };

  // --- CROSS-FILTERING & SEARCH INTEGRATION ---
  const handleToggleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      cidade: null,
      estado: null,
      regiao: null,
      sexo: null,
      faixaEtaria: null,
      tipoDoacao: null,
      categoriaFinanca: null,
      tipoFinanca: null,
      tipoEvento: null
    });
    setSearchQuery('');
  };

  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: null }));
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== null) || searchQuery !== '';

  // Match search query against object values
  const recordMatchesSearch = (record, search) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const checkValue = (val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'object') {
        return Object.values(val).some(child => checkValue(child));
      }
      return String(val).toLowerCase().includes(q);
    };
    return Object.values(record).some(val => checkValue(val));
  };

  // Apply active cross-filters + search to Produtores
  const getFilteredProdutores = () => {
    return produtores.filter(p => {
      // 1. Search Query
      if (!recordMatchesSearch(p, searchQuery)) return false;

      // 2. Cross-filters
      const loc = parseLocation(p.localizacao);
      if (filters.cidade && loc.city !== filters.cidade) return false;
      if (filters.estado && loc.state !== filters.estado) return false;
      if (filters.regiao && loc.region !== filters.regiao) return false;
      if (filters.sexo && p.sexo !== filters.sexo) return false;
      if (filters.faixaEtaria && getFaixaEtaria(p.idade) !== filters.faixaEtaria) return false;

      return true;
    });
  };

  // Apply active cross-filters + search to Doacoes
  const getFilteredDoacoes = () => {
    return doacoes.filter(d => {
      if (!recordMatchesSearch(d, searchQuery)) return false;

      const locDest = parseLocation(d.tipo === 'mudas' ? d.mudasLocalDestino : d.alimentosLocalDestino);
      if (filters.cidade && locDest.city !== filters.cidade) return false;
      if (filters.estado && locDest.state !== filters.estado) return false;
      if (filters.regiao && locDest.region !== filters.regiao) return false;
      if (filters.tipoDoacao && d.tipo !== filters.tipoDoacao) return false;

      return true;
    });
  };

  // Apply active cross-filters + search to Financeiro
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      if (!recordMatchesSearch(t, searchQuery)) return false;

      if (filters.tipoFinanca && t.tipo !== filters.tipoFinanca) return false;
      if (filters.categoriaFinanca && t.categoria !== filters.categoriaFinanca) return false;

      return true;
    });
  };

  // Apply active cross-filters + search to Eventos
  const getFilteredEvents = () => {
    return events.filter(e => {
      if (!recordMatchesSearch(e, searchQuery)) return false;

      const loc = parseLocation(e.local);
      if (filters.cidade && loc.city !== filters.cidade) return false;
      if (filters.estado && loc.state !== filters.estado) return false;
      if (filters.regiao && loc.region !== filters.regiao) return false;
      if (filters.tipoEvento && e.tipo !== filters.tipoEvento) return false;

      return true;
    });
  };

  // Apply search/filters to other entities to update totals
  const getFilteredEntities = (list, locField = 'localizacao') => {
    return list.filter(item => {
      if (!recordMatchesSearch(item, searchQuery)) return false;
      
      const loc = parseLocation(item[locField] || item.local || item.localizacao);
      if (filters.cidade && loc.city !== filters.cidade) return false;
      if (filters.estado && loc.state !== filters.estado) return false;
      if (filters.regiao && loc.region !== filters.regiao) return false;
      
      return true;
    });
  };

  // Filtered lists
  const filteredProdutores = getFilteredProdutores();
  const filteredDoacoes = getFilteredDoacoes();
  const filteredTransactions = getFilteredTransactions();
  const filteredEvents = getFilteredEvents();
  const filteredAssociacoes = getFilteredEntities(associacoes, 'localizacao');
  const filteredPrefeituras = getFilteredEntities(prefeituras, 'local');
  const filteredEscolas = getFilteredEntities(escolas, 'local');
  const filteredInstituicoes = getFilteredEntities(instituicoes, 'local');
  const filteredParceiros = getFilteredEntities(parceiros, 'instituicao'); // parceiros filtered on search only generally

  // --- ANALYTICAL KPI METRICS ---
  const totalEntitiesCount = filteredProdutores.length + filteredAssociacoes.length + filteredPrefeituras.length + filteredEscolas.length + filteredInstituicoes.length + filteredParceiros.length;
  
  const totalMudas = filteredDoacoes
    .filter(d => d.tipo === 'mudas')
    .reduce((sum, d) => sum + (parseInt(d.mudasQuantidade) || 0), 0);

  const totalAlimentosKg = filteredDoacoes
    .filter(d => d.tipo === 'alimentos')
    .reduce((sum, d) => sum + (parseFloat(d.alimentosQuantidade) || 0), 0);

  const incomeTotal = filteredTransactions.filter(t => t.tipo === 'Receita').reduce((sum, t) => sum + (t.valor || 0), 0);
  const expenseTotal = filteredTransactions.filter(t => t.tipo === 'Despesa').reduce((sum, t) => sum + (t.valor || 0), 0);
  const financialBalance = incomeTotal - expenseTotal;

  // Average Age of Producers
  const producersWithAge = filteredProdutores.filter(p => p.idade && !isNaN(parseInt(p.idade)));
  const averageAge = producersWithAge.length > 0 
    ? (producersWithAge.reduce((sum, p) => sum + parseInt(p.idade), 0) / producersWithAge.length).toFixed(1) 
    : '0';

  // Average Area Cultivated
  const producersWithArea = filteredProdutores.filter(p => p.tamanhoArea && !isNaN(parseFloat(p.tamanhoArea)));
  const averageArea = producersWithArea.length > 0 
    ? (producersWithArea.reduce((sum, p) => sum + parseFloat(p.tamanhoArea), 0) / producersWithArea.length).toFixed(1) 
    : '0';

  // --- DATA GROUPING FOR CHARTS ---

  // 1. Geographic Distribution Data (by Cidade, Estado or Região)
  const getGeoDistribution = () => {
    const counts = {};
    const entities = [
      ...filteredProdutores.map(p => ({ ...p, type: 'produtor' })),
      ...filteredAssociacoes.map(a => ({ ...a, type: 'associacao' })),
      ...filteredEscolas.map(e => ({ ...e, type: 'escola' })),
      ...filteredPrefeituras.map(pr => ({ ...pr, type: 'prefeitura' }))
    ];

    entities.forEach(ent => {
      const loc = parseLocation(ent.localizacao || ent.local);
      let key = 'Não Informado';
      if (geoDimension === 'cidade') key = loc.city;
      else if (geoDimension === 'estado') key = loc.state;
      else if (geoDimension === 'regiao') key = loc.region;

      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  };

  const geoData = getGeoDistribution();
  const maxGeoValue = Math.max(...geoData.map(d => d.count), 1);

  // 2. Demographic Data: Gender (Rosca) & Age Range (Barras)
  const getGenderDistribution = () => {
    const genders = {};
    filteredProdutores.forEach(p => {
      const g = p.sexo || 'Não informado';
      genders[g] = (genders[g] || 0) + 1;
    });

    const colors = {
      'Masculino': '#2d6a4f',
      'Feminino': '#74c69d',
      'Outro': '#d97706',
      'Prefiro não informar': '#b45309',
      'Não informado': '#9ca3af'
    };

    return Object.entries(genders).map(([type, count]) => ({
      type,
      count,
      color: colors[type] || '#52b788'
    }));
  };

  const genderData = getGenderDistribution();

  const getAgeDistribution = () => {
    const ranges = {
      'Até 29 anos': 0,
      '30 a 49 anos': 0,
      '50 a 69 anos': 0,
      '70 anos ou mais': 0,
      'Não informado': 0
    };

    filteredProdutores.forEach(p => {
      const r = getFaixaEtaria(p.idade);
      ranges[r] = (ranges[r] || 0) + 1;
    });

    // Remove empty categories to keep chart clean, except if all are 0
    return Object.entries(ranges)
      .map(([label, count]) => ({ label, count }))
      .filter(item => item.count > 0 || item.label !== 'Não informado');
  };

  const ageData = getAgeDistribution();
  const maxAgeValue = Math.max(...ageData.map(d => d.count), 1);

  // 3. Financial evolution grouped by month
  const getMonthlyFinances = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData = {};

    filteredTransactions.forEach(t => {
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

    return Object.values(monthlyData).sort((a, b) => a.index - b.index);
  };

  const monthlyFinances = getMonthlyFinances();
  const maxFinValue = Math.max(...monthlyFinances.map(m => Math.max(m.receita, m.despesa)), 1000);

  const getRoundedMax = (val) => {
    if (val <= 1000) return 1000;
    if (val <= 5000) return 5000;
    if (val <= 10000) return 10000;
    if (val <= 20000) return 20000;
    if (val <= 50000) return 50000;
    return Math.ceil(val / 50000) * 50000;
  };
  
  const roundedMaxFin = getRoundedMax(maxFinValue);
  const formatFinanceLabel = (val) => val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val.toString();

  // 4. Donation Varieties Breakdown
  const getDonationVarietyCounts = () => {
    const varietyMap = {};
    filteredDoacoes.forEach(d => {
      const varName = d.tipo === 'mudas' ? d.mudasVariedade : d.alimentosVariedade;
      if (!varName) return;
      // Clean names for readability
      const cleanName = varName.split(' (')[0].split(' BRS')[0]; 
      varietyMap[cleanName] = (varietyMap[cleanName] || 0) + 1;
    });
    return Object.entries(varietyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
  };

  const donationVarieties = getDonationVarietyCounts();

  // 5. Rankings: Top Producers by Area
  const topProducersByArea = [...filteredProdutores]
    .filter(p => p.tamanhoArea && !isNaN(parseFloat(p.tamanhoArea)))
    .sort((a, b) => parseFloat(b.tamanhoArea) - parseFloat(a.tamanhoArea))
    .slice(0, 5);

  // --- DOWNLOAD CHART HELPERS ---
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
    canvas.width = svgSize.width * 2;
    canvas.height = svgSize.height * 2;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, svgSize.width, svgSize.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      const pngUrl = canvas.toDataURL('image/png');
      triggerDownload(`${name}.png`, pngUrl);
    };
    img.src = url;
  };

  // --- CSV DATA CONVERSION AND EXPORT ---
  const getExplorerData = () => {
    switch (explorerTab) {
      case 'produtores':
        return filteredProdutores.map(p => ({
          Nome: p.nomeCompleto,
          CPF: p.cpf,
          Gênero: p.sexo || 'Não informado',
          Idade: p.idade || 'Não informado',
          Escolaridade: p.escolaridade || 'Não informado',
          Localização: p.localizacao,
          CulturaPrincipal: p.atividadePrincipal,
          Culturas: p.culturasCultivadas,
          Renda: p.rendaMensal,
          'Área (ha)': p.tamanhoArea
        }));
      case 'doacoes':
        return filteredDoacoes.map(d => ({
          Tipo: d.tipo === 'mudas' ? 'Muda/Semente' : 'Alimento',
          Variedade: d.tipo === 'mudas' ? d.mudasVariedade : d.alimentosVariedade,
          Quantidade: d.tipo === 'mudas' ? d.mudasQuantidade : d.alimentosQuantidade,
          Destino: d.tipo === 'mudas' ? d.mudasLocalDestino : d.alimentosLocalDestino,
          Responsável: d.tipo === 'mudas' ? d.mudasResponsavel : d.alimentosResponsavel,
          Lote: d.mudasLote || 'N/A',
          Data: d.dataRegistro
        }));
      case 'financas':
        return filteredTransactions.map(t => ({
          Tipo: t.tipo,
          Categoria: t.categoria,
          Valor: `R$ ${t.valor.toFixed(2)}`,
          Data: t.data,
          Descrição: t.descricao,
          Status: t.status
        }));
      case 'eventos':
        return filteredEvents.map(e => ({
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
        const escaped = ('' + (row[header] ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    triggerDownload(`ramas_analise_${explorerTab}.csv`, url);
  };

  // Local table rows filtered again for sub-table matching
  const getFilteredExplorerRows = () => {
    const rows = getExplorerData();
    return rows.filter(row => {
      const values = Object.values(row).join(' ').toLowerCase();
      return values.includes(explorerSearch.toLowerCase());
    });
  };

  const filteredExplorerRows = getFilteredExplorerRows();

  return (
    <div>
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BarChart3 size={36} style={{ color: 'var(--color-secondary)' }} />
            Central de Análise de Dados
          </h1>
          <p style={{ color: 'var(--color-text-light)' }}>
            Monitore o impacto social, econômico e agrícola do portal de forma interativa com filtros dinâmicos cruzados.
          </p>
        </div>

        {/* Global Search Bar always visible */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Busca global rápida (ex: Mandioca, Buíque)..."
            style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-lg)', border: searchQuery ? '1.5px solid var(--color-secondary)' : '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* TABS NAVEGAÇÃO PRINCIPAL */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveMainTab('analytics')}
          className="btn"
          style={{
            background: activeMainTab === 'analytics' ? 'var(--color-primary)' : 'transparent',
            color: activeMainTab === 'analytics' ? 'white' : 'var(--color-text-light)',
            boxShadow: activeMainTab === 'analytics' ? 'var(--glass-shadow)' : 'none',
            borderRadius: 'var(--radius-md)',
            padding: '0.6rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
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
            padding: '0.6rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
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
            <p style={{ color: 'var(--color-text-light)' }}>Carregando dados consolidados...</p>
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
            {/* FILTROS ATIVOS BAR */}
            {hasActiveFilters && (
              <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', background: '#e6f4ea', border: '1px solid rgba(82, 183, 136, 0.4)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Filter size={14} /> Filtros Ativos:
                  </span>
                  
                  {searchQuery && (
                    <span style={{ background: 'white', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}>
                      Busca: "<strong>{searchQuery}</strong>"
                      <X size={12} style={{ cursor: 'pointer', color: 'var(--color-danger)' }} onClick={() => setSearchQuery('')} />
                    </span>
                  )}

                  {Object.entries(filters).map(([key, val]) => {
                    if (val === null) return null;
                    const displayLabel = key.charAt(0).toUpperCase() + key.slice(1);
                    return (
                      <span key={key} style={{ background: 'white', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}>
                        {displayLabel}: <strong>{val}</strong>
                        <X size={12} style={{ cursor: 'pointer', color: 'var(--color-danger)' }} onClick={() => removeFilter(key)} />
                      </span>
                    );
                  })}
                </div>
                
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={clearAllFilters}
                  style={{ background: 'white', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', fontSize: '0.8rem', padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                >
                  <X size={14} /> Limpar Todos Filtros
                </button>
              </div>
            )}

            {/* KEY METRICS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }} onClick={() => handleToggleFilter('sexo', null)}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(27, 67, 50, 0.08)', color: 'var(--color-primary)' }}>
                  <Users size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '0.1rem' }}>{totalEntitiesCount}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Entidades Cadastradas</p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleToggleFilter('tipoDoacao', 'mudas')}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(82, 183, 136, 0.08)', color: 'var(--color-secondary)' }}>
                  <Gift size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '0.1rem' }}>{totalMudas.toLocaleString('pt-BR')}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Mudas & Sementes (unid)</p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleToggleFilter('tipoDoacao', 'alimentos')}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(217, 119, 6, 0.08)', color: 'var(--color-accent)' }}>
                  <Gift size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '0.1rem' }}>{totalAlimentosKg.toLocaleString('pt-BR')} kg</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Alimentos Biofortificados</p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleToggleFilter('tipoFinanca', null)}>
                <div style={{ 
                  padding: '0.6rem', 
                  borderRadius: 'var(--radius-md)', 
                  background: financialBalance >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', 
                  color: financialBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' 
                }}>
                  {financialBalance >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.6rem', color: financialBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)', marginBottom: '0.1rem' }}>
                    R$ {financialBalance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Saldo Financeiro</p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleToggleFilter('faixaEtaria', null)}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(13, 148, 136, 0.08)', color: '#0d9488' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '0.1rem' }}>{averageAge} anos</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Média de Idade (Produtores)</p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'rgba(79, 70, 229, 0.08)', color: '#4f46e5' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '0.1rem' }}>{averageArea} ha</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Área Média de Cultivo</p>
                </div>
              </div>
            </div>

            {/* SVG CHARTS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              
              {/* CHART 1: GEOGRAPHIC DISTRIBUTION (INTERACTIVE CHANGER) */}
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'box-shadow 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <MapPin size={18} style={{ color: 'var(--color-secondary)' }} />
                      Distribuição Geográfica de Entidades
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Clique nas barras para aplicar filtros cruzados</span>
                  </div>
                  
                  {/* Dimension selector */}
                  <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--color-border)' }}>
                    {['cidade', 'estado', 'regiao'].map(dim => (
                      <button
                        key={dim}
                        onClick={() => setGeoDimension(dim)}
                        style={{
                          background: geoDimension === dim ? 'white' : 'transparent',
                          border: 'none',
                          boxShadow: geoDimension === dim ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                          color: geoDimension === dim ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {dim.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  
                  {/* Download */}
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} onClick={() => downloadSVG(chartGeoRef, 'distribuicao_geografica')} title="Baixar SVG">
                      SVG
                    </button>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} onClick={() => downloadPNG(chartGeoRef, 'distribuicao_geografica')} title="Baixar PNG">
                      PNG
                    </button>
                  </div>
                </div>

                <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                  {geoData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Nenhum dado geográfico disponível.</div>
                  ) : (
                    <svg 
                      ref={chartGeoRef} 
                      viewBox="0 0 500 220" 
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* Grid lines */}
                      <line x1="60" y1="30" x2="480" y2="30" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="60" y1="80" x2="480" y2="80" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="60" y1="130" x2="480" y2="130" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                      
                      {/* Base axis */}
                      <line x1="60" y1="180" x2="480" y2="180" stroke="var(--color-text-light)" strokeWidth="1" />
                      
                      {/* Y-axis Labels */}
                      <text x="50" y="33" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">{maxGeoValue}</text>
                      <text x="50" y="108" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">{(maxGeoValue / 2).toFixed(0)}</text>
                      <text x="50" y="183" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">0</text>

                      {/* Bars */}
                      {geoData.map((item, idx) => {
                        const step = Math.min(80, 400 / geoData.length);
                        const x = 75 + idx * step;
                        const barHeight = (item.count / maxGeoValue) * 150;
                        const y = 180 - barHeight;
                        const barWidth = Math.max(12, step - 12);
                        
                        // Check if active filter matches
                        const isFiltered = filters[geoDimension] === item.label;
                        const hasAnyGeoFilter = filters.cidade !== null || filters.estado !== null || filters.regiao !== null;
                        const barColor = isFiltered 
                          ? 'var(--color-accent)' 
                          : (hasAnyGeoFilter ? '#b5e2cb' : 'var(--color-primary-light)');

                        return (
                          <g key={item.label} style={{ cursor: 'pointer' }} onClick={() => handleToggleFilter(geoDimension, item.label)}>
                            <rect 
                              x={x} 
                              y={y} 
                              width={barWidth} 
                              height={barHeight} 
                              fill={barColor}
                              rx="3"
                              onMouseEnter={(e) => setTooltip({ 
                                show: true, 
                                x: e.clientX, 
                                y: e.clientY - 40, 
                                content: `${geoDimension.toUpperCase()}: ${item.label} (${item.count} entidades)` 
                              })}
                              onMouseLeave={() => setTooltip(p => ({ ...p, show: false }))}
                              style={{ transition: 'all 0.2s' }}
                            />
                            {/* X-axis Label rotated if necessary or cropped */}
                            <text 
                              x={x + barWidth / 2} 
                              y="195" 
                              fill="var(--color-text-light)" 
                              fontSize="9" 
                              fontWeight="600" 
                              textAnchor="middle"
                            >
                              {item.label.length > 10 ? item.label.substring(0, 8) + '..' : item.label}
                            </text>
                            
                            {/* Value label on top of bar */}
                            {item.count > 0 && (
                              <text x={x + barWidth / 2} y={y - 6} fill="var(--color-primary)" fontSize="8" fontWeight="700" textAnchor="middle">
                                {item.count}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>

              {/* CHART 2: DEMOGRAPHIC ANALYSIS - GENDER AND AGE RANGE */}
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <Sparkles size={18} style={{ color: 'var(--color-secondary)' }} />
                      Perfil Demográfico (Produtores)
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Filtre por Gênero (Rosca) e Faixa Etária (Barras)</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} onClick={() => downloadSVG(chartDemogSexRef, 'demografia_genero')} title="Baixar SVG">
                      SVG
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '1.5rem', alignItems: 'center', height: '220px' }}>
                  {/* Left: Donut chart for Sex */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                      <svg 
                        ref={chartDemogSexRef} 
                        viewBox="0 0 200 200" 
                        style={{ width: '100%', height: '100%' }}
                      >
                        {(() => {
                          let accumulatedPercent = 0;
                          const totalCount = genderData.reduce((sum, d) => sum + d.count, 0);

                          if (totalCount === 0) {
                            return <circle cx="100" cy="100" r="70" fill="none" stroke="var(--color-border)" strokeWidth="24" />;
                          }

                          return genderData.map((item) => {
                            if (item.count === 0) return null;
                            const percent = item.count / totalCount;
                            const strokeDash = percent * 439.8; 
                            const strokeOffset = 439.8 - (accumulatedPercent * 439.8);
                            accumulatedPercent += percent;

                            const isFiltered = filters.sexo === item.type;
                            const strokeW = isFiltered ? 32 : 24;

                            return (
                              <circle
                                key={item.type}
                                cx="100"
                                cy="100"
                                r="70"
                                fill="none"
                                stroke={item.color}
                                strokeWidth={strokeW}
                                strokeDasharray={`${strokeDash} 439.8`}
                                strokeDashoffset={strokeOffset}
                                transform="rotate(-90 100 100)"
                                onClick={() => handleToggleFilter('sexo', item.type)}
                                onMouseEnter={(e) => setTooltip({ 
                                  show: true, 
                                  x: e.clientX, 
                                  y: e.clientY - 40, 
                                  content: `${item.type}: ${item.count} (${(percent * 100).toFixed(0)}%) - Clique para filtrar` 
                                })}
                                onMouseLeave={() => setTooltip(p => ({ ...p, show: false }))}
                                style={{ cursor: 'pointer', transition: 'stroke-width 0.2s' }}
                              />
                            );
                          });
                        })()}
                        <circle cx="100" cy="100" r="54" fill="white" />
                        <text x="100" y="95" textAnchor="middle" fill="var(--color-text-muted)" fontSize="9" fontWeight="600">PRODUTORES</text>
                        <text x="100" y="115" textAnchor="middle" fill="var(--color-primary)" fontSize="18" fontWeight="800">
                          {filteredProdutores.length}
                        </text>
                      </svg>
                    </div>
                    {/* Tiny Legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem', width: '100%' }}>
                      {genderData.map(item => (
                        <div 
                          key={item.type} 
                          onClick={() => handleToggleFilter('sexo', item.type)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: filters.sexo === item.type ? 700 : 'normal' }}
                        >
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: item.color, borderRadius: '2px' }}></span>
                          <span style={{ color: filters.sexo === item.type ? 'var(--color-accent)' : 'var(--color-text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.type}: {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Horizontal Bar Chart for Faixa Etária */}
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem', display: 'block' }}>Faixa Etária:</span>
                    {ageData.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Sem dados de faixa etária.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {ageData.map((item) => {
                          const barWidth = (item.count / maxAgeValue) * 100; // max 100%
                          const isFiltered = filters.faixaEtaria === item.label;
                          const barColor = isFiltered ? 'var(--color-accent)' : 'var(--color-primary-light)';

                          return (
                            <div 
                              key={item.label} 
                              onClick={() => handleToggleFilter('faixaEtaria', item.label)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '1px', fontWeight: isFiltered ? 700 : 500 }}>
                                <span style={{ color: isFiltered ? 'var(--color-accent)' : 'var(--color-text-main)' }}>{item.label}</span>
                                <span>{item.count}</span>
                              </div>
                              <div style={{ height: '10px', background: '#e6f4ea', borderRadius: '3px', overflow: 'hidden' }}>
                                <div 
                                  style={{ 
                                    height: '100%', 
                                    width: `${barWidth}%`, 
                                    background: barColor, 
                                    borderRadius: '3px',
                                    transition: 'width 0.5s ease-out'
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CHART 3: FINANCIAL FLUX MONTHLY */}
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <TrendingUp size={18} style={{ color: 'var(--color-secondary)' }} />
                      Fluxo de Caixa Mensal (R$)
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Clique nas receitas/despesas para filtrar o tipo</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} onClick={() => downloadSVG(chartFinanceRef, 'fluxo_financeiro')} title="Baixar SVG">
                      SVG
                    </button>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} onClick={() => downloadPNG(chartFinanceRef, 'fluxo_financeiro')} title="Baixar PNG">
                      PNG
                    </button>
                  </div>
                </div>

                <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                  {monthlyFinances.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Nenhum lançamento financeiro registrado.</div>
                  ) : (
                    <svg 
                      ref={chartFinanceRef} 
                      viewBox="0 0 500 220" 
                      style={{ width: '100%', height: '100%' }}
                    >
                      <line x1="50" y1="30" x2="480" y2="30" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="50" y1="80" x2="480" y2="80" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="50" y1="130" x2="480" y2="130" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                      
                      <line x1="50" y1="180" x2="480" y2="180" stroke="var(--color-text-light)" strokeWidth="1" />
                      
                      <text x="45" y="33" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">{formatFinanceLabel(roundedMaxFin)}</text>
                      <text x="45" y="108" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">{formatFinanceLabel(roundedMaxFin / 2)}</text>
                      <text x="45" y="183" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">0</text>

                      {monthlyFinances.map((item, idx) => {
                        const step = 410 / monthlyFinances.length;
                        const x = 60 + idx * step;
                        const heightRec = (item.receita / roundedMaxFin) * 140;
                        const heightDes = (item.despesa / roundedMaxFin) * 140;

                        const barWidth = Math.max(8, (step / 2) - 4);
                        
                        const isRecFiltered = filters.tipoFinanca === 'Receita';
                        const isDesFiltered = filters.tipoFinanca === 'Despesa';
                        
                        const recColor = isRecFiltered ? 'var(--color-success)' : (isDesFiltered ? '#a7f3d0' : 'var(--color-success)');
                        const desColor = isDesFiltered ? 'var(--color-danger)' : (isRecFiltered ? '#fecaca' : 'var(--color-danger)');

                        return (
                          <g key={item.label}>
                            {/* Receita bar */}
                            <rect 
                              x={x} 
                              y={180 - heightRec} 
                              width={barWidth} 
                              height={heightRec} 
                              fill={recColor} 
                              rx="2"
                              onClick={() => handleToggleFilter('tipoFinanca', 'Receita')}
                              onMouseEnter={(e) => setTooltip({ 
                                show: true, 
                                x: e.clientX, 
                                y: e.clientY - 40, 
                                content: `${item.label} (Receita): R$ ${item.receita.toLocaleString('pt-BR')} - Clique para filtrar` 
                              })}
                              onMouseLeave={() => setTooltip(p => ({ ...p, show: false }))}
                              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            />
                            {/* Despesa bar */}
                            <rect 
                              x={x + barWidth + 3} 
                              y={180 - heightDes} 
                              width={barWidth} 
                              height={heightDes} 
                              fill={desColor} 
                              rx="2"
                              onClick={() => handleToggleFilter('tipoFinanca', 'Despesa')}
                              onMouseEnter={(e) => setTooltip({ 
                                show: true, 
                                x: e.clientX, 
                                y: e.clientY - 40, 
                                content: `${item.label} (Despesa): R$ ${item.despesa.toLocaleString('pt-BR')} - Clique para filtrar` 
                              })}
                              onMouseLeave={() => setTooltip(p => ({ ...p, show: false }))}
                              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            />
                            {/* Month label */}
                            <text x={x + barWidth + 1.5} y="195" fill="var(--color-text-light)" fontSize="9" fontWeight="600" textAnchor="middle">{item.label}</text>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.8rem', marginTop: '-0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: filters.tipoFinanca === 'Receita' ? 700 : 'normal' }} onClick={() => handleToggleFilter('tipoFinanca', 'Receita')}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--color-success)', borderRadius: '3px' }}></span>
                    Receitas {filters.tipoFinanca === 'Receita' && '(Ativo)'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: filters.tipoFinanca === 'Despesa' ? 700 : 'normal' }} onClick={() => handleToggleFilter('tipoFinanca', 'Despesa')}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--color-danger)', borderRadius: '3px' }}></span>
                    Despesas {filters.tipoFinanca === 'Despesa' && '(Ativo)'}
                  </span>
                </div>
              </div>

              {/* CHART 4: TOP VARIETIES IN DONATIONS */}
              <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <Gift size={18} style={{ color: 'var(--color-secondary)' }} />
                      Frequência de Variedades Doadas
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Mudas, sementes e alimentos distribuídos</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} onClick={() => downloadSVG(chartDonationRef, 'frequencia_variedades')} title="Baixar SVG">
                      SVG
                    </button>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} onClick={() => downloadPNG(chartDonationRef, 'frequencia_variedades')} title="Baixar PNG">
                      PNG
                    </button>
                  </div>
                </div>

                <div style={{ position: 'relative', width: '100%', height: '220px', display: 'flex', alignItems: 'center' }}>
                  {donationVarieties.length === 0 ? (
                    <div style={{ width: '100%', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Nenhum dado de doações disponível.</div>
                  ) : (
                    <svg 
                      ref={chartDonationRef} 
                      viewBox="0 0 500 200" 
                      style={{ width: '100%', height: '100%' }}
                    >
                      {donationVarieties.map((item, idx) => {
                        const y = 15 + idx * 36;
                        const maxVal = Math.max(...donationVarieties.map(v => v.count), 1);
                        const barWidth = (item.count / maxVal) * 310;
                        
                        return (
                          <g key={item.name}>
                            {/* Variety Text */}
                            <text x="10" y={y + 16} fill="var(--color-text-main)" fontSize="9" fontWeight="700" textAnchor="start">
                              {item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name}
                            </text>
                            
                            {/* Background Bar */}
                            <rect x="140" y={y} width="310" height="22" fill="#e6f4ea" rx="4" />
                            
                            {/* Active Bar */}
                            <rect 
                              x="140" 
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
                              style={{ transition: 'all 0.2s', cursor: 'pointer' }}
                            />
                            
                            {/* Value label */}
                            <text x={145 + barWidth} y={y + 15} fill="var(--color-primary)" fontSize="9" fontWeight="700">
                              {item.count}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}
                </div>
              </div>

            </div>

            {/* ADITIONAL ANALYSIS: RANKINGS AND HIGHLIGHTS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
              
              {/* RANKING: TOP PRODUCERS BY SIZE */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Landmark size={18} style={{ color: 'var(--color-secondary)' }} />
                  Maiores Produtores por Área Cultivada
                </h3>
                {topProducersByArea.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Sem dados de áreas disponíveis.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {topProducersByArea.map((p, idx) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ background: 'var(--color-primary-light)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%' }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{p.nomeCompleto}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700 }}>{p.tamanhoArea} ha</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* HIGHLIGHT: GENERAL COMPARISON CARDS */}
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} style={{ color: 'var(--color-secondary)' }} />
                  Visão Comparativa de Categorias
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
                  
                  {/* Irrigação Box */}
                  <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #d8f3dc', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Faz Irrigação?</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {((filteredProdutores.filter(p => p.fazIrrigacao === 'Sim').length / Math.max(filteredProdutores.length, 1)) * 100).toFixed(0)}%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        ({filteredProdutores.filter(p => p.fazIrrigacao === 'Sim').length} de {filteredProdutores.length})
                      </span>
                    </div>
                  </div>

                  {/* Transferência de renda Box */}
                  <div style={{ background: '#fdf2f8', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fbcfe8', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#be185d', fontWeight: 600 }}>Programa de Renda</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#be185d' }}>
                        {((filteredProdutores.filter(p => p.programaRenda === 'Sim').length / Math.max(filteredProdutores.length, 1)) * 100).toFixed(0)}%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        ({filteredProdutores.filter(p => p.programaRenda === 'Sim').length} de {filteredProdutores.length})
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* DATA EXPLORER & CSV REPORT GENERATOR */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileSpreadsheet size={24} style={{ color: 'var(--color-secondary)' }} />
                    Navegador de Dados Relacionados
                  </h2>
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                    Esta lista sincroniza automaticamente com as seleções nos gráficos e buscas acima. Exporte relatórios para planilhas.
                  </p>
                </div>

                <button 
                  className="btn btn-accent" 
                  onClick={exportCSV} 
                  style={{ display: 'flex', gap: '0.5rem', background: 'var(--color-accent)', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}
                >
                  <FileSpreadsheet size={18} />
                  Exportar Tabela para CSV
                </button>
              </div>

              {/* TAB SECTOR FOR EXPLORER */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                {['produtores', 'doacoes', 'financas', 'eventos'].map(tab => {
                  const countsMap = {
                    produtores: filteredProdutores.length,
                    doacoes: filteredDoacoes.length,
                    financas: filteredTransactions.length,
                    eventos: filteredEvents.length
                  };
                  
                  return (
                    <button
                      key={tab}
                      className="btn btn-sm"
                      onClick={() => {
                        setExplorerTab(tab);
                        setExplorerSearch('');
                      }}
                      style={{
                        background: explorerTab === tab ? 'var(--color-primary)' : 'transparent',
                        color: explorerTab === tab ? 'white' : 'var(--color-text-light)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.5rem 1rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {tab.toUpperCase()} ({countsMap[tab]})
                    </button>
                  );
                })}
              </div>

              {/* SEARCH FIELD INSIDE EXPLORER */}
              <div style={{ position: 'relative', marginBottom: '1.5rem', width: '100%' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Pesquisar sub-tabela de ${explorerTab}...`}
                  style={{ paddingLeft: '2.5rem' }}
                  value={explorerSearch}
                  onChange={(e) => setExplorerSearch(e.target.value)}
                />
              </div>

              {/* TABLE CONTAINER */}
              {filteredExplorerRows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
                  Nenhum registro corresponde aos critérios e buscas selecionadas.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="form-control" style={{ width: '100%', borderCollapse: 'collapse', background: 'transparent' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                        {Object.keys(filteredExplorerRows[0]).map(key => (
                          <th key={key} style={{ padding: '0.75rem 0.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)', borderBottom: '2px solid var(--color-border)' }}>
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExplorerRows.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }} className="table-row-hover">
                          {Object.values(row).map((val, cellIdx) => (
                            <td key={cellIdx} style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <style>{`
                    .table-row-hover:hover {
                      background: rgba(82, 183, 136, 0.05) !important;
                    }
                  `}</style>
                </div>
              )}
            </div>

          </div>
        )
      ) : (
        <ConfigBancoPanel />
      )}

      {/* FLOATING INTERACTIVE TOOLTIP */}
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
