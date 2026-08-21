// Utility to handle LocalStorage persistence, Supabase online sync, and seeding mock data
import { getSupabase } from './supabaseClient';

const STORAGE_KEYS = {
  produtor: 'final_cadastro_produtor',
  associacao: 'final_cadastro_associacao',
  prefeitura: 'final_cadastro_prefeitura',
  escola: 'final_cadastro_escola',
  instituicao: 'final_cadastro_instituicao',
  parceiro: 'final_cadastro_parceiro',
  doacoes: 'final_doacoes_data',
  financeiro: 'final_financeiro_transactions',
  eventos: 'final_eventos_data',
  caderno: 'final_caderno_campo_data',
  consultoria: 'final_consultoria_data',
  consultoria_inteligente: 'final_consultoria_inteligente_data'
};

const TABLE_MAPPING = {
  produtor: 'produtores',
  associacao: 'associacoes',
  prefeitura: 'prefeituras',
  escola: 'escolas',
  instituicao: 'instituicoes',
  parceiro: 'parceiros',
  doacoes: 'doacoes',
  financeiro: 'financeiro',
  eventos: 'eventos',
  caderno: 'caderno_campo',
  consultoria: 'consultoria',
  consultoria_inteligente: 'consultoria_inteligente'
};

// Seed Mock Data
const MOCK_DATA = {
  produtor: [
    {
      id: 'p1',
      nomeCompleto: 'João Rodrigues Santos',
      cpf: '123.456.789-01',
      email: 'joao.rodrigues@gmail.com',
      escolaridade: 'Fundamental Incompleto',
      telefone: '(87) 99122-3344',
      rendaMensal: 'R$ 1.500,00',
      estadoCivil: 'Casado',
      sexo: 'Masculino',
      idade: 45,
      integrantesFamilia: '4',
      atividadePrincipal: 'Agricultura Familiar',
      atividadeSecundaria: 'Pecuária de Subsistência',
      programaRenda: 'Sim',
      localizacao: 'Assentamento Nova Esperança, Buíque - PE',
      tamanhoArea: '12',
      disponibilidadeAgua: ['Cisterna', 'Poço Artesiano'],
      fazIrrigacao: 'Sim',
      tipoIrrigacao: 'Gotejamento',
      culturasCultivadas: 'Mandioca BRS Kiriris, Feijão Caupi',
      destinoVenda: 'Feira Local, Merenda Escolar'
    },
    {
      id: 'p2',
      nomeCompleto: 'Maria da Conceição Silva',
      cpf: '987.654.321-02',
      email: 'maria.conceicao@gmail.com',
      escolaridade: 'Fundamental Completo',
      telefone: '(87) 99877-6655',
      rendaMensal: 'R$ 1.200,00',
      estadoCivil: 'Viúva',
      sexo: 'Feminino',
      idade: 62,
      integrantesFamilia: '2',
      atividadePrincipal: 'Agricultura Familiar',
      atividadeSecundaria: 'Artesanato',
      programaRenda: 'Não',
      localizacao: 'Sítio Poço Verde, Arcoverde - PE',
      tamanhoArea: '5',
      disponibilidadeAgua: ['Cisterna'],
      fazIrrigacao: 'Não',
      tipoIrrigacao: '',
      culturasCultivadas: 'Milho Biofortificado, Feijão Caupi',
      destinoVenda: 'Consumo Próprio, Venda Direta'
    },
    {
      id: 'p3',
      nomeCompleto: 'Sebastião Alves de Souza',
      cpf: '456.789.012-03',
      email: 'sebastiao.alves@gmail.com',
      escolaridade: 'Alfabetizado',
      telefone: '(87) 98877-1122',
      rendaMensal: 'R$ 1.800,00',
      estadoCivil: 'Casado',
      sexo: 'Masculino',
      idade: 58,
      integrantesFamilia: '5',
      atividadePrincipal: 'Agricultura Familiar',
      atividadeSecundaria: 'Apicultura',
      programaRenda: 'Sim',
      localizacao: 'Comunidade Quilombola Melancia, Buíque - PE',
      tamanhoArea: '8',
      disponibilidadeAgua: ['Cisterna', 'Barragem'],
      fazIrrigacao: 'Sim',
      tipoIrrigacao: 'Microaspersão',
      culturasCultivadas: 'Batata-doce BRS Amélia, Mandioca BRS Gema de Ovo',
      destinoVenda: 'Associação, Feira Local'
    },
    {
      id: 'p4',
      nomeCompleto: 'Francisca Sales de Lima',
      cpf: '321.654.987-04',
      email: 'francisca.lima@outlook.com',
      escolaridade: 'Médio Completo',
      telefone: '(87) 99654-7890',
      rendaMensal: 'R$ 2.500,00',
      estadoCivil: 'Solteira',
      sexo: 'Feminino',
      idade: 31,
      integrantesFamilia: '3',
      atividadePrincipal: 'Pecuária Leiteira',
      atividadeSecundaria: 'Agricultura Familiar',
      programaRenda: 'Não',
      localizacao: 'Sítio Baixa Grande, Buíque - PE',
      tamanhoArea: '15',
      disponibilidadeAgua: ['Poço Artesiano', 'Açude'],
      fazIrrigacao: 'Não',
      tipoIrrigacao: '',
      culturasCultivadas: 'Feijão, Mandioca, Milho',
      destinoVenda: 'Laticínio local, Cooperativa'
    },
    {
      id: 'p5',
      nomeCompleto: 'Antônio Marcos Cavalcante',
      cpf: '789.012.345-05',
      email: 'marcos.cavalcante@hotmail.com',
      escolaridade: 'Médio Incompleto',
      telefone: '(87) 99123-4567',
      rendaMensal: 'R$ 2.000,00',
      estadoCivil: 'Casado',
      sexo: 'Masculino',
      idade: 39,
      integrantesFamilia: '4',
      atividadePrincipal: 'Horticultura',
      atividadeSecundaria: 'Piscicultura',
      programaRenda: 'Não',
      localizacao: 'Assentamento São José, Arcoverde - PE',
      tamanhoArea: '10',
      disponibilidadeAgua: ['Cisterna', 'Poço Artesiano'],
      fazIrrigacao: 'Sim',
      tipoIrrigacao: 'Gotejamento',
      culturasCultivadas: 'Hortaliças, Mandioca',
      destinoVenda: 'Supermercados locais'
    }
  ],
  associacao: [
    {
      id: 'a1',
      nomeCompleto: 'Associação de Produtores Agroecológicos de Buíque',
      cnpj: '12.345.678/0001-90',
      localizacao: 'Distrito de Carneiro, Buíque - PE',
      numeroAssociados: '45',
      culturasProduzidas: 'Mandioca, Feijão, Batata-doce',
      principaisClientes: 'PNAE (Merenda Escolar), CONAB (PAA), Feira Orgânica'
    },
    {
      id: 'a2',
      nomeCompleto: 'Cooperativa de Agricultores Familiares do Sertão (COOFASP)',
      cnpj: '98.765.432/0001-10',
      localizacao: 'Bairro São Cristóvão, Arcoverde - PE',
      numeroAssociados: '120',
      culturasProduzidas: 'Derivados de Mandioca (Farinha, Goma), Mel, Milho',
      principaisClientes: 'Supermercados da Região, PNAE Estadual, Venda Direta'
    }
  ],
  prefeitura: [
    {
      id: 'pr1',
      nome: 'Prefeitura Municipal de Buíque',
      cnpj: '10.294.382/0001-44',
      local: 'Buíque - PE',
      representante: 'Aldo Lins (Secretário de Agricultura)'
    },
    {
      id: 'pr2',
      nome: 'Prefeitura Municipal de Arcoverde',
      cnpj: '11.482.932/0001-55',
      local: 'Arcoverde - PE',
      representante: 'Kátia Valéria (Diretora de Fomento Rural)'
    }
  ],
  escola: [
    {
      id: 'e1',
      nome: 'Escola Municipal do Campo Carneiro',
      cnpj: '22.334.455/0001-66',
      local: 'Distrito de Carneiro, Buíque - PE',
      representante: 'Ana Maria de Souza (Diretora)'
    },
    {
      id: 'e2',
      nome: 'EREM Francisco de Assis',
      cnpj: '33.445.566/0001-77',
      local: 'Centro, Buíque - PE',
      representante: 'Carlos Alberto Santos (Coordenador)'
    },
    {
      id: 'e3',
      nome: 'Escola Municipal Padre Cícero',
      cnpj: '44.556.677/0001-88',
      local: 'Povoado Guanabara, Arcoverde - PE',
      representante: 'Maria Helena Lima (Gestora)'
    }
  ],
  instituicao: [
    {
      id: 'i1',
      nome: 'IPA - Instituto Agronômico de Pernambuco',
      cnpj: '09.876.543/0001-22',
      natureza: 'Pública',
      local: 'Sede Recife / Unidade Buíque',
      representante: 'Dr. Josimar Silva (Pesquisador-Chefe)'
    },
    {
      id: 'i2',
      nome: 'UFRPE - Universidade Federal Rural de Pernambuco',
      cnpj: '08.765.432/0001-11',
      natureza: 'Pública',
      local: 'UAST - Serra Talhada - PE',
      representante: 'Dra. Luciana Mendes (Professora Coordenadora)'
    }
  ],
  parceiro: [
    {
      id: 'pa1',
      nome: 'Dr. Ricardo Gomes',
      cpf: '234.567.890-12',
      titulacao: 'Doutor',
      areaAtuacao: 'Melhoramento Genético de Raízes e Tubérculos',
      instituicao: 'UFRPE',
      email: 'ricardo.gomes@ufrpe.br'
    },
    {
      id: 'pa2',
      nome: 'Juliana Costa de Melo',
      cpf: '876.543.210-98',
      titulacao: 'Mestre',
      areaAtuacao: 'Extensão Rural e Agroecologia',
      instituicao: 'IPA Buíque',
      email: 'juliana.costa@ipa.br'
    }
  ],
  doacoes: [
    {
      id: 'd1',
      tipo: 'mudas',
      mudasVariedade: 'Feijão Caupi BRS Tumucumaque',
      mudasQuantidade: '20 kg',
      mudasLote: 'LOT-FEI-2026/A',
      mudasLocalDestino: 'Assentamento Nova Esperança, Buíque - PE',
      mudasResponsavel: 'João Rodrigues Santos',
      mudasPrevisaoCultivo: '2026-06',
      dataRegistro: '2026-03-12'
    },
    {
      id: 'd2',
      tipo: 'mudas',
      mudasVariedade: 'Mandioca BRS Kiriris',
      mudasQuantidade: '500 manivas',
      mudasLote: 'LOT-MAN-2026/A',
      mudasLocalDestino: 'Sítio Poço Verde, Arcoverde - PE',
      mudasResponsavel: 'Maria da Conceição Silva',
      mudasPrevisaoCultivo: '2026-05',
      dataRegistro: '2026-03-24'
    },
    {
      id: 'd3',
      tipo: 'alimentos',
      alimentosVariedade: 'Batata-doce BRS Amélia',
      alimentosQuantidade: '150 kg',
      alimentosLocalDestino: 'Escola Municipal do Campo Carneiro',
      alimentosResponsavel: 'Ana Maria de Souza (Diretora)',
      dataRegistro: '2026-04-05'
    },
    {
      id: 'd4',
      tipo: 'mudas',
      mudasVariedade: 'Milho Biofortificado BRS Sertanejo',
      mudasQuantidade: '15 kg',
      mudasLote: 'LOT-MIL-2026/B',
      mudasLocalDestino: 'Comunidade Quilombola Melancia, Buíque - PE',
      mudasResponsavel: 'Sebastião Alves de Souza',
      mudasPrevisaoCultivo: '2026-05',
      dataRegistro: '2026-04-10'
    },
    {
      id: 'd5',
      tipo: 'alimentos',
      alimentosVariedade: 'Milho Biofortificado (grãos/espigas)',
      alimentosQuantidade: '200 kg',
      alimentosLocalDestino: 'Escola Municipal Padre Cícero',
      alimentosResponsavel: 'Maria Helena Lima (Gestora)',
      dataRegistro: '2026-05-18'
    },
    {
      id: 'd6',
      tipo: 'mudas',
      mudasVariedade: 'Mandioca BRS Gema de Ovo',
      mudasQuantidade: '800 manivas',
      mudasLote: 'LOT-MAN-2026/B',
      mudasLocalDestino: 'Assentamento São José, Arcoverde - PE',
      mudasResponsavel: 'Antônio Marcos Cavalcante',
      mudasPrevisaoCultivo: '2026-07',
      dataRegistro: '2026-06-02'
    },
    {
      id: 'd7',
      tipo: 'alimentos',
      alimentosVariedade: 'Mandioca BRS Kiriris & Batata-doce',
      alimentosQuantidade: '300 kg',
      alimentosLocalDestino: 'Associação de Produtores Agroecológicos de Buíque',
      alimentosResponsavel: 'Representante da Associação',
      dataRegistro: '2026-06-15'
    },
    {
      id: 'd8',
      tipo: 'mudas',
      mudasVariedade: 'Feijão Caupi BRS Tumucumaque',
      mudasQuantidade: '30 kg',
      mudasLote: 'LOT-FEI-2026/C',
      mudasLocalDestino: 'Sítio Baixa Grande, Buíque - PE',
      mudasResponsavel: 'Francisca Sales de Lima',
      mudasPrevisaoCultivo: '2026-08',
      dataRegistro: '2026-07-01'
    }
  ],
  financeiro: [
    {
      id: 'f1',
      tipo: 'Receita',
      categoria: 'Patrocínio',
      valor: 15000.00,
      data: '2026-01-10',
      descricao: 'Repasse Convênio Governo Estadual - Fomento Agroecologia',
      status: 'Pago'
    },
    {
      id: 'f2',
      tipo: 'Receita',
      categoria: 'Patrocínio',
      valor: 8000.00,
      data: '2026-02-15',
      descricao: 'Apoio Técnico Fundação de Amparo à Ciência (FACEPE)',
      status: 'Pago'
    },
    {
      id: 'f3',
      tipo: 'Despesa',
      categoria: 'Mudas',
      valor: 2400.00,
      data: '2026-02-28',
      descricao: 'Aquisição de Manivas de Mandioca BRS Kiriris e BRS Gema de Ovo',
      status: 'Pago'
    },
    {
      id: 'f4',
      tipo: 'Despesa',
      categoria: 'Logística',
      valor: 850.00,
      data: '2026-03-15',
      descricao: 'Combustível e Diárias para Viagens de Assistência Técnico-Científica',
      status: 'Pago'
    },
    {
      id: 'f5',
      tipo: 'Despesa',
      categoria: 'Consultoria',
      valor: 1500.00,
      data: '2026-03-25',
      descricao: 'Honorários Consultoria de Análise de Solos',
      status: 'Pago'
    },
    {
      id: 'f6',
      tipo: 'Receita',
      categoria: 'Outros',
      valor: 1200.00,
      data: '2026-04-18',
      descricao: 'Venda de Excedente de Produção do Campo Experimental',
      status: 'Pago'
    },
    {
      id: 'f7',
      tipo: 'Despesa',
      categoria: 'Evento',
      valor: 1800.00,
      data: '2026-05-10',
      descricao: 'Organização do Evento: I Dia de Campo de Biofortificados',
      status: 'Pago'
    },
    {
      id: 'f8',
      tipo: 'Despesa',
      categoria: 'Outros',
      valor: 450.00,
      data: '2026-05-20',
      descricao: 'Aquisição de Embalagens e Kits de Distribuição de Alimentos',
      status: 'Pago'
    },
    {
      id: 'f9',
      tipo: 'Despesa',
      categoria: 'Logística',
      valor: 1200.00,
      data: '2026-06-12',
      descricao: 'Manutenção de Trator e Equipamentos Agrícolas do Projeto',
      status: 'Pago'
    },
    {
      id: 'f10',
      tipo: 'Despesa',
      categoria: 'Evento',
      valor: 950.00,
      data: '2026-07-05',
      descricao: 'Organização do Evento: Curso de Multiplicação de Sementes Crioulas',
      status: 'Pago'
    },
    {
      id: 'f11',
      tipo: 'Receita',
      categoria: 'Patrocínio',
      valor: 6000.00,
      data: '2026-07-10',
      descricao: 'Nova Parceria Prefeitura de Arcoverde (Fundo Municipal)',
      status: 'Pago'
    },
    {
      id: 'f12',
      tipo: 'Despesa',
      categoria: 'Outros',
      valor: 650.00,
      data: '2026-07-15',
      descricao: 'Impressão de Folhetos e Cartilhas sobre Biofortificação',
      status: 'Pago'
    }
  ],
  eventos: [
    {
      id: 'ev1',
      titulo: 'I Dia de Campo sobre Mandioca Biofortificada',
      data: '2026-05-10',
      hora: '08:00',
      local: 'Sítio Poço Verde, Arcoverde - PE',
      descricao: 'Demonstração prática das variedades de mandioca BRS Kiriris e BRS Gema de Ovo, com participação de agricultores da região.',
      participantes: 42,
      custo: 1800.00,
      tipo: 'Dia de Campo'
    },
    {
      id: 'ev2',
      titulo: 'Oficina Prática de Produção de Pães com Farinha Biofortificada',
      data: '2026-06-18',
      hora: '14:00',
      local: 'Cozinha Comunitária do Distrito de Carneiro, Buíque - PE',
      descricao: 'Capacitação para merendeiras escolares e mães de alunos sobre aproveitamento de batata-doce e mandioca biofortificada.',
      participantes: 25,
      custo: 350.00,
      tipo: 'Oficina'
    },
    {
      id: 'ev3',
      titulo: 'Curso de Multiplicação e Armazenamento de Sementes Crioulas',
      data: '2026-07-05',
      hora: '09:00',
      local: 'Associação de Produtores, Buíque - PE',
      descricao: 'Técnicas de seleção, conservação e multiplicação de feijão e milho crioulos.',
      participantes: 35,
      custo: 950.00,
      tipo: 'Oficina'
    },
    {
      id: 'ev4',
      titulo: 'Seminário Intermunicipal de Segurança Alimentar e Nutricional',
      data: '2026-08-20',
      hora: '09:00',
      local: 'Auditório EREM Francisco de Assis, Buíque - PE',
      descricao: 'Debate sobre fomento de alimentos biofortificados na merenda escolar e programas governamentais.',
      participantes: 80,
      custo: 1500.00,
      tipo: 'Reunião Técnica'
    }
  ],
  consultoria_inteligente: [
    {
      id: 'ci1',
      cultura: 'Mandioca BRS Kiriris',
      problema: 'Manchas amarelas nas folhas superiores e enrugamento. Algumas folhas estão caindo prematuramente.',
      midias: [
        { id: 'm1', name: 'folhas_amarelas.jpg', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80' }
      ],
      status: 'Concluído',
      created_at: '2026-07-28T14:32:00Z',
      resultado: {
        diagnostico: 'Mosaico Comum da Mandioca (CVD)',
        confianca: 92,
        severidade: 'Alto',
        causas: [
          'Presença de mosca-branca (Bemisia tabaci) transmissora do vírus.',
          'Uso de manivas-semente contaminadas na implantação da cultura.',
          'Ferramentas de poda não esterilizadas.'
        ],
        recomendacoes: [
          'Eliminação imediata (arranquio e queima) das plantas com sintomas severos.',
          'Utilização exclusiva de manivas-semente sadias com certificação.',
          'Controle populacional de mosca-branca com caldas naturais (ex: óleo de neem ou calda de fumo).'
        ],
        proximosPassos: [
          'Vistoriar as parcelas vizinhas diariamente.',
          'Aplicar óleo de neem 1% nas plantas suscetíveis no final de tarde.',
          'Higienizar ferramentas com água sanitária a 10% entre cortes.'
        ],
        observacoes: 'A variedade BRS Kiriris possui certa tolerância, mas em condições favoráveis ao vetor, a infecção pode se espalhar rapidamente.'
      }
    },
    {
      id: 'ci2',
      cultura: 'Milho Biofortificado BRS Sertanejo',
      problema: 'Folhas com furos lineares e presença de lagartas pequenas no cartucho.',
      midias: [
        { id: 'm2', name: 'cartucho_milho.jpg', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=400&q=80' }
      ],
      status: 'Concluído',
      created_at: '2026-07-27T09:15:00Z',
      resultado: {
        diagnostico: 'Lagarta-do-cartucho (Spodoptera frugiperda)',
        confianca: 95,
        severidade: 'Médio',
        causas: [
          'Condições de clima quente e seco que favorecem o ciclo reprodutivo da praga.',
          'Ausência de rotação de culturas ou barreiras ecológicas.'
        ],
        recomendacoes: [
          'Aplicação de defensivo biológico à base de Bacillus thuringiensis (Bt).',
          'Liberação de inimigos naturais como tesourinhas (Doru luteipes) se disponíveis.',
          'Pulverização com extrato concentrado de folha de nim.'
        ],
        proximosPassos: [
          'Monitorar a área de plantio focando no cartucho do milho.',
          'Adquirir e aplicar o Bt conforme dosagem indicada pelo fabricante.'
        ],
        observacoes: 'Recomenda-se realizar a aplicação preferencialmente no final da tarde, direcionando o jato de pulverização para o cartucho das plantas.'
      }
    }
  ]
};

// Initialize Storage and Seed Locally
export function initStorage() {
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(MOCK_DATA[key] || []));
    }
  });
}

