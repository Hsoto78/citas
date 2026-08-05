require("dotenv").config();
const crypto = require("crypto");
const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/solicitudes", async (req, res) => {
  const { nombre, contacto, fecha_hora } = req.body;

  if (!nombre || !contacto || !fecha_hora) {
    return res.status(400).json({ error: "nombre, contacto y fecha_hora son requeridos" });
  }

  const codigo_seguimiento = `CIT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/solicitudes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      codigo_seguimiento,
      nombre,
      contacto,
      fecha_hora,
      estado: "pendiente",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return res.status(502).json({ error: "Error al guardar la solicitud", detail: errorBody });
  }

  const [row] = await response.json();
  res.status(201).json(row);
});

app.get("/solicitudes/:codigo", async (req, res) => {
  const { codigo } = req.params;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/solicitudes?codigo_seguimiento=eq.${encodeURIComponent(codigo)}&select=*`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    return res.status(502).json({ error: "Error al consultar la solicitud", detail: errorBody });
  }

  const rows = await response.json();
  if (rows.length === 0) {
    return res.status(404).json({ error: `No existe una solicitud con el código ${codigo}` });
  }

  res.json(rows[0]);
});

app.patch("/solicitudes/:codigo/confirmar", async (req, res) => {
  const { codigo } = req.params;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/solicitudes?codigo_seguimiento=eq.${encodeURIComponent(codigo)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({ estado: "confirmada" }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    return res.status(502).json({ error: "Error al confirmar la solicitud", detail: errorBody });
  }

  const rows = await response.json();
  if (rows.length === 0) {
    return res.status(404).json({ error: `No existe una solicitud con el código ${codigo}` });
  }

  res.json(rows[0]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
