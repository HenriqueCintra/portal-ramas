import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Mic,
  Square,
  Volume2,
  Video,
  Image as ImageIcon,
  RefreshCw,
  Settings,
  Activity,
  ArrowRight,
  FolderOpen,
  Camera
} from 'lucide-react';
import { getEntities, saveEntity, deleteEntity } from '../../utils/storage';
import { getSupabase } from '../../utils/supabaseClient';
import { saveLocalFile, getLocalFile, deleteLocalFile } from '../../utils/localFilesDb';
import { analyzeProblem } from '../../utils/ai/aiService';

export default function ConsultoriaInteligenteModule() {
  const [activeTab, setActiveTab] = useState('nova'); // 'nova' ou 'historico'
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // Media states
  const [mediaList, setMediaList] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const cameraVideoRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    cultura: '',
    problema: ''
  });

  // AI settings states (saved to localStorage)
  const [aiSettings, setAiSettings] = useState({
    provider: 'gemini',
    openaiKey: '',
    openaiModel: 'gpt-4o-mini',
    geminiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    geminiModel: 'gemini-3.5-flash',
    isMock: !import.meta.env.VITE_GEMINI_API_KEY
  });
  const [showSettings, setShowSettings] = useState(false);

  // Load settings and history on mount
  useEffect(() => {
    // Load AI settings
    const storedProvider = localStorage.getItem('ai_provider') || 'gemini';
    const storedOpenaiKey = localStorage.getItem('openai_api_key') || '';
    const storedOpenaiModel = localStorage.getItem('openai_model') || 'gpt-4o-mini';
    const storedGeminiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    let storedGeminiModel = localStorage.getItem('gemini_model') || 'gemini-3.5-flash';
    // Migrate deprecated models to the currently available default
    const deprecatedModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-2.5-pro'];
    if (deprecatedModels.includes(storedGeminiModel)) {
      storedGeminiModel = 'gemini-3.5-flash';
      localStorage.setItem('gemini_model', storedGeminiModel);
    }

    // If there is an API key (either in localStorage or in env), default isMock to false
    const hasKey = !!(storedGeminiKey || storedOpenaiKey);
    const storedIsMock = localStorage.getItem('ai_is_mock') !== null
      ? localStorage.getItem('ai_is_mock') !== 'false'
      : !hasKey;

    setAiSettings({
      provider: storedProvider,
      openaiKey: storedOpenaiKey,
      openaiModel: storedOpenaiModel,
      geminiKey: storedGeminiKey,
      geminiModel: storedGeminiModel,
      isMock: storedIsMock
    });

    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getEntities('consultoria_inteligente');
      // Sort by newest
      const sorted = [...(data || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistory(sorted);

      // Auto-select latest if none selected
      if (sorted.length > 0 && !selectedAnalysis) {
        loadAnalysisMedia(sorted[0]);
      }
    } catch (e) {
      console.error('Erro ao carregar histórico:', e);
    }
  };

  // Helper to load media files (converting local IndexedDB files to object URLs if needed)
  const loadAnalysisMedia = async (analysis) => {
    if (!analysis) return;

    const updatedMidias = [];
    for (const m of analysis.midias || []) {
      if (m.isLocal) {
        try {
          const blob = await getLocalFile(m.id);
          if (blob) {
            updatedMidias.push({
              ...m,
              url: URL.createObjectURL(blob)
            });
          } else {
            updatedMidias.push(m);
          }
        } catch (err) {
          console.error(`Erro ao carregar mídia local ${m.id}:`, err);
          updatedMidias.push(m);
        }
      } else {
        updatedMidias.push(m);
      }
    }

    setSelectedAnalysis({
      ...analysis,
      midiasLoaded: updatedMidias
    });
  };

  // Handle setting updates
  const handleSettingChange = (key, value) => {
    setAiSettings(prev => {
      const updated = { ...prev, [key]: value };

      // Persist to localStorage
      if (key === 'provider') localStorage.setItem('ai_provider', value);
      if (key === 'openaiKey') localStorage.setItem('openai_api_key', value);
      if (key === 'openaiModel') localStorage.setItem('openai_model', value);
      if (key === 'geminiKey') localStorage.setItem('gemini_api_key', value);
      if (key === 'geminiModel') localStorage.setItem('gemini_model', value);
      if (key === 'isMock') localStorage.setItem('ai_is_mock', value);

      return updated;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Audio Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const options = { mimeType: 'audio/webm' };

      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (err) {
        console.warn('MediaRecorder com webm falhou, tentando padrão:', err);
        // Fallback for browsers not supporting webm audio
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/wav' });
        const id = `aud_${Date.now()}`;
        const newAudio = {
          id,
          name: `audio_gravado_${new Date().toLocaleTimeString().replace(/:/g, '-')}.wav`,
          type: audioBlob.type || 'audio/wav',
          url: URL.createObjectURL(audioBlob),
          blob: audioBlob
        };

        setMediaList(prev => [...prev, newAudio]);
        stream.getTracks().forEach(track => track.stop());
      };

      setRecording(true);
      setRecordingDuration(0);
      recorder.start();

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      alert('Não foi possível acessar seu microfone. Verifique as permissões do navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  // Camera Photo capturing functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      setCameraActive(true);

      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.warn('Erro ao acessar câmera traseira, tentando padrão:', err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStream(stream);
        setCameraActive(true);
        setTimeout(() => {
          if (cameraVideoRef.current) {
            cameraVideoRef.current.srcObject = stream;
          }
        }, 100);
      } catch (err2) {
        console.error('Erro geral ao acessar câmera:', err2);
        alert('Não foi possível acessar a câmera. Verifique as permissões de câmera do seu dispositivo.');
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (cameraVideoRef.current) {
      const video = cameraVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const id = `cam_${Date.now()}`;
          const newPhoto = {
            id,
            name: `captura_camera_${new Date().toLocaleTimeString().replace(/:/g, '-')}.jpg`,
            type: 'image/jpeg',
            url: URL.createObjectURL(blob),
            blob: blob
          };
          setMediaList(prev => [...prev, newPhoto]);
        }
        stopCamera();
      }, 'image/jpeg', 0.85);
    }
  };

  // Add cleanup to unmount or stream change
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // File Upload functions
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const newMedia = files.map(file => ({
      id: `media_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      blob: file
    }));

    setMediaList(prev => [...prev, ...newMedia]);
  };

  const handleRemoveMedia = (id) => {
    setMediaList(prev => {
      const filtered = prev.filter(m => m.id !== id);
      // Revoke the object URL to avoid leaks
      const removed = prev.find(m => m.id === id);
      if (removed && removed.url) URL.revokeObjectURL(removed.url);
      return filtered;
    });
  };

  // Database helper: uploads a media file (Supabase Bucket or local IndexedDB)
  const persistMediaFile = async (media, analysisId) => {
    const supabase = getSupabase();
    const fileName = `${analysisId}_${media.name}`;

    if (supabase) {
      try {
        console.log(`Tentando enviar ${media.name} para o Supabase Storage...`);
        const { data, error } = await supabase.storage
          .from('consultoria-midias')
          .upload(fileName, media.blob, { cacheControl: '3600', upsert: true });

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('consultoria-midias')
            .getPublicUrl(data.path);

          return {
            id: media.id,
            name: media.name,
            type: media.type,
            url: publicUrl,
            isLocal: false
          };
        }
        console.warn('Erro ao subir para o Supabase Storage. Usando fallback de IndexedDB:', error?.message);
      } catch (err) {
        console.warn('Falha na rede do Supabase Storage. Usando fallback local:', err);
      }
    }

    // Local IndexedDB Fallback
    console.log(`Salvando mídia ${media.name} localmente no IndexedDB.`);
    await saveLocalFile(media.id, media.blob);
    return {
      id: media.id,
      name: media.name,
      type: media.type,
      isLocal: true
    };
  };

  // Submit diagnosis request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cultura) {
      alert('Por favor, informe a cultura agrícola.');
      return;
    }

    setLoading(true);
    const analysisId = `ci_${Date.now()}`;
    const today = new Date().toISOString();

    // 1. Create a request record and save with "Analisando" status
    const initialRecord = {
      id: analysisId,
      cultura: formData.cultura,
      problema: formData.problema,
      midias: [], // will fill in next steps
      status: 'Analisando',
      created_at: today,
      resultado: {}
    };

    try {
      await saveEntity('consultoria_inteligente', initialRecord);
      loadHistory();
      setActiveTab('historico');

      // 2. Persist media files locally or online
      const persistedMediaList = [];
      for (const media of mediaList) {
        const persisted = await persistMediaFile(media, analysisId);
        persistedMediaList.push(persisted);
      }

      // Update the record with media references
      initialRecord.midias = persistedMediaList;
      await saveEntity('consultoria_inteligente', initialRecord);

      // 3. Trigger IA analysis
      // Always prefer env key as source-of-truth, then localStorage
      const envGeminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      const apiKey = aiSettings.provider === 'openai'
        ? aiSettings.openaiKey
        : (envGeminiKey || aiSettings.geminiKey);
      const model = aiSettings.provider === 'openai' ? aiSettings.openaiModel : aiSettings.geminiModel;

      // Never use mock if we have a real API key
      const shouldUseMock = aiSettings.isMock && !apiKey;

      const aiResponse = await analyzeProblem({
        culture: formData.cultura,
        problem: formData.problema,
        mediaFiles: mediaList,
        provider: aiSettings.provider,
        model: model,
        apiKey: apiKey,
        isMock: shouldUseMock
      });

      // 4. Update request status to "Concluído" and save AI results
      const finalizedRecord = {
        ...initialRecord,
        status: 'Concluído',
        resultado: aiResponse
      };

      const saved = await saveEntity('consultoria_inteligente', finalizedRecord);
      console.log('Análise salva com sucesso:', saved);

      // Clean form states
      setFormData({ cultura: '', problema: '' });
      setMediaList([]);

      // Reload history and select the generated analysis
      await loadHistory();
      await loadAnalysisMedia(finalizedRecord);

    } catch (err) {
      console.error('Erro na solicitação de diagnóstico Inteligente:', err);

      // Save record as "Falhou"
      const failedRecord = {
        ...initialRecord,
        status: 'Falhou',
        resultado: {
          diagnostico: 'Não foi possível concluir o diagnóstico agronômico.',
          observacoes: `Erro: ${err.message || err}. Verifique suas chaves de API e a conexão.`
        }
      };

      await saveEntity('consultoria_inteligente', failedRecord);
      await loadHistory();
      await loadAnalysisMedia(failedRecord);
      alert(`Falha no diagnóstico: ${err.message || 'Erro na análise da IA.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete analysis
  const handleDeleteAnalysis = async (id, e) => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir este diagnóstico do histórico?')) {
      const item = history.find(h => h.id === id);
      if (item && item.midias) {
        // Delete related local files in IndexedDB
        for (const m of item.midias) {
          if (m.isLocal) {
            await deleteLocalFile(m.id);
          }
        }
      }
      await deleteEntity('consultoria_inteligente', id);
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
      loadHistory();
    }
  };

  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'baixo': return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--color-success)', border: 'rgba(16, 185, 129, 0.2)' };
      case 'médio': case 'medio': return { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706', border: 'rgba(245, 158, 11, 0.2)' };
      case 'alto': return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--color-danger)', border: 'rgba(239, 68, 68, 0.2)' };
      case 'crítico': case 'critico': return { bg: 'rgba(127, 29, 29, 0.15)', text: '#7f1d1d', border: 'rgba(127, 29, 29, 0.3)' };
      default: return { bg: 'rgba(156, 163, 175, 0.1)', text: 'var(--color-text-light)', border: 'rgba(156, 163, 175, 0.2)' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Concluído':
        return <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>CONCLUÍDO</span>;
      case 'Analisando':
        return <span className="pulse-animation" style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(217, 119, 6, 0.1)', color: 'var(--color-accent)' }}>ANALISANDO...</span>;
      case 'Falhou':
        return <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>FALHOU</span>;
      default:
        return <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(156, 163, 175, 0.1)', color: 'var(--color-text-light)' }}>PENDENTE</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={28} style={{ color: 'var(--color-secondary)' }} />
            Consultoria Agronômica Inteligente
          </h2>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
            Diagnósticos imediatos de pragas e doenças baseados em IA multimodal (visão, áudio e texto).
          </p>
        </div>

        {/* TAB CONTROLS */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${activeTab === 'nova' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('nova')}
            style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}
          >
            <Sparkles size={16} />
            <span>Nova Consulta</span>
          </button>
          <button
            className={`btn ${activeTab === 'historico' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('historico');
              loadHistory();
            }}
            style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}
          >
            <FolderOpen size={16} />
            <span>Histórico ({history.length})</span>
          </button>
        </div>
      </div>

      {/* CORE VIEW LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'historico' ? '300px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ==================================== */}
        {/* TAB: HISTORIC SIDEBAR */}
        {/* ==================================== */}
        {activeTab === 'historico' && (
          <div className="glass-card" style={{ padding: '1rem', maxHeight: '75vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              Análises Anteriores
            </h3>

            {history.length === 0 ? (
              <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                Nenhum diagnóstico registrado ainda.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.map((item) => {
                  const isSelected = selectedAnalysis?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => loadAnalysisMedia(item)}
                      className={`history-item-card ${isSelected ? 'active' : ''}`}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '1px solid var(--color-secondary)' : '1px solid var(--color-border)',
                        background: isSelected ? 'rgba(82, 183, 136, 0.08)' : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{item.cultura}</strong>
                        <button
                          onClick={(e) => handleDeleteAnalysis(item.id, e)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                          onMouseEnter={(e) => e.target.style.color = 'var(--color-danger)'}
                          onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
                          title="Excluir Diagnóstico"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p style={{
                        fontSize: '0.8rem',
                        color: 'var(--color-text-light)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '0.5rem'
                      }}>
                        {item.problema || 'Sem descrição.'}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================== */}
        {/* MAIN BODY: VIEW OR CREATE */}
        {/* ==================================== */}
        <div>
          {/* Nova Solicitação Tab */}
          {activeTab === 'nova' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* AI STATUS / SETTINGS PANEL */}
              <div className="glass-card" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
                <div
                  onClick={() => setShowSettings(!showSettings)}
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Settings size={20} style={{ color: 'var(--color-secondary)' }} />
                    <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>Configurações de IA</strong>
                    {/* Status Badge */}
                    {(aiSettings.geminiKey || import.meta.env.VITE_GEMINI_API_KEY) && !aiSettings.isMock ? (
                      <span style={{
                        fontSize: '0.7rem',
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--color-success)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        fontWeight: 700,
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'flex', alignItems: 'center', gap: '0.25rem'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
                        GEMINI CONECTADO
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '0.7rem',
                        background: 'rgba(245, 158, 11, 0.12)',
                        color: '#d97706',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        fontWeight: 700,
                        border: '1px solid rgba(245, 158, 11, 0.25)'
                      }}>
                        SIMULAÇÃO ATIVA
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                    {showSettings ? '▲ Ocultar' : '▼ Avançado'}
                  </span>
                </div>

                {showSettings && (
                  <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                      {/* Gemini key status info */}
                      {import.meta.env.VITE_GEMINI_API_KEY && (
                        <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                          ✅ <strong>Chave Gemini configurada</strong> — a análise real com IA está ativa automaticamente. O modo simulação só é usado como fallback se a chave falhar.
                        </div>
                      )}

                      {/* Toggle Mock Mode */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.04)', borderRadius: 'var(--radius-sm)', border: '1px dashed rgba(245, 158, 11, 0.3)' }}>
                        <input
                          type="checkbox"
                          id="isMock"
                          checked={aiSettings.isMock}
                          onChange={(e) => handleSettingChange('isMock', e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="isMock" style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                          Forçar modo de <strong>Simulação</strong> (dados fictícios, sem consumir API)
                        </label>
                      </div>

                      {/* Model and provider selection */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                          <label>Modelo Gemini</label>
                          <select
                            className="form-control"
                            value={aiSettings.geminiModel}
                            onChange={(e) => handleSettingChange('geminiModel', e.target.value)}
                          >
                            <option value="gemini-3.5-flash">gemini-3.5-flash ⚡ (Padrão/Rápido)</option>
                            <option value="gemini-3.6-flash">gemini-3.6-flash 🚀 (Nova Geração)</option>
                            <option value="gemini-2.0-flash">gemini-2.0-flash 🔘 (Estável)</option>
                            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite �ﻟ (Leve)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Chave da API (opcional)</label>
                          <input
                            type="password"
                            className="form-control"
                            placeholder={import.meta.env.VITE_GEMINI_API_KEY ? '(Usando chave do servidor)' : 'Cole sua chave Gemini aqui...'}
                            value={aiSettings.geminiKey}
                            onChange={(e) => handleSettingChange('geminiKey', e.target.value)}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* FORM TO CREATE REQUEST */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Activity style={{ color: 'var(--color-secondary)' }} size={24} />
                  <h3 style={{ fontSize: '1.25rem' }}>Nova Solicitação Agronômica</h3>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    <div className="form-group">
                      <label>Cultura / Variedade Agrícola *</label>
                      <input
                        type="text"
                        name="cultura"
                        required
                        className="form-control"
                        placeholder="Ex: Mandioca BRS Kiriris, Milho BRS Sertanejo, Tomate..."
                        value={formData.cultura}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Descrição Detalhada do Problema *</label>
                      <textarea
                        name="problema"
                        required
                        className="form-control"
                        rows="4"
                        placeholder="Descreva visualmente o problema nas folhas, frutos ou caule, mudanças na coloração, pragas visíveis ou comportamento geral da planta."
                        value={formData.problema}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* INTERACTIVE MEDIA CAPTURING AREA */}
                    <div className="form-group">
                      <label>Mídias da Lavouras (Fotos, Vídeos, Áudios)</label>

                      {/* Media selector buttons */}
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleUploadClick}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Upload size={16} />
                          <span>Selecionar Arquivos</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={startCamera}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#2d6a4f', color: 'white', borderColor: '#2d6a4f' }}
                        >
                          <Camera size={16} />
                          <span>Tirar Foto</span>
                        </button>

                        {!recording ? (
                          <button
                            type="button"
                            className="btn btn-accent btn-sm"
                            onClick={startRecording}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#d97706', color: 'white' }}
                          >
                            <Mic size={16} />
                            <span>Gravar Áudio</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={stopRecording}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', animation: 'pulse 1.5s infinite' }}
                          >
                            <Square size={16} />
                            <span>Parar ({formatDuration(recordingDuration)})</span>
                          </button>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*,video/*,audio/*"
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                      </div>

                      {/* Live Camera Feed */}
                      {cameraActive && (
                        <div style={{
                          margin: '1rem 0',
                          padding: '1rem',
                          background: '#1e293b',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '1rem',
                          border: '1px solid var(--color-border)'
                        }}>
                          <video
                            ref={cameraVideoRef}
                            autoPlay
                            playsInline
                            style={{
                              width: '100%',
                              maxWidth: '480px',
                              borderRadius: 'var(--radius-sm)',
                              transform: 'scaleX(-1)', // mirror view for user-friendliness
                              background: '#000'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={capturePhoto}
                              style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                            >
                              Capturar Foto
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={stopCamera}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display selected media list */}
                      {mediaList.length > 0 && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                          gap: '1rem',
                          background: 'rgba(0, 0, 0, 0.02)',
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)'
                        }}>
                          {mediaList.map((m) => {
                            const isImg = m.type.startsWith('image/');
                            const isVid = m.type.startsWith('video/');
                            const isAud = m.type.startsWith('audio/');

                            return (
                              <div
                                key={m.id}
                                style={{
                                  background: 'white',
                                  padding: '0.5rem',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--color-border)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.5rem',
                                  position: 'relative'
                                }}
                              >
                                {/* Media Preview Elements */}
                                <div style={{ aspectRatio: '16/10', borderRadius: '4px', overflow: 'hidden', background: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                  {isImg && <img src={m.url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                  {isVid && (
                                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                      <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        <Video size={10} /> VÍDEO
                                      </span>
                                    </div>
                                  )}
                                  {isAud && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary-light)' }}>
                                      <Volume2 size={32} />
                                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>ÁUDIO REGISTRADO</span>
                                    </div>
                                  )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                                    {m.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMedia(m.id)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--color-danger)',
                                      cursor: 'pointer',
                                      padding: '2px'
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Form submissions block */}
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', minWidth: '180px', justifyContent: 'center' }}
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="spin-animation" size={18} />
                            <span>Analisando...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            <span>Solicitar Análise IA</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </form>
              </div>

            </div>
          )}

          {/* Historic and details tab */}
          {activeTab === 'historico' && (
            <div style={{ minHeight: '50vh' }}>
              {selectedAnalysis ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                  {/* REQUEST GENERAL CARD */}
                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Cultura Analisada:</span>
                        <h3 style={{ fontSize: '1.4rem' }}>{selectedAnalysis.cultura}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {getStatusBadge(selectedAnalysis.status)}
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                          {new Date(selectedAnalysis.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                        Relato Técnico / Problema Informado:
                      </strong>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', whiteSpace: 'pre-wrap' }}>
                        {selectedAnalysis.problema}
                      </p>
                    </div>

                    {/* View loaded medias */}
                    {selectedAnalysis.midiasLoaded && selectedAnalysis.midiasLoaded.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                          Mídias e Evidências Enviadas:
                        </strong>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {selectedAnalysis.midiasLoaded.map((m, idx) => {
                            const isImg = m.type?.startsWith('image/');
                            const isVid = m.type?.startsWith('video/');
                            const isAud = m.type?.startsWith('audio/');

                            return (
                              <div
                                key={m.id || idx}
                                style={{
                                  width: '140px',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: 'var(--radius-sm)',
                                  overflow: 'hidden',
                                  background: 'white',
                                  padding: '4px'
                                }}
                              >
                                <div style={{ height: '80px', background: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '4px', overflow: 'hidden' }}>
                                  {isImg && m.url && <img src={m.url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                  {isVid && m.url && <video src={m.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                  {isAud && m.url && <audio src={m.url} controls style={{ width: '120px' }} />}
                                  {m.isLocal && !m.url && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', textAlign: 'center', padding: '0.25rem' }}>
                                      Carregando...
                                    </div>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', padding: '4px 2px 2px 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                                  {m.name}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LOADING STATE LOG */}
                  {selectedAnalysis.status === 'Analisando' && (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <RefreshCw className="spin-animation" size={48} style={{ color: 'var(--color-accent)' }} />
                      <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>A Inteligência Artificial está analisando os dados...</h4>
                        <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                          Processando descrição técnica, transcrevendo arquivos de áudio e inspecionando visualmente fotos/vídeos.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* FAILED STATE LOG */}
                  {selectedAnalysis.status === 'Falhou' && (
                    <div className="alert-danger" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                      <div>
                        <strong style={{ fontSize: '1rem' }}>Erro na Análise Agronômica</strong>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{selectedAnalysis.resultado?.observacoes}</p>
                      </div>
                    </div>
                  )}

                  {/* SUCCESS DETAILED AI REPORT DISPLAY */}
                  {selectedAnalysis.status === 'Concluído' && selectedAnalysis.resultado && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                      {/* DIAGNOSIS SUMMARY HEADER */}
                      <div className="glass-card" style={{
                        padding: '2rem',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '1.5rem',
                        alignItems: 'center',
                        borderLeft: `6px solid ${getSeverityColor(selectedAnalysis.resultado.severidade).text}`
                      }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                            Diagnóstico Agronômico
                          </span>
                          <h2 style={{ fontSize: '1.8rem', marginTop: '0.25rem', color: 'var(--color-primary)' }}>
                            {selectedAnalysis.resultado.diagnostico}
                          </h2>
                        </div>

                        {/* Badges metrics side by side */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          {/* Confidence level */}
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', display: 'block' }}>Confiança da IA</span>
                            <strong style={{ fontSize: '1.5rem', color: 'var(--color-primary-light)' }}>
                              {selectedAnalysis.resultado.confianca}%
                            </strong>
                          </div>

                          {/* Severity badge */}
                          <div style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${getSeverityColor(selectedAnalysis.resultado.severidade).border}`,
                            background: getSeverityColor(selectedAnalysis.resultado.severidade).bg,
                            color: getSeverityColor(selectedAnalysis.resultado.severidade).text,
                            fontWeight: 'bold',
                            fontSize: '0.85rem'
                          }}>
                            SEVERIDADE: {selectedAnalysis.resultado.severidade?.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {/* DETAILED CONTENTS GRID */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                        {/* Causes Card */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <AlertTriangle size={18} style={{ color: 'var(--color-accent)' }} />
                            Possíveis Causas
                          </h4>
                          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                            {selectedAnalysis.resultado.causas?.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Recommendations Card */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
                            Recomendações de Manejo
                          </h4>
                          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                            {selectedAnalysis.resultado.recomendacoes?.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Next Steps / Plan */}
                        <div className="glass-card" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <ArrowRight size={18} style={{ color: 'var(--color-primary-light)' }} />
                            Próximos Passos (Plano de Ação)
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selectedAnalysis.resultado.proximosPassos?.map((p, i) => (
                              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                                <span style={{
                                  background: 'var(--color-primary)',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  flexShrink: 0,
                                  marginTop: '2px'
                                }}>
                                  {i + 1}
                                </span>
                                <span>{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Extra observations */}
                        {selectedAnalysis.resultado.observacoes && (
                          <div className="glass-card" style={{ padding: '1.5rem', gridColumn: 'span 2', background: 'rgba(82, 183, 136, 0.02)' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Observações Agronômicas</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', lineHeight: '1.5' }}>
                              {selectedAnalysis.resultado.observacoes}
                            </p>
                          </div>
                        )}

                      </div>

                    </div>
                  )}

                </div>
              ) : (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <ImageIcon size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--color-text-light)' }}>
                    Selecione um diagnóstico do histórico na barra lateral para visualizar o relatório fitossanitário estruturado.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Embedded CSS Animations */}
      <style>{`
        .pulse-animation {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .history-item-card:hover {
          background: rgba(82, 183, 136, 0.04) !important;
          border-color: var(--color-secondary-light) !important;
        }
      `}</style>

    </div>
  );
}