// Automatically trigger local initialization
if (typeof window !== 'undefined') {
  initStorage();
}

// --- HELPER FUNCTIONS FOR LOCAL STORAGE FALLBACK ---
function getLocalEntities(type) {
  const storageKey = STORAGE_KEYS[type];
  if (!storageKey) return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch (e) {
    console.warn('Erro ao ler do LocalStorage:', e);
    return [];
  }
}

function saveLocalEntity(type, record) {
  const storageKey = STORAGE_KEYS[type];
  if (!storageKey) return;
  try {
    const list = getLocalEntities(type);
    const existingIndex = list.findIndex(item => item.id === record.id);
    if (existingIndex > -1) {
      list[existingIndex] = record;
    } else {
      list.push(record);
    }
    localStorage.setItem(storageKey, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save locally:', e);
  }
}

function deleteLocalEntity(type, id) {
  const storageKey = STORAGE_KEYS[type];
  if (!storageKey) return;
  try {
    const list = getLocalEntities(type);
    const filtered = list.filter(item => item.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete locally:', e);
  }
}

// --- PUBLIC ASYNC API (DYNAMIC DUAL-MODE) ---

export async function getEntities(type) {
  const supabase = getSupabase();
  if (supabase) {
    const tableName = TABLE_MAPPING[type] || type;
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) {
        console.warn(`Supabase read failed for ${type}, fallback to localStorage:`, error.message);
        return getLocalEntities(type);
      }
      // Cache values locally for offline use
      const storageKey = STORAGE_KEYS[type];
      if (storageKey && data) {
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
      return data || [];
    } catch (e) {
      console.warn(`Network error fetching ${type}, fallback to localStorage:`, e);
      return getLocalEntities(type);
    }
  }
  return getLocalEntities(type);
}

export async function saveEntity(type, data) {
  const supabase = getSupabase();
  const entryId = data.id || `${type.substring(0, 3)}_${Date.now()}`;
  const record = { ...data, id: entryId };
  
  // Clean values for Postgres constraints (e.g. parse numbers)
  if (type === 'financeiro' && typeof record.valor === 'string') {
    record.valor = parseFloat(record.valor);
  }
  if (type === 'eventos') {
    if (typeof record.participantes === 'string') record.participantes = parseInt(record.participantes) || 0;
    if (typeof record.custo === 'string') record.custo = parseFloat(record.custo) || 0;
  }

  if (supabase) {
    const tableName = TABLE_MAPPING[type] || type;
    try {
      const { data: savedData, error } = await supabase
        .from(tableName)
        .upsert([record], { onConflict: 'id' })
        .select();
      
      if (error) {
        console.warn(`Supabase upsert failed for ${type}, fallback to localStorage:`, error.message);
        saveLocalEntity(type, record);
      } else {
        saveLocalEntity(type, record);
        window.dispatchEvent(new CustomEvent('database-updated', { detail: { type } }));
        return savedData ? savedData[0] : record;
      }
    } catch (e) {
      console.warn(`Network error on save for ${type}, fallback to localStorage:`, e);
      saveLocalEntity(type, record);
    }
  } else {
    saveLocalEntity(type, record);
  }
  
  window.dispatchEvent(new CustomEvent('database-updated', { detail: { type } }));
  return record;
}

export async function deleteEntity(type, id) {
  const supabase = getSupabase();
  if (supabase) {
    const tableName = TABLE_MAPPING[type] || type;
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.warn(`Supabase delete failed for ${type}, fallback to localStorage:`, error.message);
        deleteLocalEntity(type, id);
      } else {
        deleteLocalEntity(type, id);
      }
    } catch (e) {
      console.warn(`Network error on delete for ${type}, fallback to localStorage:`, e);
      deleteLocalEntity(type, id);
    }
  } else {
    deleteLocalEntity(type, id);
  }
  window.dispatchEvent(new CustomEvent('database-updated', { detail: { type } }));
}

