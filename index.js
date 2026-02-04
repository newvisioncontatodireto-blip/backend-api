import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY
});

// ROTA PRINCIPAL
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
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    const prompt = `
Aja como um sistema avançado de inteligência de marketing digital.
Palavra-chave: ${keyword}
Nicho: ${niche}
Segmento: ${segment}
Produto: ${product}
Público-alvo: ${targetAudience || "Inferir"}
Região: ${region || "Brasil"}
Objetivo: ${objective}
Retorne APENAS JSON válido.
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    if (!response.text) {
      return res.status(500).json({ error: "Resposta vazia da IA" });
    }

    res.json(JSON.parse(response.text));

  } catch (err) {
    console.error("ERRO BACKEND:", err);
    res.status(500).json({ error: err.message });
  }
});

// ROTA DE TESTE (IMPORTANTE)
app.get("/", (req, res) => {
  res.send("Backend rodando OK 🚀");
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
