import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post("/analyze", async (req, res) => {
  try {
    const input = req.body;

    const prompt = `
Aja como um sistema avançado de inteligência de marketing digital.
Analise:

- Palavra-chave: ${input.keyword}
- Nicho: ${input.niche}
- Segmento: ${input.segment}
- Produto: ${input.product}
- Público-alvo: ${input.targetAudience || "Inferir"}
- Região: ${input.region || "Brasil"}
- Objetivo: ${input.objective}

Retorne a análise completa em JSON estruturado.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    if (!response.text) {
      return res.status(500).json({ error: "Resposta vazia da IA" });
    }

    const result = JSON.parse(response.text);
    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no processamento da IA" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Backend rodando na porta", PORT);
});