// Bulk sync local cache datasets up to Supabase Cloud
export async function syncLocalToCloud() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase não configurado.");
  
  const results = {};
  
  for (const [type, tableName] of Object.entries(TABLE_MAPPING)) {
    const localData = getLocalEntities(type);
    if (localData.length === 0) continue;
    
    // Clean data formats to avoid SQL insert crashes
    const cleanedData = localData.map(item => {
      const copy = { ...item };
      if (type === 'financeiro' && typeof copy.valor === 'string') {
        copy.valor = parseFloat(copy.valor) || 0;
      }
      if (type === 'eventos') {
        if (typeof copy.participantes === 'string') copy.participantes = parseInt(copy.participantes) || 0;
        if (typeof copy.custo === 'string') copy.custo = parseFloat(copy.custo) || 0;
      }
      return copy;
    });

    const { error } = await supabase
      .from(tableName)
      .upsert(cleanedData, { onConflict: 'id' });
      
    if (error) {
      console.error(`Erro ao sincronizar tabela ${tableName}:`, error.message);
      throw new Error(`Falha ao sincronizar a tabela ${tableName}: ${error.message}`);
    }
    results[type] = cleanedData.length;
  }
  
  // Refresh UI
  window.dispatchEvent(new CustomEvent('database-updated'));
  return results;
}
