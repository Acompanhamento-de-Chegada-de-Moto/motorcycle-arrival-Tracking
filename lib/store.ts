import type { Cliente, ClienteComChegada, EntradaLogistica } from "./types"

const clientes: Cliente[] = [
  {
    id: "1",
    cliente: "Joao Silva",
    vendedor: "Carlos Mendes",
    cidade: "Goiania",
    modelo: "Honda CG 160 Titan",
    chassi: "9C2KC1670NR500123",
    dataFaturamento: "2026-02-10",
    situacaoEmplacamento: "em_emplacamento",
    dataSaidaEmplacamento: "2026-02-18",
    criadoEm: "2026-02-10T10:00:00Z",
    atualizadoEm: "2026-02-18T14:00:00Z",
  },
  {
    id: "2",
    cliente: "Maria Oliveira",
    vendedor: "Ana Costa",
    cidade: "Anapolis",
    modelo: "Yamaha Factor 150",
    chassi: "9C6KE1510R0200456",
    dataFaturamento: "2026-02-12",
    situacaoEmplacamento: "pendente",
    criadoEm: "2026-02-12T09:00:00Z",
    atualizadoEm: "2026-02-12T09:00:00Z",
  },
  {
    id: "3",
    cliente: "Pedro Santos",
    vendedor: "Carlos Mendes",
    cidade: "Goiania",
    modelo: "Honda NXR 160 Bros",
    chassi: "9C2KD1670NR600789",
    dataFaturamento: "2026-02-20",
    situacaoEmplacamento: "pendente",
    criadoEm: "2026-02-20T11:00:00Z",
    atualizadoEm: "2026-02-20T11:00:00Z",
  },
]

const entradasLogistica: EntradaLogistica[] = [
  {
    id: "1",
    chassi: "9C2KC1670NR500123",
    modelo: "Honda CG 160 Titan",
    dataChegada: "2026-02-15",
    criadoEm: "2026-02-15T08:00:00Z",
  },
]

let nextClienteId = 4
let nextLogisticaId = 2

// Cruza cliente com logistica para derivar status de chegada automaticamente
function enriquecerCliente(c: Cliente): ClienteComChegada {
  const entrada = entradasLogistica.find(
    (e) => e.chassi.toLowerCase() === c.chassi.toLowerCase()
  )
  return {
    ...c,
    statusChegada: entrada ? "chegou" : "aguardando",
    dataChegada: entrada?.dataChegada,
  }
}

export function getClientes(): ClienteComChegada[] {
  return clientes.map(enriquecerCliente)
}

export function getClienteById(id: string): ClienteComChegada | undefined {
  const c = clientes.find((c) => c.id === id)
  if (!c) return undefined
  return enriquecerCliente(c)
}

export function searchClientes(query: string): ClienteComChegada[] {
  const q = query.toLowerCase()
  return clientes
    .filter(
      (c) =>
        c.cliente.toLowerCase().includes(q) ||
        c.chassi.toLowerCase().includes(q)
    )
    .map(enriquecerCliente)
}

export function addCliente(data: Omit<Cliente, "id" | "criadoEm" | "atualizadoEm">): ClienteComChegada {
  const now = new Date().toISOString()
  const cliente: Cliente = {
    ...data,
    id: String(nextClienteId++),
    criadoEm: now,
    atualizadoEm: now,
  }
  clientes.push(cliente)
  return enriquecerCliente(cliente)
}

export function updateCliente(id: string, data: Partial<Omit<Cliente, "id" | "criadoEm">>): ClienteComChegada | null {
  const index = clientes.findIndex((c) => c.id === id)
  if (index === -1) return null
  clientes[index] = {
    ...clientes[index],
    ...data,
    atualizadoEm: new Date().toISOString(),
  }
  return enriquecerCliente(clientes[index])
}

export function deleteCliente(id: string): boolean {
  const index = clientes.findIndex((c) => c.id === id)
  if (index === -1) return false
  clientes.splice(index, 1)
  return true
}

export function buscarChassiLogistica(chassi: string): EntradaLogistica | undefined {
  return entradasLogistica.find(
    (e) => e.chassi.toLowerCase() === chassi.toLowerCase()
  )
}

export function getEntradasLogistica(): EntradaLogistica[] {
  return [...entradasLogistica]
}

export function addEntradaLogistica(data: Omit<EntradaLogistica, "id" | "criadoEm">): EntradaLogistica {
  // Verifica se o chassi ja foi registrado para evitar duplicatas
  const existente = entradasLogistica.find(
    (e) => e.chassi.toLowerCase() === data.chassi.toLowerCase()
  )
  if (existente) {
    return existente
  }

  const entrada: EntradaLogistica = {
    ...data,
    id: String(nextLogisticaId++),
    criadoEm: new Date().toISOString(),
  }
  entradasLogistica.push(entrada)
  return entrada
}

export function addMultipleEntradasLogistica(
  entradas: Omit<EntradaLogistica, "id" | "criadoEm">[]
): { adicionados: number; vinculados: number } {
  let adicionados = 0
  let vinculados = 0

  for (const data of entradas) {
    const existente = entradasLogistica.find(
      (e) => e.chassi.toLowerCase() === data.chassi.toLowerCase()
    )
    if (!existente) {
      addEntradaLogistica(data)
      adicionados++

      const clienteMatch = clientes.find(
        (c) => c.chassi.toLowerCase() === data.chassi.toLowerCase()
      )
      if (clienteMatch) {
        vinculados++
      }
    }
  }

  return { adicionados, vinculados }
}
