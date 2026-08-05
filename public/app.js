document.getElementById("form-crear").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const contacto = document.getElementById("contacto").value;
  const fecha_hora = document.getElementById("fecha_hora").value;
  const resultado = document.getElementById("resultado-crear");

  resultado.textContent = "Creando...";

  try {
    const response = await fetch("/solicitudes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, contacto, fecha_hora }),
    });

    const data = await response.json();

    if (!response.ok) {
      resultado.textContent = `Error: ${data.error}`;
      return;
    }

    resultado.textContent = `Solicitud creada. Tu código es: ${data.codigo_seguimiento}`;
  } catch (err) {
    resultado.textContent = "Error al conectar con el servidor.";
  }
});

document.getElementById("form-consultar").addEventListener("submit", async (e) => {
  e.preventDefault();

  const codigo = document.getElementById("codigo").value;
  const resultado = document.getElementById("resultado-consultar");

  resultado.textContent = "Consultando...";

  try {
    const response = await fetch(`/solicitudes/${encodeURIComponent(codigo)}`);
    const data = await response.json();

    if (!response.ok) {
      resultado.textContent = data.error;
      return;
    }

    resultado.textContent = `Nombre: ${data.nombre}\nEstado: ${data.estado}\nFecha y hora: ${data.fecha_hora}`;
  } catch (err) {
    resultado.textContent = "Error al conectar con el servidor.";
  }
});
