import { NextRequest, NextResponse } from "next/server"
import { getClientes, searchClientes, addCliente } from "@/lib/store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (query) {
    return NextResponse.json(searchClientes(query))
  }

  return NextResponse.json(getClientes())
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const cliente = addCliente(body)
  return NextResponse.json(cliente, { status: 201 })
}
