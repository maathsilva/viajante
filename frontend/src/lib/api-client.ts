const API_URL = "http://127.0.0.1:8000";

// 1. Interfaces (Definem o formato dos dados)

export interface ReservaMensal {
  mes: string;
  total_reservas: number;
  receita_total: number;
  custo_total: number;
  margem_total: number;
}

export interface ClienteFidelidade {
  cliente: string;
  tipo_cliente: string;
  uf: string;
  score_fidelidade: number;
}

export interface DestinoRentabilidade {
  destino: string;
  pais: string;
  continente: string;
  margem_media: number;
}

export interface TopMargem {
  destino: string;
  total_reservas: number;
  margem_media: number;
}

export interface ReceitaCanal {
  tipo_cliente: string;
  canal_venda_padronizado: string;
  receita_total: number;
  participacao_percentual: number;
}

export interface ClienteCrescimento {
  cliente: string;
  receita_h1: number;
  receita_h2: number;
  crescimento_percentual: number;
}

export interface ReservaFiltrada {
  id_reserva: number;
  dt_reserva: string;
  dt_embarque: string;
  cliente: string;
  destino: string;
  receita: number;
  custo: number;
  canal_venda: string;
  vendedor: string;
  tipo_viagem: string;
}

export interface UploadResponse {
  status: string;
  arquivo: string;
  reservas_importadas: number;
  clientes_importados: number;
  destinos_importados: number;
}

// 2. Funções de API (Buscam os dados)

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
    
  } catch (error: any) {
    console.error(`Erro ao buscar ${url}:`, error);
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Erro de Conexão: O backend (FastAPI) parece estar offline.");
    }
    throw error;
  }
}

// Funções para Relatórios
export const fetchReservasMensal = () => fetchAPI<ReservaMensal[]>("/reservas/mensal");
export const fetchTopDestinos = () => fetchAPI<TopMargem[]>("/destinos/top-margem");
export const fetchReceitaCanal = () => fetchAPI<ReceitaCanal[]>("/clientes/receita_canal");
export const fetchClientesCrescimento = () => fetchAPI<ClienteCrescimento[]>("/clientes/crescimento");

// Funções para Páginas
export const fetchClientesFidelidade = () => fetchAPI<ClienteFidelidade[]>("/clientes/fidelidade");
export const fetchDestinosRentabilidade = () => fetchAPI<DestinoRentabilidade[]>("/destinos/rentabilidade");

// Função para Reservas (com filtros)
export const fetchReservasFiltradas = (params: URLSearchParams) => 
  fetchAPI<ReservaFiltrada[]>(`/reservas/listar?${params.toString()}`);

// Função para Upload
export const uploadExcelFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  return fetchAPI<UploadResponse>("/importar", {
    method: "POST",
    body: formData,
  });
};