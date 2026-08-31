import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // AUTENTICAÇÃO ADMIN
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

    // ID DO PRODUTO
    const { id } = await context.params;
    const produtoId = Number(id);

    if (!Number.isInteger(produtoId)) {
      return NextResponse.json(
        { erro: "Produto inválido." },
        { status: 400 }
      );
    }

    // DADOS RECEBIDOS
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
        { erro: "Selecione pelo menos um tamanho." },
        { status: 400 }
      );
    }

    const sql = neon(databaseUrl);

    // CONFERE SE O PRODUTO EXISTE
    const produtoExistente = await sql`
      SELECT id
      FROM produtos
      WHERE id = ${produtoId}
      LIMIT 1
    `;

    if (produtoExistente.length === 0) {
      return NextResponse.json(
        { erro: "Produto não encontrado." },
        { status: 404 }
      );
    }

    // EVITA SLUG DUPLICADO
    const slugExistente = await sql`
      SELECT id
      FROM produtos
      WHERE slug = ${slug.trim()}
        AND id <> ${produtoId}
      LIMIT 1
    `;

    if (slugExistente.length > 0) {
      return NextResponse.json(
        {
          erro: "Já existe outro produto com este slug.",
        },
        { status: 409 }
      );
    }

    // ATUALIZA PRODUTO
    const resultado = await sql`
      UPDATE produtos
      SET
        nome = ${nome.trim()},
        slug = ${slug.trim()},
        preco = ${precoNumero},
        descricao = ${descricao?.trim() || null},
        imagem_url = ${imagemUrl?.trim() || null},
        imagens = ${Array.isArray(imagens) ? imagens : []},
        modelagem = ${modelagem || null},
        ativo = ${Boolean(ativo)},
        tamanhos = ${tamanhos},
        updated_at = NOW()
      WHERE id = ${produtoId}
      RETURNING
        id,
       nome,
       slug,
        preco,
       imagem_url,
       imagens,
       modelagem,
      ativo,
       tamanhos,
       updated_at
    `;
      } catch (error) {
    console.error(
      "Erro ao atualizar produto:",
      error
    );

    return NextResponse.json(
      {
        erro: "Não foi possível atualizar o produto.",
      },
      { status: 500 }
    );
  }
}