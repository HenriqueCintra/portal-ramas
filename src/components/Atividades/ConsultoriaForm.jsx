import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Upload, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { getEntities, saveEntity } from '../../utils/storage';

export default function ConsultoriaForm() {
  const [submitted, setSubmitted] = useState(false);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    local: '',
    responsavelLocal: '',
    tamanhoArea: '',
    sistemaIrrigacao: '',
    variedades: '',
    etapasManejo: '',
    cronogramaPresencial: '',
    cronogramaDistancia: '',
    bolsistaResponsavel: '',
    pesquisadorResponsavel: ''
  });

  // Load last saved Consultoria Técnica on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getEntities('consultoria');
        if (data && data.length > 0) {
          const latest = data[data.length - 1];
          setFormData({
            id: latest.id,
            local: latest.local || '',
            responsavelLocal: latest.responsavelLocal || '',
            tamanhoArea: latest.tamanhoArea || '',
            sistemaIrrigacao: latest.sistemaIrrigacao || '',
            variedades: latest.variedades || '',
            etapasManejo: latest.etapasManejo || '',
            cronogramaPresencial: latest.cronogramaPresencial || '',
            cronogramaDistancia: latest.cronogramaDistancia || '',
            bolsistaResponsavel: latest.bolsistaResponsavel || '',
            pesquisadorResponsavel: latest.pesquisadorResponsavel || ''
          });
        }
      } catch (e) {
        console.error("Erro ao carregar consultoria do banco:", e);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create local object URLs for previews
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      await saveEntity('consultoria', formData);
    } catch (e) {
      console.error("Erro ao salvar consultoria no banco:", e);
    }
    
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={28} style={{ color: 'var(--color-secondary)' }} />
          Consultoria Técnica
        </h2>
        <p style={{ color: 'var(--color-text-light)' }}>Lançamento de visitas de campo, relatórios de manejo e recomendações técnicas.</p>
      </div>

      {submitted && (
        <div className="alert-success">
          <CheckCircle2 size={24} />
          <div>
            <strong>Visita de Consultoria Técnica salva com sucesso!</strong>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          
          <div className="form-section-title">
            Dados da Área Visitada
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Local / Propriedade / Comunidade *</label>
            <input
              type="text"
              name="local"
              className="form-control"
              required
              value={formData.local}
              onChange={handleInputChange}
              placeholder="Ex: Sítio Jatobá, Buíque - PE"
            />
          </div>

          <div className="form-group">
            <label>Responsável Local (Produtor) *</label>
            <input
              type="text"
              name="responsavelLocal"
              className="form-control"
              required
              value={formData.responsavelLocal}
              onChange={handleInputChange}
              placeholder="Nome do produtor que recebeu a visita"
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
              placeholder="Ex: 2.3"
            />
          </div>

          <div className="form-group">
            <label>Sistema de Irrigação Ativo</label>
            <input
              type="text"
              name="sistemaIrrigacao"
              className="form-control"
              value={formData.sistemaIrrigacao}
              onChange={handleInputChange}
              placeholder="Ex: Gotejamento"
            />
          </div>

          <div className="form-group">
            <label>Variedades Cultivadas (Foco)</label>
            <input
              type="text"
              name="variedades"
              className="form-control"
              value={formData.variedades}
              onChange={handleInputChange}
              placeholder="Ex: BRS Kiriris, BRS Gema de Ovo"
            />
          </div>

          <div className="form-section-title">
            Recomendações e Acompanhamento
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Etapas do Manejo Realizadas / Recomendadas *</label>
            <textarea
              name="etapasManejo"
              className="form-control"
              rows="3"
              required
              value={formData.etapasManejo}
              onChange={handleInputChange}
              placeholder="Descreva as orientações fornecidas, tratamentos de solo, pragas, podas, etc."
            />
          </div>

          <div className="form-group">
            <label>Próxima Visita Presencial (Cronograma)</label>
            <input
              type="date"
              name="cronogramaPresencial"
              className="form-control"
              value={formData.cronogramaPresencial}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Próximo Contato à Distância</label>
            <input
              type="date"
              name="cronogramaDistancia"
              className="form-control"
              value={formData.cronogramaDistancia}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Bolsista Responsável *</label>
            <input
              type="text"
              name="bolsistaResponsavel"
              className="form-control"
              required
              value={formData.bolsistaResponsavel}
              onChange={handleInputChange}
              placeholder="Nome do bolsista do projeto"
            />
          </div>

          <div className="form-group">
            <label>Pesquisador Responsável *</label>
            <input
              type="text"
              name="pesquisadorResponsavel"
              className="form-control"
              required
              value={formData.pesquisadorResponsavel}
              onChange={handleInputChange}
              placeholder="Nome do orientador ou pesquisador"
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Evidências Fotográficas (Upload de Fotos)</label>
            <div className="upload-zone" onClick={handleUploadClick}>
              <Upload size={32} className="upload-icon" />
              <div className="upload-text">
                <span>Clique para selecionar</span> ou arraste as fotos de campo aqui
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {images.length > 0 && (
              <div className="preview-grid">
                {images.map((img) => (
                  <div key={img.id} className="preview-item">
                    <img src={img.url} alt={img.name} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="remove-img-btn"
                      title="Excluir Foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn btn-primary">
            Salvar Consultoria
          </button>
        </div>
      </form>
    </div>
  );
}
