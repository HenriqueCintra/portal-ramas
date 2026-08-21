import { analyzeWithOpenAI } from './providers/openai';
import { analyzeWithGemini } from './providers/gemini';
import { analyzeWithClaude } from './providers/claude';

/**
 * Extracts keyframes from a video file using a hidden video element and canvas.
 * @param {Blob} videoBlob
 * @param {number} numFrames Number of frames to extract
 * @returns {Promise<Array>} Array of image objects with base64 data URLs
 */
export function extractVideoFrames(videoBlob, numFrames = 3) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    // Set style to ensure it's not rendered on screen
    video.style.position = 'absolute';
    video.style.width = '0px';
    video.style.height = '0px';
    video.style.left = '-10000px';
    document.body.appendChild(video);

    const fileURL = URL.createObjectURL(videoBlob);
    video.src = fileURL;
    
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      if (!duration || isNaN(duration)) {
        document.body.removeChild(video);
        resolve([]);
        return;
      }
      
      const frames = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Extract frames at 25%, 50%, and 75% of video length
      const percentages = [0.25, 0.50, 0.75];
      
      for (let i = 0; i < Math.min(numFrames, percentages.length); i++) {
        const time = duration * percentages[i];
        
        await new Promise((r) => {
          video.currentTime = time;
          video.onseeked = r;
        });
        
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          frames.push({
            id: `frame_${i}_${Date.now()}`,
            name: `video_frame_${i + 1}.jpg`,
            type: 'image/jpeg',
            url: dataUrl,
            isFrame: true
          });
        } catch (e) {
          console.error('Erro ao converter frame de vídeo para DataURL:', e);
        }
      }
      
      URL.revokeObjectURL(fileURL);
      document.body.removeChild(video);
      resolve(frames);
    };
    
    video.onerror = () => {
      console.error('Erro ao carregar vídeo para extrair frames');
      if (video.parentNode) {
        document.body.removeChild(video);
      }
      resolve([]);
    };
  });
}

/**
 * Simulates a high-quality agronomic diagnostic report based on crop and problem.
 */
async function generateMockDiagnosis(culture, problem) {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const text = (culture + ' ' + problem).toLowerCase();
  
  if (text.includes('mandioca') || text.includes('maniva')) {
    if (text.includes('amarela') || text.includes('enrug') || text.includes('mosaico')) {
      return {
        diagnostico: 'Mosaico Comum da Mandioca (Virus / CVD)',
        confianca: 94,
        severidade: 'Alto',
        causas: [
          'Transmissão por vetores como a mosca-branca (Bemisia tabaci).',
          'Utilização de manivas-semente contaminadas de safras anteriores.',
          'Propagação mecânica através de ferramentas de corte não esterilizadas.'
        ],
        recomendacoes: [
          'Erradicação e queima imediata das plantas afetadas (roguing).',
          'Desinfecção de facas e ferramentas com solução de água sanitária a 10% ou álcool 70% entre plantas.',
          'Aquisição de manivas livres de vírus em campos de multiplicação certificados (ex: IPA ou EMBRAPA).'
        ],
        proximosPassos: [
          'Vistoriar o mandiocal semanalmente e isolar novos focos.',
          'Aplicar caldas repelentes naturais (calda de nim a 1%) para controle da mosca-branca.',
          'Planejar a próxima rotação de cultura com leguminosas na área afetada.'
        ],
        observacoes: 'A variedade BRS Kiriris e BRS Gema de Ovo têm certa tolerância, mas ainda assim podem expressar sintomas sob alta pressão do vetor.'
      };
    } else {
      return {
        diagnostico: 'Podridão Radicular da Mandioca (Phytophthora / Fusarium)',
        confianca: 88,
        severidade: 'Crítico',
        causas: [
          'Excesso de umidade no solo decorrente de drenagem inadequada ou chuvas intensas.',
          'Plantio em áreas baixas e propensas a alagamento.',
          'Presença de fungos fitopatógenos no solo.'
        ],
        recomendacoes: [
          'Evitar o plantio em solos pesados, compactados e mal drenados.',
          'Fazer o plantio em camalhões (leiras altas) para favorecer o escoamento de água.',
          'Realizar rotação de culturas com milho ou feijão por no mínimo 2 anos.'
        ],
        proximosPassos: [
          'Suspender irrigações por gotejamento excessivas na área afetada.',
          'Retirar plantas mortas e expor o solo ao sol (solarização) antes de novos plantios.'
        ],
        observacoes: 'Doença severa que destrói as raízes comerciais rapidamente, inviabilizando a colheita.'
      };
    }
  }

  if (text.includes('milho')) {
    if (text.includes('lagarta') || text.includes('furo') || text.includes('cartucho')) {
      return {
        diagnostico: 'Lagarta-do-cartucho (Spodoptera frugiperda)',
        confianca: 96,
        severidade: 'Médio',
        causas: [
          'Clima quente e seco que acelera o ciclo evolutivo da mariposa.',
          'Ausência de inimigos naturais (tesourinhas, vespinhas Trichogramma) na área.',
          'Plantios tardios adjacentes a lavouras já infestadas.'
        ],
        recomendacoes: [
          'Aplicação de inseticida biológico à base de Bacillus thuringiensis (Bt) direcionada para o cartucho.',
          'Uso de extrato aquoso de folhas de nim ou calda de fumo.',
          'Preservação de predadores naturais evitando defensivos químicos de largo espectro.'
        ],
        proximosPassos: [
          'Monitorar o cartucho do milho a cada 3 dias.',
          'Aplicar o defensivo biológico preferencialmente no fim da tarde.'
        ],
        observacoes: 'A lagarta-do-cartucho ataca desde a emergência até o pendoamento. O controle inicial evita perdas expressivas de área foliar.'
      };
    } else {
      return {
        diagnostico: 'Ferrugem Polissora do Milho (Puccinia polysora)',
        confianca: 90,
        severidade: 'Médio',
        causas: [
          'Condições de alta temperatura (25°C a 30°C) e umidade relativa elevada.',
          'Uso de híbridos ou variedades suscetíveis.',
          'Densidade de plantio excessiva que impede o arejamento da lavoura.'
        ],
        recomendacoes: [
          'Utilizar variedades ou cultivares com resistência genética à ferrugem.',
          'Ajustar o espaçamento de plantio para permitir melhor circulação de ar.',
          'Evitar irrigações por aspersão no final da tarde, reduzindo o período de molhamento foliar.'
        ],
        proximosPassos: [
          'Realizar o monitoramento das folhas baixeiras buscando pústulas circulares de cor marrom-claro.',
          'Se a infecção atingir mais de 10% da área foliar antes do pendoamento, planejar controle fitossanitário recomendado.'
        ],
        observacoes: 'A doença pode reduzir o peso de grãos devido à perda de área fotossintética útil.'
      };
    }
  }

  if (text.includes('feijão') || text.includes('feijao')) {
    return {
      diagnostico: 'Antracnose do Feijoeiro (Colletotrichum lindemuthianum)',
      confianca: 92,
      severidade: 'Alto',
      causas: [
        'Uso de sementes infectadas.',
        'Alta umidade relativa do ar aliada a temperaturas amenas (18°C a 22°C).',
        'Sobrevivência do fungo em restos culturais da safra anterior.'
      ],
      recomendacoes: [
        'Utilização de sementes sadias e certificadas.',
        'Eliminação e queima de restos culturais após a colheita.',
        'Evitar trabalhar na lavoura quando as plantas estiverem molhadas para não disseminar os esporos.'
      ],
      proximosPassos: [
        'Aplicar calda bordalesa a 1% de forma preventiva ou logo no início dos sintomas nas folhas baixeiras.',
        'Adotar rotação de culturas com gramíneas (ex: milho).'
      ],
      observacoes: 'Sintomas típicos incluem nervuras das folhas com coloração escura/avermelhada e lesões deprimidas nos caules e vagens.'
    };
  }

  // Fallback diagnostic
  return {
    diagnostico: 'Infestação Geral por Pragas Sugadoras (Pulgões / Cochonilhas)',
    confianca: 85,
    severidade: 'Baixo',
    causas: [
      'Desequilíbrio ecológico local com ausência de joaninhas e outros predadores.',
      'Condições de estresse hídrico na planta que a torna mais suscetível.',
      'Excesso de adubação nitrogenada, que atrai insetos sugadores devido ao aumento de seiva.'
    ],
    recomendacoes: [
      'Pulverização com calda de sabão neutro a 1% ou óleo mineral/vegetal para sufocar os insetos.',
      'Podas de limpeza nas partes mais atacadas.',
      'Equilibrar a adubação e manter a irrigação adequada.'
    ],
    proximosPassos: [
      'Fazer aplicação semanal da calda de sabão até o desaparecimento da praga.',
      'Estimular plantas companheiras aromáticas nas bordas do plantio para repelir pragas.'
    ],
    observacoes: 'Insetos sugadores secretam substâncias açucaradas que atraem formigas e favorecem o aparecimento de fumagina (fungo preto).'
  };
}

