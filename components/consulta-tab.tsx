"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search, Bike, User, MapPin, FileText, Truck, ClipboardCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ClienteComChegada } from "@/lib/types"
import { STATUS_CHEGADA_LABELS, SITUACAO_EMPLACAMENTO_LABELS } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatDate(dateStr?: string) {
  if (!dateStr) return "-"
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("pt-BR")
}

function getStatusChegadaColor(status: string) {
  switch (status) {
    case "chegou":
      return "bg-emerald-600 text-white"
    case "em_transito":
      return "bg-amber-500 text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getSituacaoColor(situacao: string) {
  switch (situacao) {
    case "entregue":
      return "bg-emerald-600 text-white"
    case "emplacado":
      return "bg-sky-600 text-white"
    case "em_emplacamento":
      return "bg-amber-500 text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function ConsultaTab() {
  const [query, setQuery] = useState("")
  const { data: clientes, isLoading } = useSWR<ClienteComChegada[]>(
    query.length >= 2 ? `/api/clientes?q=${encodeURIComponent(query)}` : null,
    fetcher
  )

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-xl font-semibold text-foreground">
            Consultar Status da Moto
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pesquise pelo nome do cliente ou numero do chassi
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Nome do cliente ou chassi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Buscando...</p>
      )}

      {query.length >= 2 && clientes && clientes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto size-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">
              Nenhum resultado encontrado para &ldquo;{query}&rdquo;
            </p>
          </CardContent>
        </Card>
      )}

      {query.length < 2 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bike className="mx-auto size-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">
              Digite pelo menos 2 caracteres para pesquisar
            </p>
          </CardContent>
        </Card>
      )}

      {clientes && clientes.length > 0 && (
        <div className="flex flex-col gap-4">
          {clientes.map((cliente) => (
            <Card key={cliente.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Info principal */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {cliente.cliente}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {cliente.modelo}
                        </p>
                      </div>
                      <Badge className={getSituacaoColor(cliente.situacaoEmplacamento)}>
                        {SITUACAO_EMPLACAMENTO_LABELS[cliente.situacaoEmplacamento]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Vendedor:</span>
                        <span className="font-medium text-foreground">{cliente.vendedor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Cidade:</span>
                        <span className="font-medium text-foreground">{cliente.cidade}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Chassi:</span>
                        <span className="font-mono font-medium text-foreground text-xs">{cliente.chassi}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Faturamento:</span>
                        <span className="font-medium text-foreground">{formatDate(cliente.dataFaturamento)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status lateral */}
                  <div className="border-t lg:border-t-0 lg:border-l border-border p-5 lg:w-64 flex flex-col gap-3 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Truck className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">Chegada:</span>
                      <Badge className={getStatusChegadaColor(cliente.statusChegada)}>
                        {STATUS_CHEGADA_LABELS[cliente.statusChegada]}
                      </Badge>
                    </div>
                    {cliente.dataChegada && (
                      <p className="text-xs text-muted-foreground ml-6">
                        Chegou em {formatDate(cliente.dataChegada)}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">Situacao:</span>
                      <Badge className={getSituacaoColor(cliente.situacaoEmplacamento)}>
                        {SITUACAO_EMPLACAMENTO_LABELS[cliente.situacaoEmplacamento]}
                      </Badge>
                    </div>
                    {cliente.dataSaidaEmplacamento && (
                      <p className="text-xs text-muted-foreground ml-6">
                        Saiu para emplacamento em {formatDate(cliente.dataSaidaEmplacamento)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
