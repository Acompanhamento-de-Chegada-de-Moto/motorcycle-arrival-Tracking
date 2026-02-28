"use client";

import { useState, useRef, useCallback } from "react";
import useSWR, { mutate } from "swr";
import {
  Plus,
  Upload,
  Lock,
  LogOut,
  Truck,
  FileSpreadsheet,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import type { EntradaLogistica } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const LOGISTICA_PASSWORD = "log2026";

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR");
}

export function LogisticaTab() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importResult, setImportResult] = useState<{
    adicionados: number;
    atualizados: number;
  } | null>(null);
  const [form, setForm] = useState({
    chassi: "",
    modelo: "",
    dataChegada: "",
  });
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: entradas, isLoading } = useSWR<EntradaLogistica[]>(
    authenticated ? "/api/logistica" : null,
    fetcher,
  );

  const handleLogin = () => {
    if (password === LOGISTICA_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword("");
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/logistica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      mutate("/api/logistica");
      mutate("/api/clientes");
      setDialogOpen(false);
      setForm({ chassi: "", modelo: "", dataChegada: "" });
    } finally {
      setSaving(false);
    }
  }, [form]);

  const handleImportExcel = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImporting(true);
      setImportResult(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const fileUpload = await fetch("/api/logistica/planilha", {
          method: "POST",
          body: formData,
        });

        const data = await fileUpload.json();

        if (!fileUpload.ok) {
          throw new Error(data.error || "Erro no upload");
        }

        const res = await fetch("/api/logistica", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entradas),
        });

        const result = await res.json();
        setImportResult(result);
        mutate("/api/logistica");
        mutate("/api/clientes");
      } catch {
        setImportResult({ adicionados: 0, atualizados: 0 });
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [],
  );

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="size-5 text-primary" />
            </div>
            <CardTitle>Acesso Logistica</CardTitle>
            <CardDescription>
              Digite a senha para acessar o painel de logistica
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
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
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Painel Logistica
          </h2>
          <p className="text-sm text-muted-foreground">
            Registre a chegada de motos e importe planilhas Excel
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => {
              setForm({ chassi: "", modelo: "", dataChegada: "" });
              setDialogOpen(true);
            }}
            size="sm"
          >
            <Plus className="size-4" />
            Registrar Chegada
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <Upload className="size-4" />
            {importing ? "Importando..." : "Importar Excel"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleImportExcel}
          />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Resultado da importacao */}
      {importResult && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-emerald-600">
                <Check className="size-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Importacao concluida
                </p>
                <p className="text-xs text-muted-foreground">
                  {importResult.adicionados} registro(s) adicionado(s),{" "}
                  {importResult.atualizados} cliente(s) atualizado(s)
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setImportResult(null)}
            >
              <X className="size-3.5" />
              <span className="sr-only">Fechar</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dica de formato */}
      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 py-3">
          <FileSpreadsheet className="size-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Formato da planilha para importacao
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A planilha deve conter as colunas: <strong>chassi</strong>,{" "}
              <strong>modelo</strong> e <strong>dataChegada</strong> (ou
              &ldquo;Data Chegada&rdquo;). Formatos de data aceitos: dd/mm/aaaa
              ou aaaa-mm-dd.
            </p>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      )}

      {entradas && entradas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="mx-auto size-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">
              Nenhuma entrada de logistica registrada
            </p>
          </CardContent>
        </Card>
      )}

      {entradas && entradas.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Chassi</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Data de Chegada</TableHead>
                  <TableHead>Registrado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entradas.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <span className="font-mono text-xs">{e.chassi}</span>
                    </TableCell>
                    <TableCell>{e.modelo}</TableCell>
                    <TableCell>
                      {new Date(e.dataChegada).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(e.criadoEm).toLocaleString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Registro Manual */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Chegada de Moto</DialogTitle>
            <DialogDescription>
              Informe os dados da moto que chegou na concessionaria
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="log-chassi">Chassi</Label>
              <Input
                id="log-chassi"
                value={form.chassi}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, chassi: e.target.value }))
                }
                placeholder="Numero do chassi"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="log-modelo">Modelo</Label>
              <Input
                id="log-modelo"
                value={form.modelo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, modelo: e.target.value }))
                }
                placeholder="Ex: Honda CG 160 Titan"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="log-data">Data de Chegada</Label>
              <Input
                id="log-data"
                type="date"
                value={form.dataChegada}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dataChegada: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
