import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { senha } = await request.json();

    const senhaAdmin = process.env.ADMIN_PASSWORD;

    if (!senhaAdmin) {
      return NextResponse.json(
        { erro: "Senha administrativa não configurada." },
        { status: 500 }
      );
    }

    if (senha !== senhaAdmin) {
      return NextResponse.json(
        { erro: "Senha incorreta." },
        { status: 401 }
      );
    }

    const token = crypto
      .createHash("sha256")
      .update(`${senhaAdmin}-rockaholic-admin`)
      .digest("hex");

    const response = NextResponse.json({
      sucesso: true,
    });

    response.cookies.set("rockaholic-admin", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível realizar o login." },
      { status: 500 }
    );
  }
}