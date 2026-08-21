import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Copy, 
  HelpCircle,
  CloudLightning
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  testConnection, 
  resetSupabaseInstance 
} from '../../utils/supabaseClient';
import { syncLocalToCloud } from '../../utils/storage';

export default function ConfigBancoPanel() {
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  
  const [status, setStatus] = useState('offline'); // offline, checking, online
  const [tablesMissing, setTablesMissing] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success, message }
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const [copied, setCopied] = useState(false);

  // Load existing credentials on mount
  useEffect(() => {
    const { url, key } = getSupabaseCredentials();
    setUrlInput(url);
    setKeyInput(key);
    if (url && key) {
      checkOnlineStatus(url, key);
    }
  }, []);

  const checkOnlineStatus = async (url, key) => {
    setStatus('checking');
    const res = await testConnection(url, key);
    if (res.success) {
      setStatus('online');
      setTablesMissing(res.tablesMissing);
    } else {
      setStatus('offline');
      setTablesMissing(false);
    }
  };

  const handleTestConnection = async () => {
    if (!urlInput || !keyInput) {
      setTestResult({ success: false, message: 'Por favor, preencha a URL e a Chave Anon.' });
      return;
    }
    setTestResult(null);
    setStatus('checking');
    
    const res = await testConnection(urlInput, keyInput);
    setTestResult({
      success: res.success,
      message: res.success 
        ? (res.tablesMissing 
            ? 'Conectado com sucesso! (Aviso: As tabelas SQL ainda não foram criadas no banco de dados).' 
            : 'Conexão estabelecida com sucesso!')
        : res.message
    });
    
    if (res.success) {
      setStatus('online');
      setTablesMissing(res.tablesMissing);
    } else {
      setStatus('offline');
      setTablesMissing(false);
    }
  };

  const handleSaveCredentials = () => {
    setIsSaving(true);
    if (urlInput && keyInput) {
      localStorage.setItem('supabase_url', urlInput.trim());
      localStorage.setItem('supabase_key', keyInput.trim());
    } else {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_key');
    }
    
    resetSupabaseInstance();
    setIsSaving(false);
    
    // Check status after saving
    checkOnlineStatus(urlInput, keyInput);
  };

  const handleClearCredentials = () => {
    setUrlInput('');
    setKeyInput('');
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
    resetSupabaseInstance();
    setStatus('offline');
    setTablesMissing(false);
    setTestResult(null);
    setSyncResult(null);
  };

  const handleSyncData = async () => {
    if (status !== 'online') return;
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncLocalToCloud();
      setSyncResult({
        success: true,
        message: 'Dados locais sincronizados com a nuvem com sucesso!',
        details: res
      });
    } catch (e) {
      console.error(e);
      setSyncResult({
        success: false,
        message: e.message || 'Falha ao sincronizar dados. Verifique a estrutura das tabelas.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const sqlScript = `-- SCRIPT PARA CRIAÇÃO DAS TABELAS NO SUPABASE
-- Copie este código e cole no SQL Editor do seu projeto Supabase

-- 1. Tabela de Produtores
CREATE TABLE IF NOT EXISTS produtores (
  id TEXT PRIMARY KEY,
  "nomeCompleto" TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  escolaridade TEXT,
  telefone TEXT,
  "rendaMensal" TEXT,
  "estadoCivil" TEXT,
  sexo TEXT,
  idade INTEGER,
  "integrantesFamilia" TEXT,
  "atividadePrincipal" TEXT,
  "atividadeSecundaria" TEXT,
  "programaRenda" TEXT,
  localizacao TEXT,
  "tamanhoArea" TEXT,
  "disponibilidadeAgua" JSONB,
  "fazIrrigacao" TEXT,
  "tipoIrrigacao" TEXT,
  "culturasCultivadas" TEXT,
  "destinoVenda" TEXT
);

-- 2. Tabela de Associacoes
CREATE TABLE IF NOT EXISTS associacoes (
  id TEXT PRIMARY KEY,
  "nomeCompleto" TEXT NOT NULL,
  cnpj TEXT,
  localizacao TEXT,
  "numeroAssociados" TEXT,
  "culturasProduzidas" TEXT,
  "principaisClientes" TEXT
);

-- 3. Tabela de Prefeituras
CREATE TABLE IF NOT EXISTS prefeituras (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT,
  local TEXT,
  representante TEXT
);

-- 4. Tabela de Escolas
CREATE TABLE IF NOT EXISTS escolas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT,
  local TEXT,
  representante TEXT
);

-- 5. Tabela de Instituicoes de Pesquisa
CREATE TABLE IF NOT EXISTS instituicoes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cnpj TEXT,
  natureza TEXT,
  local TEXT,
  representante TEXT
);

-- 6. Tabela de Parceiros/Pesquisadores
CREATE TABLE IF NOT EXISTS parceiros (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT,
  titulacao TEXT,
  instituicao TEXT,
  "areaAtuacao" TEXT,
  email TEXT
);

-- 7. Tabela de Doacoes
CREATE TABLE IF NOT EXISTS doacoes (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL, -- 'mudas' ou 'alimentos'
  "mudasVariedade" TEXT,
  "mudasQuantidade" TEXT,
  "mudasLote" TEXT,
  "mudasLocalDestino" TEXT,
  "mudasResponsavel" TEXT,
  "mudasPrevisaoCultivo" TEXT,
  "alimentosVariedade" TEXT,
  "alimentosQuantidade" TEXT,
  "alimentosLocalDestino" TEXT,
  "alimentosResponsavel" TEXT,
  "dataRegistro" TEXT NOT NULL
);

-- 8. Tabela de Controle Financeiro
CREATE TABLE IF NOT EXISTS financeiro (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL, -- 'Receita' ou 'Despesa'
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data TEXT NOT NULL,
  descricao TEXT,
  status TEXT
);

-- 9. Tabela de Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  tipo TEXT,
  data TEXT NOT NULL,
  hora TEXT,
  local TEXT,
  descricao TEXT,
  participantes INTEGER,
  custo NUMERIC
);

