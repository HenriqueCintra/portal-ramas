/**
 * Claude API Integration Provider (Stub for future scaling)
 */
export async function analyzeWithClaude({ culture, problem, mediaFiles, apiKey, model = 'claude-3-5-sonnet' }) {
  if (!apiKey) {
    throw new Error('Chave de API do Claude não fornecida.');
  }

  // Anthropic Claude requires server-side proxies or specific CORS setups since they discourage direct browser access.
  // For the frontend architecture, here is the structure that will make swapping in Claude easy:
  console.log('Claude Provider called with:', { culture, problem, mediaCount: mediaFiles.length, model });

  throw new Error(
    'O provedor Claude (Anthropic) está estruturado para expansão futura, mas atualmente não está ativo devido a restrições de CORS da API direta no navegador. Por favor, utilize OpenAI ou Gemini.'
  );
}
