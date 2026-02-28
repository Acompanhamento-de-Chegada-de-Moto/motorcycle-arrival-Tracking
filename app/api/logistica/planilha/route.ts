import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    console.log();

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(uint8Array);

    const worksheet = workbook.worksheets[0];

    if (!worksheet) {
      return NextResponse.json(
        { error: "Planilha vazia ou inválida" },
        { status: 400 },
      );
    }

    const headerRow = worksheet.getRow(1);

    const expectedHeaders = ["chassi", "dataChegada", "modelo"];

    const actualHeaders = [
      String(headerRow.getCell(1).value ?? "").trim(),
      String(headerRow.getCell(2).value ?? "").trim(),
      String(headerRow.getCell(3).value ?? "").trim(),
    ];

    const isValidHeader =
      JSON.stringify(actualHeaders) === JSON.stringify(expectedHeaders);

    if (!isValidHeader) {
      return NextResponse.json(
        {
          error:
            "Cabeçalho inválido. Use exatamente: chassi | dataChegada | modelo",
        },
        { status: 400 },
      );
    }

    const motorcycles: {
      chassi: string;
      dataChegada: Date;
      modelo: string;
      criadoEm: Date;
    }[] = [];

    const errors: { linha: number; erro: string }[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const chassi = String(row.getCell(1).value ?? "").trim();
      const dataChegadaRaw = row.getCell(2).value;
      const modelo = String(row.getCell(3).value ?? "").trim();

      if (!chassi || !dataChegadaRaw || !modelo) {
        errors.push({
          linha: rowNumber,
          erro: "Campos obrigatórios faltando",
        });
        return;
      }

      const dataChegada = new Date(dataChegadaRaw as any);

      if (isNaN(dataChegada.getTime())) {
        errors.push({
          linha: rowNumber,
          erro: "Data inválida",
        });
        return;
      }

      motorcycles.push({
        chassi,
        dataChegada,
        modelo,
        criadoEm: new Date(),
      });
    });

    if (motorcycles.length === 0) {
      return NextResponse.json(
        {
          error: "Nenhum dado válido encontrado",
          detalhesErros: errors,
        },
        { status: 400 },
      );
    }

    await prisma.motorcycleArrival.createMany({
      data: motorcycles,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      totalRecebidos: motorcycles.length + errors.length,
      inseridos: motorcycles.length,
      erros: errors.length,
      detalhesErros: errors,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao processar planilha" },
      { status: 500 },
    );
  }
}