-- 10. Tabela de Caderno de Campo
CREATE TABLE IF NOT EXISTS caderno_campo (
  id TEXT PRIMARY KEY,
  area JSONB DEFAULT '{}'::jsonb,
  parcelas JSONB DEFAULT '[]'::jsonb,
  tratos JSONB DEFAULT '[]'::jsonb,
  meteorologia JSONB DEFAULT '[]'::jsonb,
  irrigacao JSONB DEFAULT '[]'::jsonb,
  nutricao JSONB DEFAULT '[]'::jsonb,
  pragas JSONB DEFAULT '[]'::jsonb,
  doencas JSONB DEFAULT '[]'::jsonb,
  agrotoxicos JSONB DEFAULT '[]'::jsonb,
  colheita JSONB DEFAULT '[]'::jsonb
);

-- 11. Tabela de Consultoria Técnica
CREATE TABLE IF NOT EXISTS consultoria (
  id TEXT PRIMARY KEY,
  local TEXT,
  "responsavelLocal" TEXT,
  "tamanhoArea" TEXT,
  "sistemaIrrigacao" TEXT,
  variedades TEXT,
  "etapasManejo" TEXT,
  "cronogramaPresencial" TEXT,
  "cronogramaDistancia" TEXT,
  "bolsistaResponsavel" TEXT,
  "pesquisadorResponsavel" TEXT
);

-- 12. Tabela de Consultoria Inteligente (IA)
CREATE TABLE IF NOT EXISTS consultoria_inteligente (
  id TEXT PRIMARY KEY,
  cultura TEXT NOT NULL,
  problema TEXT,
  midias JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'Pendente',
  resultado JSONB DEFAULT '{}'::jsonb,
  "created_at" TEXT
);

-- ======================================================
-- CONFIGURAÇÃO DE SEGURANÇA E POLÍTICAS RLS (Row Level Security)
-- ======================================================
-- Como o Supabase ativa RLS por padrão, você precisa liberar acesso para a chave anon (Publishable Key).
-- Execute os comandos abaixo para habilitar o RLS e criar as políticas públicas de acesso total.

-- Habilitar RLS em todas as tabelas
ALTER TABLE produtores ENABLE ROW LEVEL SECURITY;
ALTER TABLE associacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prefeituras ENABLE ROW LEVEL SECURITY;
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE doacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE caderno_campo ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultoria_inteligente ENABLE ROW LEVEL SECURITY;

