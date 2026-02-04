import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend rodando 🚀");
});

app.post("/api/analisar", async (req, res) => {
  try {
    const { palavra, nicho, publico, regiao, objetivo } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Faça uma análise de mercado para:
Palavra-chave: ${palavra}
Nicho: ${nicho}
Público: ${publico}
Região: ${regiao}
Objetivo: ${objetivo}`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (error) {
    res.status(500).json({ erro: "Erro ao chamar a IA" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
