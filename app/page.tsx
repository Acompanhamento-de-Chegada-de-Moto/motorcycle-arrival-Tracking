"use client"

import { Bike, Search, Users, Truck } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConsultaTab } from "@/components/consulta-tab"
import { BdcTab } from "@/components/bdc-tab"
import { LogisticaTab } from "@/components/logistica-tab"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
              <Bike className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight text-balance">
                Acompanhamento de Chegada de Moto
              </h1>
              <p className="text-xs text-muted-foreground">
                Controle de chegada e status de motos da concessionaria
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="consulta" className="gap-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex h-auto sm:h-9">
            <TabsTrigger
              value="consulta"
              className="flex items-center gap-1.5 px-4 py-2 sm:py-1"
            >
              <Search className="size-3.5" />
              <span>Consulta</span>
            </TabsTrigger>
            <TabsTrigger
              value="bdc"
              className="flex items-center gap-1.5 px-4 py-2 sm:py-1"
            >
              <Users className="size-3.5" />
              <span>BDC</span>
            </TabsTrigger>
            <TabsTrigger
              value="logistica"
              className="flex items-center gap-1.5 px-4 py-2 sm:py-1"
            >
              <Truck className="size-3.5" />
              <span>Logistica</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consulta">
            <ConsultaTab />
          </TabsContent>

          <TabsContent value="bdc">
            <BdcTab />
          </TabsContent>

          <TabsContent value="logistica">
            <LogisticaTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
