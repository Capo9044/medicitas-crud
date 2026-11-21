
(() => {
  // Id de la cita que se quiere eliminar (se guarda mientras el modal está abierto)
  let idPorEliminar = null;

  const form = document.getElementById('formCita');
  const buscador = document.getElementById('buscador');
  const filtroEstado = document.getElementById('filtroEstado');

  
  /**
   * Obtiene las citas, aplica búsqueda y filtro, las ordena por fecha/hora
   * y actualiza la tabla y el resumen. Se llama después de cada cambio.
   */
  function refrescar() {
    const todas = CitasStorage.obtenerTodas();
    const texto = buscador.value.trim().toLowerCase();
    const estado = filtroEstado.value;

    const visibles = todas
      .filter((c) => !estado || c.estado === estado)
      .filter((c) =>
        !texto ||
        c.paciente.toLowerCase().includes(texto) ||
        c.documento.includes(texto) ||
        c.medico.toLowerCase().includes(texto)
      )
      .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));

    UI.renderizarTabla(visibles);
    UI.actualizarResumen(todas); // el resumen siempre cuenta todas, sin filtros
  }

  
  // El mismo formulario sirve para crear y para editar:
  // si el campo oculto "citaId" tiene valor, estamos editando.
  function guardar(evento) {
    evento.preventDefault(); // evita que la página se recargue

    const id = document.getElementById('citaId').value || null;
    const datos = UI.leerFormulario();
    const errores = Validaciones.validarCita(datos, CitasStorage.obtenerTodas(), id);

    if (Object.keys(errores).length > 0) {
      UI.mostrarErrores(errores);
      UI.notificar('Revisa los campos marcados en rojo.', 'error');
      return;
    }

    if (id) {
      CitasStorage.actualizar(id, datos);
      UI.notificar(`Cita de ${datos.paciente} actualizada.`);
    } else {
      CitasStorage.crear(datos);
      UI.notificar(`Cita de ${datos.paciente} registrada.`);
    }

    UI.reiniciarFormulario();
    refrescar();
  }

  
  function manejarClicTabla(evento) {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;

    const cita = CitasStorage.obtenerPorId(boton.dataset.id);
    if (!cita) {
      UI.notificar('La cita ya no existe.', 'error');
      refrescar();
      return;
    }

    if (boton.dataset.accion === 'editar') {
      UI.llenarFormulario(cita); // UPDATE paso 1: cargar datos en el formulario
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (boton.dataset.accion === 'eliminar') {
      idPorEliminar = cita.id; // DELETE paso 1: pedir confirmación
      UI.abrirModal(cita);
    }
  }

  
  function confirmarEliminacion() {
    if (!idPorEliminar) return;

    // Si se estaba editando la misma cita, salimos del modo edición
    if (document.getElementById('citaId').value === idPorEliminar) {
      UI.reiniciarFormulario();
    }

    CitasStorage.eliminar(idPorEliminar);
    idPorEliminar = null;
    UI.cerrarModal();
    UI.notificar('Cita eliminada.', 'info');
    refrescar();
  }

  function cancelarEliminacion() {
    idPorEliminar = null;
    UI.cerrarModal();
  }

  
  /** Crea fechas relativas a hoy para que los ejemplos nunca queden "en el pasado". */
  function diasDesdeHoy(dias) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }

  function cargarEjemplos() {
    const ejemplos = [
      { paciente: 'María Fernanda López', documento: '1075234567', especialidad: 'Medicina general', medico: 'Dr. Andrés Ruiz', fecha: diasDesdeHoy(1), hora: '08:00', estado: 'Programada', observaciones: 'Control de tensión arterial' },
      { paciente: 'Carlos Andrés Perdomo', documento: '1080456123', especialidad: 'Odontología', medico: 'Dra. Paula Rojas', fecha: diasDesdeHoy(2), hora: '10:30', estado: 'Programada', observaciones: 'Limpieza dental' },
      { paciente: 'Luisa Fernanda Cuéllar', documento: '36178945', especialidad: 'Pediatría', medico: 'Dr. Julián Medina', fecha: diasDesdeHoy(-3), hora: '14:00', estado: 'Atendida', observaciones: 'Valoración de crecimiento del menor' },
      { paciente: 'Jorge Iván Tovar', documento: '12134567', especialidad: 'Cardiología', medico: 'Dra. Natalia Vargas', fecha: diasDesdeHoy(-1), hora: '09:15', estado: 'Cancelada', observaciones: 'El paciente reprogramará' },
    ];
    ejemplos.forEach((cita) => CitasStorage.crear(cita));
    UI.notificar(`${ejemplos.length} citas de ejemplo agregadas.`, 'info');
    refrescar();
  }


  function iniciar() {
    // La fecha mínima del calendario es hoy (ayuda visual; la regla real está en validaciones.js)
    document.getElementById('fecha').min = Validaciones.hoyISO();

    form.addEventListener('submit', guardar);
    document.getElementById('btnCancelarEdicion').addEventListener('click', UI.reiniciarFormulario);
    document.getElementById('cuerpoTabla').addEventListener('click', manejarClicTabla);
    document.getElementById('btnModalConfirmar').addEventListener('click', confirmarEliminacion);
    document.getElementById('btnModalCancelar').addEventListener('click', cancelarEliminacion);
    document.getElementById('btnDatosEjemplo').addEventListener('click', cargarEjemplos);
    buscador.addEventListener('input', refrescar);
    filtroEstado.addEventListener('change', refrescar);

    // Cerrar el modal con la tecla Escape o haciendo clic fuera de la caja
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cancelarEliminacion(); });
    document.getElementById('modalEliminar').addEventListener('click', (e) => {
      if (e.target.id === 'modalEliminar') cancelarEliminacion();
    });

    refrescar(); // primera lectura (READ) al abrir la página
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
