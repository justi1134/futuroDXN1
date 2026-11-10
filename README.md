# Formulario de contacto

Ejemplo básico de comunicación entre el navegador y un servidor Node.js.

## Ejecutar

1. Instala las dependencias con `npm install`.
2. Inicia el servidor con `npm start`.
3. Abre `http://localhost:3000`.

Al enviar una consulta válida desde esa dirección, el nombre, correo, teléfono,
mensaje, consentimiento y la cabecera `User-Agent` se guardan juntos en
`contactos.jsonl` (una línea JSON por contacto) y se confirma en la terminal
donde ejecutaste `npm start`. `User-Agent` es información proporcionada por el
cliente y no debe usarse como identificador confiable. No abras `miterminal.html`
directamente como archivo: el formulario necesita conectarse al servidor.

## Pilares

- El navegador manda el formulario al servidor con `fetch()` (`contacto.js`).
- El servidor recibe y valida los datos en `/api/contact` (`app.js`).
- Cada contacto válido se agrega a `contactos.jsonl`; el archivo está excluido
  del control de versiones para proteger los datos personales.
- Express sirve el formulario y sus recursos, y CORS está habilitado para
  solicitudes desde otros orígenes durante el desarrollo.
- El servidor devuelve una respuesta JSON que aparece en la página.
- Es una demostración local: no envía correos ni reemplaza una base de datos.
