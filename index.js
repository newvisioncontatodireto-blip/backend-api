import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY
});

// Rota de teste (IMPORTANTE)
app.get("/", (req, res) => {
  res.send("Backend rodando OK 🚀");
});

// ROTA QUE ESTAVA FALTANDO 👇👇👇
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

    const prompt = `
    Aja como um sistema avançado de inteligência de marketing digital.
    Palavra-chave: ${keyword}
    Nicho: ${niche}
    Segmento: ${segment}
    Produto: ${product}
    Público-alvo: ${targetAudience || "Inferir"}
    Região: ${region || "Brasil"}
    Objetivo: ${objective}
    Retorne JSON estruturado.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: "Resposta vazia da IA" });
    }

    res.json(JSON.parse(text));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar análise" });
  }
});

// Start
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
