import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend rodando OK 🚀");
});

app.post("/analyze", async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY não configurada" });
    }

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

Dados:
- Palavra-chave: ${keyword}
- Nicho: ${niche}
- Segmento: ${segment}
- Produto: ${product}
- Público-alvo: ${targetAudience || "Inferir"}
- Região: ${region || "Brasil"}
- Objetivo: ${objective}

Retorne APENAS JSON válido.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();
    res.json(JSON.parse(data.choices[0].message.content));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
