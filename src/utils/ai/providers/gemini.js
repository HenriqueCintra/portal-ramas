/**
 * Gemini API Integration Provider
 */
export async function analyzeWithGemini({ culture, problem, mediaFiles, apiKey, model = 'gemini-3.5-flash' }) {
  if (!apiKey) {
    throw new Error('Chave de API do Gemini não fornecida.');
  }

  const parts = [];

  // 1. Convert media files (images, audio, video frames) to Gemini inlineData parts
  for (const file of mediaFiles) {
    let base64Data = '';
    if (file.url && file.url.startsWith('data:')) {
      base64Data = file.url.split(',')[1];
    } else {
      try {
        let blob = file.blob;
        if (!blob && file.url) {
          const response = await fetch(file.url);
          blob = await response.blob();
        }
        if (blob) {
          const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          base64Data = dataUrl.split(',')[1];
        }
      } catch (err) {
        console.error('Erro ao converter arquivo para base64 para o Gemini:', err);
      }
    }

    if (base64Data) {
      let mimeType = file.type || 'image/jpeg';
      if (file.isFrame) mimeType = 'image/jpeg';
      // Only add supported media types (image and audio)
      if (mimeType.startsWith('image/') || mimeType.startsWith('audio/')) {
        parts.push({ inlineData: { mimeType, data: base64Data } });
      }
    }
  }

  // 2. Assemble prompt — request raw JSON explicitly, no markdown
  const hasMedia = parts.length > 0;
  const promptText = `Você é um agrônomo especialista sênior em diagnóstico fitossanitário e manejo de lavouras.
Analise a seguinte consulta de campo:

CULTURA: ${culture}
DESCRIÇÃO DO PROBLEMA: ${problem || '(Nenhuma descrição textual fornecida)'}
${hasMedia ? '\nAnalise também todas as mídias anexadas. Se houver áudio, incorpore os detalhes falados. Se houver imagens de folhas, frutos ou caule, verifique pragas, fungos, vírus ou deficiências nutricionais.' : ''}

INSTRUÇÃO CRÍTICA: Sua resposta DEVE ser exclusivamente um objeto JSON puro e válido.
NÃO use blocos de código markdown (\`\`\`), NÃO inclua texto antes ou depois do JSON.
Comece diretamente com { e termine com }.

Estrutura OBRIGATÓRIA:
{
  "diagnostico": "Nome do diagnóstico mais provável",
  "confianca": 85,
  "severidade": "Médio",
  "causas": ["Causa provável 1", "Causa provável 2"],
  "recomendacoes": ["Recomendação de manejo 1", "Recomendação de manejo 2"],
  "proximosPassos": ["Próximo passo 1", "Próximo passo 2"],
  "observacoes": "Observações adicionais relevantes."
}

Regras obrigatórias:
- "confianca": número inteiro entre 0 e 100 (sem %)
- "severidade": SOMENTE uma das opções: "Baixo", "Médio", "Alto" ou "Crítico"
- "causas", "recomendacoes", "proximosPassos": arrays com pelo menos 2 itens cada`;

  parts.unshift({ text: promptText });

  // 3. Call Gemini API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `Erro na API Gemini (${response.status})`;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage += `: ${errorJson.error?.message || errorBody}`;
    } catch {
      errorMessage += `: ${errorBody}`;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();

  // 4. Extract JSON content from the response
  let rawText = '';
  try {
    rawText = result.candidates[0].content.parts[0].text || '';
  } catch {
    console.error('Resposta inesperada do Gemini:', result);
    throw new Error('Resposta da API Gemini em formato inesperado.');
  }

  const jsonText = extractJson(rawText);
  if (!jsonText) {
    console.error('Não foi possível extrair JSON da resposta do Gemini:', rawText);
    throw new Error('A IA não retornou um diagnóstico em formato válido. Reformule a descrição e tente novamente.');
  }

  try {
    return JSON.parse(jsonText);
  } catch (parseErr) {
    console.error('Erro ao fazer parse do JSON do Gemini:', jsonText, parseErr);
    throw new Error('O Gemini retornou JSON inválido. Tente novamente.');
  }
}

/**
 * Extracts a JSON object string from text that may contain markdown code blocks.
 */
function extractJson(text) {
  if (!text) return null;
  const trimmed = text.trim();

  // 1. Already a raw JSON object
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  // 2. Inside ```json ... ``` or ``` ... ```
  const blockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (blockMatch) return blockMatch[1].trim();

  // 3. Find first { to last } in the text
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }

  return null;
}

