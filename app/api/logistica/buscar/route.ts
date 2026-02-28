import { NextRequest, NextResponse } from "next/server";
import { buscarChassiLogistica } from "@/lib/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chassi = searchParams.get("chassi");

  if (!chassi) {
    return NextResponse.json(
      { error: "Parametro 'chassi' obrigatorio" },
      { status: 400 },
    );
  }

  const entrada = buscarChassiLogistica(chassi);

  if (!entrada) {
    return NextResponse.json({ encontrado: false });
  }

  return NextResponse.json({
    encontrado: true,
    modelo: entrada.modelo,
    dataChegada: entrada.dataChegada,
  });
}
