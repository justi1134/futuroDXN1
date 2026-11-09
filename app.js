const express = require("express");
const cors = require("cors");
const { appendFile } = require("node:fs/promises");
const path = require("node:path");

const app = express();
const port = process.env.PORT || 3000;
const projectDirectory = __dirname;
const contactsFile = path.join(projectDirectory, "contactos.jsonl");

// Habilita solicitudes desde otros orígenes durante el desarrollo.
// En producción, limita el origen a los dominios de confianza.
app.use(cors());

// Interpreta los cuerpos JSON enviados por el formulario.
app.use(express.json());

// Sirve la página y sus recursos sin exponer otros archivos del proyecto.
app.get("/", (req, res) => {
  res.sendFile(path.join(projectDirectory, "miterminal.html"));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(projectDirectory, "style.css"));
});

app.get("/contacto.js", (req, res) => {
  res.sendFile(path.join(projectDirectory, "contacto.js"));
});

// Recibe y valida los datos antes de mostrarlos en la terminal.
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message, consent } = req.body || {};
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  const cleanPhone = typeof phone === "string" ? phone.trim() : "";
  const cleanMessage = typeof message === "string" ? message.trim() : "";
  const phoneDigits = cleanPhone.replace(/\D/g, "");
  const validPhone =
    cleanPhone === "" ||
    (phoneDigits.length >= 7 &&
      phoneDigits.length <= 15 &&
      /^[+\d(][\d\s().+-]*$/.test(cleanPhone));

  if (
    cleanName.length < 2 ||
    cleanName.length > 80 ||
    cleanEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
    !validPhone ||
    cleanMessage.length < 10 ||
    cleanMessage.length > 1200 ||
    consent !== true
  ) {
    return res.status(400).json({
      error: "Revisa los datos del formulario e intenta de nuevo.",
    });
  }

  // Guarda cada contacto como una línea JSON para conservar los registros previos.
  const contact = {
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    receivedAt: new Date().toISOString(),
  };

  try {
    await appendFile(contactsFile, `${JSON.stringify(contact)}\n`, "utf8");
  } catch (error) {
    console.error("No se pudo guardar el contacto:", error);
    return res.status(500).json({
      error: "No se pudo guardar tu consulta. Intenta de nuevo más tarde.",
    });
  }

  // Confirma en la terminal que el registro quedó guardado.
  console.log("Nueva consulta recibida:", {
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
  });

  return res.status(200).json({
    message: "¡Gracias! Tu consulta fue recibida correctamente.",
  });
});

// Inicia el servidor solo al ejecutar este archivo directamente.
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Servidor disponible en http://localhost:${port}`);
  });
}

module.exports = app;
