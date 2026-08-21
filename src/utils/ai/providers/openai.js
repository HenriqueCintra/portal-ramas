/**
 * OpenAI API Integration Provider
 */
export async function analyzeWithOpenAI({ culture, problem, mediaFiles, apiKey, model = 'gpt-4o-mini' }) {
  if (!apiKey) {
    throw new Error('Chave de API do OpenAI não fornecida.');
  }

  // 1. Check for audio files and transcribe them using Whisper API
  const audioFiles = mediaFiles.filter(m => m.type.startsWith('audio/'));
  const audioTranscripts = [];

  for (const audio of audioFiles) {
    try {
      const formData = new FormData();
      // If we have a local blob url, fetch the blob data
      let blob = audio.blob;
      if (!blob && audio.url) {
        const response = await fetch(audio.url);
        blob = await response.blob();
      }
      
      if (blob) {
        // Whisper accepts files with extensions like mp3, wav, m4a, etc.
        const fileExt = audio.name ? audio.name.split('.').pop() : 'wav';
        const file = new File([blob], `audio.${fileExt}`, { type: audio.type });
        formData.append('file', file);
        formData.append('model', 'whisper-1');

        const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          body: formData
        });

        if (whisperRes.ok) {
          const whisperData = await whisperRes.json();
          if (whisperData.text) {
            audioTranscripts.push(`[Áudio Transcrito - ${audio.name}]: ${whisperData.text}`);
          }
        } else {
          const errText = await whisperRes.text();
          console.warn('Erro na transcrição do áudio via Whisper:', errText);
        }
      }
    } catch (err) {
      console.error('Erro ao transcrever áudio:', err);
    }
  }

  // 2. Prepare visual files (images and video frames)
  const imageParts = [];
  const visualFiles = mediaFiles.filter(m => m.type.startsWith('image/') || m.isFrame);

  for (const file of visualFiles) {
    let base64Data = '';
    if (file.url && file.url.startsWith('data:')) {
      base64Data = file.url;
    } else {
      // Convert to base64 if it's a blob url or raw blob
      try {
        let blob = file.blob;
        if (!blob && file.url) {
          const response = await fetch(file.url);
          blob = await response.blob();
        }
        if (blob) {
          base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } catch (err) {
        console.error('Erro ao converter imagem/frame para base64:', err);
      }
    }

    if (base64Data) {
      imageParts.push({
        type: 'image_url',
        image_url: {
          url: base64Data
        }
      });
    }
  }

  // 3. Assemble Prompt & Context
  const userTextPrompt = `
Você é um agrônomo especialista sênior em diagnóstico de culturas e fitossanidade.
Por favor, analise a seguinte consulta de campo de forma aprofundada:

CULTURA: ${culture}
DESCRIÇÃO DO PROBLEMA: ${problem}

${audioTranscripts.length > 0 ? `ÁUDIOS DE CAMPO TRANSCRITOS:\n${audioTranscripts.join('\n')}\n` : ''}
${visualFiles.length > 0 ? `IMAGENS/FRAMES ANEXADOS: Foram enviadas ${visualFiles.length} imagens/capturas visuais do problema. Analise-as com precisão.` : 'Nenhuma imagem foi anexada.'}

Você DEVE responder estritamente no formato JSON abaixo, traduzido para Português, sem blocos de código markdown ou texto explicativo extra fora do JSON.

Estrutura do JSON Esperada:
{
  "diagnostico": "Nome do diagnóstico mais provável da doença, praga ou deficiência nutricional.",
  "confianca": 85, // Grau de confiança estimado como um número inteiro de 0 a 100
  "severidade": "Baixo", // Escolha estritamente entre: "Baixo", "Médio", "Alto", "Crítico"
  "causas": [
    "Causa mais provável 1 (ex: presença do vetor mosca-branca)",
    "Causa mais provável 2"
  ],
  "recomendacoes": [
    "Recomendação de manejo imediato 1",
    "Recomendação de manejo imediato 2"
  ],
  "proximosPassos": [
    "Próximo passo de monitoramento ou aplicação 1",
    "Próximo passo de monitoramento ou aplicação 2"
  ],
  "observacoes": "Observações adicionais ou notas de campo agronômicas."
}
`;

  // 4. Send request to OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em agronomia de precisão e deve retornar diagnósticos fitossanitários estruturados em formato JSON estrito.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: userTextPrompt },
            ...imageParts
          ]
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro na API OpenAI (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  const choice = result.choices[0];
  
  if (!choice || !choice.message || !choice.message.content) {
    throw new Error('Resposta vazia da OpenAI.');
  }

  try {
    return JSON.parse(choice.message.content.trim());
  } catch (parseErr) {
    console.error('Erro ao fazer o parse do JSON retornado pela OpenAI:', choice.message.content, parseErr);
    throw new Error('A IA não retornou um JSON válido. Conteúdo recebido: ' + choice.message.content);
  }
}
