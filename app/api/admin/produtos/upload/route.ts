import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const senhaAdmin = process.env.ADMIN_PASSWORD;

    if (!senhaAdmin) {
      return NextResponse.json(
        { erro: "Senha administrativa não configurada." },
        { status: 500 }
      );
    }

    const tokenSalvo =
      request.cookies.get("rockaholic-admin")?.value;

    const tokenEsperado = crypto
      .createHash("sha256")
      .update(`${senhaAdmin}-rockaholic-admin`)
      .digest("hex");

    if (!tokenSalvo || tokenSalvo !== tokenEsperado) {
      return NextResponse.json(
        { erro: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const arquivo = formData.get("arquivo");

    if (!(arquivo instanceof File)) {
      return NextResponse.json(
        { erro: "Nenhuma imagem foi enviada." },
        { status: 400 }
      );
    }

    if (!arquivo.type.startsWith("image/")) {
      return NextResponse.json(
        { erro: "O arquivo precisa ser uma imagem." },
        { status: 400 }
      );
    }

    const extensao =
      arquivo.name.split(".").pop()?.toLowerCase() || "jpg";

    const nomeArquivo =
      `produtos/${Date.now()}-${crypto.randomUUID()}.${extensao}`;

    const blob = await put(nomeArquivo, arquivo, {
     access: "public",
     addRandomSuffix: false,
     token: process.env.ROCKAHOLIC_PRODUCTS_READ_WRITE_TOKEN,
        });

    return NextResponse.json({
      sucesso: true,
      url: blob.url,
    });
  } catch (error) {
  console.error("Erro ao enviar imagem:", error);

  const mensagem =
    error instanceof Error
      ? error.message
      : "Erro desconhecido no upload.";

  return NextResponse.json(
    {
      erro: "Não foi possível enviar a imagem.",
      detalhes: mensagem,
    },
    { status: 500 }
  );
}
}