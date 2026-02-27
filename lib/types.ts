// Cliente base - dados cadastrados pelo BDC (sem status de chegada)
export interface Cliente {
  id: string
  cliente: string
  vendedor: string
  cidade: string
  modelo: string
  chassi: string
  dataFaturamento: string
  situacaoEmplacamento: "pendente" | "em_emplacamento" | "emplacado" | "entregue"
  dataSaidaEmplacamento?: string
  criadoEm: string
  atualizadoEm: string
}

// Cliente enriquecido - com status de chegada derivado da logistica
export interface ClienteComChegada extends Cliente {
  statusChegada: "aguardando" | "chegou"
  dataChegada?: string
}

export interface EntradaLogistica {
  id: string
  chassi: string
  modelo: string
  dataChegada: string
  criadoEm: string
}

export type StatusChegada = ClienteComChegada["statusChegada"]
export type SituacaoEmplacamento = Cliente["situacaoEmplacamento"]

export const STATUS_CHEGADA_LABELS: Record<StatusChegada, string> = {
  aguardando: "Aguardando",
  chegou: "Chegou",
}

export const SITUACAO_EMPLACAMENTO_LABELS: Record<SituacaoEmplacamento, string> = {
  pendente: "Pendente",
  em_emplacamento: "Em Emplacamento",
  emplacado: "Emplacado",
  entregue: "Entregue",
}
