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
Aja como um sistema avançado de inteligência de marketing digital, SEO, tráfego pago e copywriting.

Dados:
- Palavra-chave: ${keyword}
- Nicho: ${niche}
- Segmento: ${segment}
- Produto: ${product}
- Público-alvo: ${targetAudience || "Inferir"}
- Região: ${region || "Brasil"}
- Objetivo: ${objective}

Retorne APENAS um JSON válido, estruturado, sem texto adicional.
`;

    const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    { role: "user", content: prompt }
  ],
  temperature: 0.7
});

    // ========================
    // VALIDAÇÃO CRÍTICA
    // ========================
    if (
      !completion ||
      !completion.choices ||
      completion.choices.length === 0 ||
      !completion.choices[0].message ||
      !completion.choices[0].message.content
    ) {
      console.error("⚠️ Resposta inesperada da Groq:", completion);
      return res.status(500).json({
        error: "A IA não retornou uma resposta válida"
      });
    }

    const text = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (jsonError) {
      console.error("❌ Erro ao converter JSON:", text);
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