/**
 * Main Orchestrator for AI Agronomic Diagnosis.
 * Handles Mock Mode, video frame extraction, and provider routing.
 */
export async function analyzeProblem({
  culture,
  problem,
  mediaFiles = [],
  provider = 'gemini',
  model = '',
  apiKey = '',
  isMock = false
}) {
  console.log(`Iniciando análise. Provedor: ${provider}, Modelo: ${model}, Mock: ${isMock}`);
  
  if (isMock) {
    return await generateMockDiagnosis(culture, problem);
  }

  if (!apiKey) {
    throw new Error('Uma Chave API é necessária para realizar a análise real.');
  }

  // 1. Process media files. Extract frames from video files.
  const processedMedia = [];

  for (const media of mediaFiles) {
    if (media.type.startsWith('video/')) {
      try {
        console.log(`Extraindo frames do vídeo: ${media.name}`);
        let blob = media.blob;
        if (!blob && media.url && !media.url.startsWith('data:')) {
          const res = await fetch(media.url);
          blob = await res.blob();
        }
        
        if (blob) {
          const frames = await extractVideoFrames(blob, 2);
          processedMedia.push(...frames);
        }
      } catch (err) {
        console.error('Falha ao extrair frames do vídeo:', err);
      }
    } else {
      processedMedia.push(media);
    }
  }

  // 2. Route request to appropriate AI provider
  const lowercaseProvider = provider.toLowerCase();
  
  if (lowercaseProvider === 'openai') {
    const selectedModel = model || 'gpt-4o-mini';
    return await analyzeWithOpenAI({
      culture,
      problem,
      mediaFiles: processedMedia,
      apiKey,
      model: selectedModel
    });
  } else if (lowercaseProvider === 'gemini') {
    const selectedModel = model || 'gemini-3.5-flash';
    return await analyzeWithGemini({
      culture,
      problem,
      mediaFiles: processedMedia,
      apiKey,
      model: selectedModel
    });
  } else if (lowercaseProvider === 'claude') {
    const selectedModel = model || 'claude-3-5-sonnet';
    return await analyzeWithClaude({
      culture,
      problem,
      mediaFiles: processedMedia,
      apiKey,
      model: selectedModel
    });
  } else {
    throw new Error(`Provedor de IA desconhecido: ${provider}`);
  }
}
