import { NextRequest, NextResponse } from "next/server"
import { getEntradasLogistica, addEntradaLogistica, addMultipleEntradasLogistica } from "@/lib/store"

export async function GET() {
  return NextResponse.json(getEntradasLogistica())
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Se for array, importacao em lote
  if (Array.isArray(body)) {
    const resultado = addMultipleEntradasLogistica(body)
    return NextResponse.json(resultado, { status: 201 })
  }

  // Entrada individual
  const entrada = addEntradaLogistica(body)
  return NextResponse.json(entrada, { status: 201 })
}
