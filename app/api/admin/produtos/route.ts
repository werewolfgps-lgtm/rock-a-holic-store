import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const senhaAdmin = process.env.ADMIN_PASSWORD;
    const databaseUrl = process.env.DATABASE_URL;

    if (!senhaAdmin) {
      return NextResponse.json(
        { erro: "Senha administrativa não configurada." },
        { status: 500 }
      );
    }

    if (!databaseUrl) {
      return NextResponse.json(
        { erro: "Banco de dados não configurado." },
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

            const {
            nome,
            slug,
            preco,
            descricao,
            imagemUrl,
            imagens,
            modelagem,
            ativo,
           tamanhos,
            } = await request.json();

    if (!nome?.trim()) {
      return NextResponse.json(
        { erro: "Informe o nome do produto." },
        { status: 400 }
      );
    }

    if (!slug?.trim()) {
      return NextResponse.json(
        { erro: "Informe o slug do produto." },
        { status: 400 }
      );
    }

    const precoNumero = Number(preco);

    if (
      !Number.isFinite(precoNumero) ||
      precoNumero <= 0
    ) {
      return NextResponse.json(
        { erro: "Informe um preço válido." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(tamanhos) ||
      tamanhos.length === 0
    ) {
      return NextResponse.json(
        {
          erro: "Selecione pelo menos um tamanho.",
        },
        { status: 400 }
      );
    }

    if (
  modelagem !== "masculina" &&
  modelagem !== "feminina"
) {
  return NextResponse.json(
    { erro: "Selecione a modelagem do produto." },
    { status: 400 }
  );
}

    const sql = neon(databaseUrl);

    const produtoExistente = await sql`
      SELECT id
      FROM produtos
      WHERE slug = ${slug.trim()}
      LIMIT 1
    `;

    if (produtoExistente.length > 0) {
      return NextResponse.json(
        {
          erro: "Já existe um produto com este slug.",
        },
        { status: 409 }
      );
    }

  const resultado = await sql`
  INSERT INTO produtos (
    nome,
    slug,
    preco,
    descricao,
    imagem_url,
    imagens,
    modelagem,
    ativo,
    tamanhos,
    created_at,
    updated_at
  )
  VALUES (
    ${nome.trim()},
    ${slug.trim()},
    ${precoNumero},
    ${descricao?.trim() || null},
    ${imagemUrl?.trim() || null},
    ${Array.isArray(imagens) ? imagens : []},
    ${modelagem},
    ${Boolean(ativo)},
    ${tamanhos},
    NOW(),
    NOW()
  )
  RETURNING
    id,
    nome,
    slug,
    preco,
    imagem_url,
    imagens,
    modelagem,
    ativo,
    tamanhos
`;

    return NextResponse.json(
      {
        sucesso: true,
        produto: resultado[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Erro ao cadastrar produto:",
      error
    );

    return NextResponse.json(
      {
        erro: "Não foi possível cadastrar o produto.",
      },
      { status: 500 }
    );
  }
}