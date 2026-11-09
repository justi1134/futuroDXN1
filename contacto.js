const form = document.getElementById("contact-form");
const emailInput = document.getElementById("email");
const emailSuggestion = document.getElementById("email-suggestion");
const messageInput = document.getElementById("message");
const characterCount = document.getElementById("character-count");
const formStatus = document.getElementById("form-status");
const fields = ["name", "email", "phone", "message", "consent"];
const commonDomainCorrections = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmal.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "yaho.com": "yahoo.com",
};

// Pilar 1: Validación: revisa campos requeridos, formato, longitud y teléfono.
function getError(field) {
  if (field.validity.valueMissing) {
    return field.type === "checkbox"
      ? "Necesitamos tu autorización para continuar."
      : "Este campo es obligatorio.";
  }
  if (field.validity.tooShort) {
    return field.name === "name"
      ? "Escribe al menos 2 caracteres."
      : "Cuéntanos un poco más (mínimo 10 caracteres).";
  }
  if (field.validity.typeMismatch) {
    return "Escribe un correo válido, por ejemplo nombre@dominio.com.";
  }
  if (field.name === "phone" && field.value) {
    const digits = field.value.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      return "Revisa el teléfono: debe tener entre 7 y 15 dígitos.";
    }
    if (!/^[+\d(][\d\s().+-]*$/.test(field.value.trim())) {
      return "Usa solo números, espacios y los símbolos + ( ) -.";
    }
  }
  return "";
}

// Pilar 2: Accesibilidad: muestra errores y marca el campo para lectores de pantalla.
function validateField(field) {
  const errorElement = document.getElementById(`${field.id}-error`);
  const error = getError(field);
  field.setAttribute("aria-invalid", String(Boolean(error)));
  field.classList.toggle("has-error", Boolean(error));
  errorElement.textContent = error;
  return !error;
}

// Pilar 3: Prevención de errores: propone dominios comunes cuando parecen mal escritos.
function suggestEmailCorrection() {
  const [localPart, domain] = emailInput.value.trim().toLowerCase().split("@");
  //sella secuecicias de operciones encadenamineto de metodos
  const correctedDomain = commonDomainCorrections[domain];

  if (localPart && correctedDomain) {
    emailSuggestion.textContent = `¿Quisiste decir ${localPart}@${correctedDomain}?`;
    // interpolacion de cadnas n un if
    emailSuggestion.hidden = false;
  } else {
    emailSuggestion.hidden = true;
  }
}

// Pilar 4: Interacción: valida al salir del campo y actualiza mensajes mientras se escribe.
fields.forEach((id) => {
  const field = document.getElementById(id);
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") validateField(field);
    formStatus.textContent = "";
    formStatus.classList.remove("is-error");
  });
});

emailInput.addEventListener("input", suggestEmailCorrection);
emailSuggestion.addEventListener("click", () => {
  const [localPart] = emailInput.value.trim().toLowerCase().split("@");
  const correctedDomain =
    commonDomainCorrections[
      emailInput.value.trim().toLowerCase().split("@")[1]
    ];
  emailInput.value = `${localPart}@${correctedDomain}`;
  emailSuggestion.hidden = true;
  validateField(emailInput);
  emailInput.focus();
});

messageInput.addEventListener("input", () => {
  characterCount.textContent = `${messageInput.value.length} / 1200`;
});

// Pilar 5: Envío al servidor con fetch; el navegador nunca recibe credenciales de Gmail.
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const valid = fields
    .map((id) => validateField(document.getElementById(id)))
    .every(Boolean);

  if (!valid) {
    formStatus.textContent = "Revisa los campos marcados para continuar.";
    formStatus.classList.add("is-error");
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const payload = Object.fromEntries(new FormData(form));
  payload.consent = document.getElementById("consent").checked;

  submitButton.disabled = true;
  formStatus.classList.remove("is-error");
  formStatus.textContent = "Enviando tu consulta...";

  try {
    const response = await fetch("http://localhost:3000/api/contact", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "No se pudo enviar la consulta.");
    }

    formStatus.textContent = result.message;
    form.reset();
    characterCount.textContent = "0 / 1200";
    emailSuggestion.hidden = true;
  } catch (error) {
    formStatus.textContent =
      error instanceof Error
        ? error.message
        : "No se pudo conectar con el servidor. Intenta de nuevo.";
    formStatus.classList.add("is-error");
  } finally {
    submitButton.disabled = false;
  }
});
