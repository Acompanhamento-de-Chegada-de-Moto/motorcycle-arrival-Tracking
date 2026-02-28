import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fetch multiples datas types
export async function GET() {
  try {
    const motorcycle = await prisma.motorcycleArrival.findMany();

    console.log(motorcycle);

    return NextResponse.json(motorcycle);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something wrong happened while retrieving a motorcycle",
      },
      { status: 400 },
    );
  }
}

// create multiples entry's
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { chassi, dataChegada, modelo } = body;

    const motorcycle = await prisma.motorcycleArrival.create({
      data: {
        chassi,
        dataChegada: new Date(dataChegada),
        modelo,
        criadoEm: new Date(),
      },
    });

    return NextResponse.json(motorcycle, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something wrong happened while creating a motorcycle",
      },
      { status: 400 },
    );
  }
}
