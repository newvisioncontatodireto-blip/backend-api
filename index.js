import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========================
// Middlewares
// ========================
app.use(cors());
app.use(express.json());

// ========================
// Validação da API KEY
// ========================
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY não encontrada no .env");
  process.exit(1);
}

// ========================
// Cliente Groq
// ========================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ========================
// Health check (Render)
// ========================
app.get("/", (req, res) => {
  res.json({ status: "Backend rodando corretamente 🚀" });
});

// ========================
// Função para extrair JSON
// ========================
function extractJSON(text) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1) {
    throw new Error("JSON não encontrado na resposta");
  }

  const jsonString = text.slice(first, last + 1);
  return JSON.parse(jsonString);
}

// ========================
// Rota principal
// ========================
app.post("/analyze", async (req, res) => {
  try {
    const {
      keyword,
      niche,
      segment,
      product,
      targetAudience,
      region,
      objective
    } = req.body;

    if (!keyword || !niche || !segment || !product || !objective) {
      return res.status(400).json({
        error: "Campos obrigatórios ausentes"
      });
    }

    const prompt = `
Você é um sistema avançado de inteligência de marketing digital.

⚠️ REGRAS OBRIGATÓRIAS:
- Retorne APENAS JSON válido
- Não use markdown
- Não escreva explicações

Estrutura esperada:
{
  "summary": string,
  "opportunityScore": number,
  "keywords": string[],
  "insights": string[],
  "strategy": string
}

Dados:
- Palavra-chave: ${keyword}
- Nicho: ${niche}
- Segmento: ${segment}
- Produto: ${product}
- Público-alvo: ${targetAudience || "Inferir"}
- Região: ${region || "Brasil"}
- Objetivo: ${objective}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Você responde SOMENTE em JSON válido." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const rawText = completion?.choices?.[0]?.message?.content;

    if (!rawText) {
      return res.status(500).json({
        error: "Resposta vazia da IA"
      });
    }

    let parsed;
    try {
      parsed = extractJSON(rawText);
    } catch (err) {
      console.error("❌ JSON inválido recebido:", rawText);
      return res.status(500).json({
        error: "Resposta da IA não é um JSON válido"
      });
    }

    res.json(parsed);

  } catch (err) {
    console.error("❌ Erro no /analyze:", err);
    res.status(500).json({
      error: err.message || "Erro interno do servidor"
    });
  }
});

// ========================
// Start server
// ========================
app.listen(PORT, () => {
  console.log(`✅ Backend rodando na porta ${PORT}`);
});
