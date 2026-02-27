"use client"

import { useState, useCallback } from "react"
import useSWR, { mutate } from "swr"
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  LogOut,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ClienteComChegada, SituacaoEmplacamento } from "@/lib/types"
import {
  STATUS_CHEGADA_LABELS,
  SITUACAO_EMPLACAMENTO_LABELS,
} from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const BDC_PASSWORD = "bdc2026"

function formatDate(dateStr?: string) {
  if (!dateStr) return "-"
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("pt-BR")
}

function getStatusChegadaColor(status: string) {
  switch (status) {
    case "chegou":
      return "bg-emerald-600 text-white"
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

interface FormData {
  cliente: string
  vendedor: string
  cidade: string
  modelo: string
  chassi: string
  dataFaturamento: string
  situacaoEmplacamento: SituacaoEmplacamento
  dataSaidaEmplacamento: string
}

const emptyForm: FormData = {
  cliente: "",
  vendedor: "",
  cidade: "",
  modelo: "",
  chassi: "",
  dataFaturamento: "",
  situacaoEmplacamento: "pendente",
  dataSaidaEmplacamento: "",
}

type ChassiStatus =
  | { type: "idle" }
  | { type: "buscando" }
  | { type: "encontrado"; modelo: string; dataChegada: string }
  | { type: "nao_encontrado" }

export function BdcTab() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [chassiStatus, setChassiStatus] = useState<ChassiStatus>({ type: "idle" })
  const [chassiBusca, setChassBusca] = useState("")

  const { data: clientes, isLoading } = useSWR<ClienteComChegada[]>(
    authenticated ? "/api/clientes" : null,
    fetcher
  )

  const handleLogin = () => {
    if (password === BDC_PASSWORD) {
      setAuthenticated(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  const handleLogout = () => {
    setAuthenticated(false)
    setPassword("")
  }

  const buscarChassi = useCallback(async () => {
    if (!chassiBusca.trim()) return

    setChassiStatus({ type: "buscando" })
    try {
      const res = await fetch(`/api/logistica/buscar?chassi=${encodeURIComponent(chassiBusca.trim())}`)
      const data = await res.json()

      if (data.encontrado) {
        setChassiStatus({
          type: "encontrado",
          modelo: data.modelo,
          dataChegada: data.dataChegada,
        })
        setForm((prev) => ({
          ...prev,
          chassi: chassiBusca.trim(),
          modelo: data.modelo,
        }))
      } else {
        setChassiStatus({ type: "nao_encontrado" })
        setForm((prev) => ({
          ...prev,
          chassi: chassiBusca.trim(),
          modelo: "",
        }))
      }
    } catch {
      setChassiStatus({ type: "nao_encontrado" })
    }
  }, [chassiBusca])

  const openNewDialog = () => {
    setEditingId(null)
    setForm(emptyForm)
    setChassBusca("")
    setChassiStatus({ type: "idle" })
    setDialogOpen(true)
  }

  const openEditDialog = (cliente: ClienteComChegada) => {
    setEditingId(cliente.id)
    setChassBusca(cliente.chassi)
    setChassiStatus(
      cliente.statusChegada === "chegou"
        ? { type: "encontrado", modelo: cliente.modelo, dataChegada: cliente.dataChegada || "" }
        : { type: "nao_encontrado" }
    )
    setForm({
      cliente: cliente.cliente,
      vendedor: cliente.vendedor,
      cidade: cliente.cidade,
      modelo: cliente.modelo,
      chassi: cliente.chassi,
      dataFaturamento: cliente.dataFaturamento,
      situacaoEmplacamento: cliente.situacaoEmplacamento,
      dataSaidaEmplacamento: cliente.dataSaidaEmplacamento || "",
    })
    setDialogOpen(true)
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      if (editingId) {
        await fetch(`/api/clientes/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      } else {
        await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      }
      mutate("/api/clientes")
      setDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }, [editingId, form])

  const handleDelete = useCallback(async () => {
    if (!deletingId) return
    await fetch(`/api/clientes/${deletingId}`, { method: "DELETE" })
    mutate("/api/clientes")
    setDeleteDialogOpen(false)
    setDeletingId(null)
  }, [deletingId])

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="size-5 text-primary" />
            </div>
            <CardTitle>Acesso BDC</CardTitle>
            <CardDescription>
              Digite a senha para acessar o painel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError(false)
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {passwordError && (
              <p className="text-sm text-destructive">Senha incorreta</p>
            )}
            <Button onClick={handleLogin} className="w-full">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Painel BDC - Clientes
          </h2>
          <p className="text-sm text-muted-foreground">
            Cadastre clientes a partir do chassi. O status de chegada e preenchido automaticamente pela logistica.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openNewDialog} size="sm">
            <Plus className="size-4" />
            Novo Cliente
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      )}

      {clientes && clientes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto size-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
          </CardContent>
        </Card>
      )}

      {clientes && clientes.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Chassi</TableHead>
                    <TableHead>Faturamento</TableHead>
                    <TableHead>Chegada</TableHead>
                    <TableHead>Data Chegada</TableHead>
                    <TableHead>Situacao</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.cliente}</TableCell>
                      <TableCell>{c.vendedor}</TableCell>
                      <TableCell>{c.cidade}</TableCell>
                      <TableCell>{c.modelo}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{c.chassi}</span>
                      </TableCell>
                      <TableCell>{formatDate(c.dataFaturamento)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusChegadaColor(c.statusChegada)}>
                          {STATUS_CHEGADA_LABELS[c.statusChegada]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {c.dataChegada ? formatDate(c.dataChegada) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getSituacaoColor(c.situacaoEmplacamento)}>
                          {SITUACAO_EMPLACAMENTO_LABELS[c.situacaoEmplacamento]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => openEditDialog(c)}
                          >
                            <Pencil className="size-3.5" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setDeletingId(c.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="size-3.5" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Cadastro / Edicao */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Altere os dados do cliente abaixo"
                : "Inicie consultando o chassi para verificar se a moto ja chegou na concessionaria"}
            </DialogDescription>
          </DialogHeader>

          {/* Secao de busca de chassi - Primeiro passo */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground mb-3">
              1. Consultar chassi na logistica
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o numero do chassi"
                value={chassiBusca}
                onChange={(e) => {
                  setChassBusca(e.target.value)
                  if (chassiStatus.type !== "idle") {
                    setChassiStatus({ type: "idle" })
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && buscarChassi()}
                className="font-mono"
              />
              <Button
                onClick={buscarChassi}
                disabled={!chassiBusca.trim() || chassiStatus.type === "buscando"}
                variant="secondary"
              >
                {chassiStatus.type === "buscando" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Buscar
              </Button>
            </div>

            {/* Resultado da busca */}
            {chassiStatus.type === "encontrado" && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    Moto encontrada na logistica
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Modelo: <strong>{chassiStatus.modelo}</strong> | Chegou em: <strong>{formatDate(chassiStatus.dataChegada)}</strong>
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Modelo e data de chegada preenchidos automaticamente.
                  </p>
                </div>
              </div>
            )}

            {chassiStatus.type === "nao_encontrado" && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                <XCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Chassi nao encontrado na logistica
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    A moto ainda nao chegou na concessionaria. O cadastro sera feito com status &ldquo;Aguardando&rdquo;.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Campos do formulario - Segundo passo */}
          {(chassiStatus.type === "encontrado" || chassiStatus.type === "nao_encontrado" || editingId) && (
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium text-foreground mb-3">
                2. Preencher dados do cliente
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Input
                    id="cliente"
                    value={form.cliente}
                    onChange={(e) => updateField("cliente", e.target.value)}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="vendedor">Vendedor</Label>
                  <Input
                    id="vendedor"
                    value={form.vendedor}
                    onChange={(e) => updateField("vendedor", e.target.value)}
                    placeholder="Nome do vendedor"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={form.cidade}
                    onChange={(e) => updateField("cidade", e.target.value)}
                    placeholder="Cidade"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={form.modelo}
                    onChange={(e) => updateField("modelo", e.target.value)}
                    placeholder="Ex: Honda CG 160 Titan"
                    disabled={chassiStatus.type === "encontrado"}
                    className={chassiStatus.type === "encontrado" ? "bg-muted" : ""}
                  />
                  {chassiStatus.type === "encontrado" && (
                    <p className="text-xs text-muted-foreground">Preenchido automaticamente pela logistica</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="chassi">Chassi</Label>
                  <Input
                    id="chassi"
                    value={form.chassi}
                    disabled
                    className="bg-muted font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Definido pela busca acima</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dataFaturamento">Data de Faturamento</Label>
                  <Input
                    id="dataFaturamento"
                    type="date"
                    value={form.dataFaturamento}
                    onChange={(e) => updateField("dataFaturamento", e.target.value)}
                  />
                </div>

                {/* Status de chegada - somente leitura, derivado automaticamente */}
                <div className="flex flex-col gap-2">
                  <Label>Status de Chegada</Label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-muted">
                    {chassiStatus.type === "encontrado" ? (
                      <>
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Chegou</span>
                        <span className="text-xs text-muted-foreground ml-auto">{formatDate(chassiStatus.dataChegada)}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Aguardando</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Atualizado automaticamente pela logistica</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Situacao de Emplacamento</Label>
                  <Select
                    value={form.situacaoEmplacamento}
                    onValueChange={(v) =>
                      updateField("situacaoEmplacamento", v as SituacaoEmplacamento)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SITUACAO_EMPLACAMENTO_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {(form.situacaoEmplacamento === "em_emplacamento" ||
                  form.situacaoEmplacamento === "emplacado" ||
                  form.situacaoEmplacamento === "entregue") && (
                  <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="dataSaidaEmplacamento">
                      Data de Saida para Emplacamento
                    </Label>
                    <Input
                      id="dataSaidaEmplacamento"
                      type="date"
                      value={form.dataSaidaEmplacamento}
                      onChange={(e) =>
                        updateField("dataSaidaEmplacamento", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || (!editingId && chassiStatus.type !== "encontrado" && chassiStatus.type !== "nao_encontrado")}
            >
              {saving ? "Salvando..." : editingId ? "Salvar Alteracoes" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmacao de Exclusao */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusao</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este cliente? Esta acao nao pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
