import { NextRequest, NextResponse } from "next/server"
import { getClienteById, updateCliente, deleteCliente } from "@/lib/store"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cliente = getClienteById(id)
  if (!cliente) {
    return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 })
  }
  return NextResponse.json(cliente)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const cliente = updateCliente(id, body)
  if (!cliente) {
    return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 })
  }
  return NextResponse.json(cliente)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const success = deleteCliente(id)
  if (!success) {
    return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