-- Criar Políticas para permitir leitura e gravação anônima (anon / publishable key)
CREATE POLICY "Permitir acesso anon para produtores" ON produtores FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso anon para associacoes" ON associacoes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso anon para prefeituras" ON prefeituras FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso anon para escolas" ON escolas FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso anon para instituicoes" ON instituicoes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso anon para parceiros" ON parceiros FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso anon para doacoes" ON doacoes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso anon para financeiro" ON financeiro FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso anon para eventos" ON eventos FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso anon para caderno_campo" ON caderno_campo FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso anon para consultoria" ON consultoria FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso anon para consultoria_inteligente" ON consultoria_inteligente FOR ALL TO anon USING (true) WITH CHECK (true);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Status Card */}
      <div className="glass-card" style={{ 
        padding: '2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1.5rem',
        borderLeft: `5px solid ${status === 'online' ? 'var(--color-success)' : status === 'checking' ? 'var(--color-accent)' : 'var(--color-text-muted)'}`
      }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
            <Database size={24} style={{ color: 'var(--color-secondary)' }} />
            Status da Conexão em Nuvem
          </h3>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {status === 'online' 
              ? (tablesMissing 
                  ? 'Conectado ao Supabase, mas tabelas SQL não encontradas.' 
                  : 'Sistema conectado e operando no banco de dados online seguro.') 
              : status === 'checking' 
                ? 'Verificando conectividade...' 
                : 'Operando em modo local offline. Seus dados estão salvos apenas no navegador.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: status === 'online' ? 'rgba(16, 185, 129, 0.1)' : status === 'checking' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(156, 163, 175, 0.1)' }}>
          {status === 'online' ? (
            <>
              <Wifi size={18} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-success)' }}>CONECTADO</span>
            </>
          ) : status === 'checking' ? (
            <>
              <RefreshCw size={18} className="spin-animation" style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent)' }}>VALIDANDO...</span>
            </>
          ) : (
            <>
              <WifiOff size={18} style={{ color: 'var(--color-text-light)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-light)' }}>LOCAL (OFFLINE)</span>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Setup Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CloudLightning size={20} style={{ color: 'var(--color-secondary)' }} />
            Credenciais do Banco
          </h3>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Preencha os campos abaixo com as informações do seu projeto do Supabase (supabase.com) para sincronizar.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Projeto URL (API URL) *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: https://xxxx.supabase.co"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Chave Anon Pública (Project API Anon Key) *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Insira a chave anon key..."
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
              />
            </div>

            {testResult && (
              <div className={testResult.success ? "alert-success" : "alert-danger"} style={{ padding: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {testResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={handleTestConnection} style={{ flex: 1 }}>
                Testar
              </button>
              <button className="btn btn-primary" onClick={handleSaveCredentials} style={{ flex: 1 }} disabled={isSaving}>
                Conectar e Salvar
              </button>
            </div>

            {(urlInput || keyInput) && (
              <button className="btn btn-danger btn-sm" onClick={handleClearCredentials} style={{ marginTop: '0.5rem', width: '100%' }}>
                Desconectar / Limpar Chaves
              </button>
            )}
          </div>
        </div>

        {/* Sync panel */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={20} style={{ color: 'var(--color-secondary)' }} />
            Sincronização de Dados
          </h3>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Use este painel para enviar todos os dados salvos localmente no seu computador (como os dados de testes semeados) diretamente para o banco de dados online.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(82, 183, 136, 0.05)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.25rem' }}>Atenção:</strong>
              A sincronização enviará todos os dados salvos localmente e substituirá/atualizará os dados correspondentes na nuvem por meio do ID. Certifique-se de ter criado as tabelas no Supabase antes de sincronizar.
            </div>

            {syncResult && (
              <div className={syncResult.success ? "alert-success" : "alert-danger"} style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{syncResult.message}</div>
                {syncResult.success && syncResult.details && (
                  <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                    {Object.entries(syncResult.details).map(([t, count]) => (
                      <li key={t}>{t}: {count} itens</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              className="btn btn-accent"
              onClick={handleSyncData}
              disabled={status !== 'online' || isSyncing}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="spin-animation" size={18} />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Sincronizar Dados Locais para Nuvem
                </>
              )}
            </button>
            
            {status !== 'online' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', textAlign: 'center' }}>
                * Habilite uma conexão de nuvem válida para poder sincronizar os dados.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* SQL Script Copier */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={20} style={{ color: 'var(--color-secondary)' }} />
              Como configurar o Banco de Dados no Supabase?
            </h3>
            <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Crie uma conta gratuita no Supabase, crie um novo projeto, vá na aba **SQL Editor**, clique em **New Query**, cole o script abaixo e clique em **Run**.
            </p>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={copyToClipboard}
            style={{ display: 'flex', gap: '0.25rem', background: copied ? 'var(--color-success)' : 'white', color: copied ? 'white' : 'var(--color-text-light)' }}
          >
            <Copy size={14} />
            {copied ? 'Copiado!' : 'Copiar Script SQL'}
          </button>
        </div>

        <pre style={{ 
          background: '#1e293b', 
          color: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-md)', 
          overflowX: 'auto', 
          fontSize: '0.8rem',
          maxHeight: '300px',
          fontFamily: 'monospace',
          lineHeight: '1.5'
        }}>
          <code>{sqlScript}</code>
        </pre>
      </div>
      
      {/* CSS Spin Keyframes */}
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
  );
}
