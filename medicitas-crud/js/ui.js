
const UI = (() => {
  // Referencias a elementos del DOM que usamos varias veces
  const el = {
    form: document.getElementById('formCita'),
    titulo: document.getElementById('tituloFormulario'),
    btnGuardar: document.getElementById('btnGuardar'),
    btnCancelar: document.getElementById('btnCancelarEdicion'),
    cuerpoTabla: document.getElementById('cuerpoTabla'),
    vacio: document.getElementById('mensajeVacio'),
    modal: document.getElementById('modalEliminar'),
    textoModal: document.getElementById('textoModal'),
    notificaciones: document.getElementById('notificaciones'),
  };

  
  const CAMPOS = ['paciente', 'documento', 'especialidad', 'medico', 'fecha', 'hora', 'estado', 'observaciones'];

  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  /** Convierte "2026-11-25" en "25 nov 2026" para que sea fácil de leer. */
  function formatearFecha(fechaISO) {
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia} ${MESES[Number(mes) - 1]} ${anio}`;
  }

  /** Crea una celda <td> con texto principal y, opcionalmente, un texto secundario. */
  function crearCelda(principal, secundario = '') {
    const td = document.createElement('td');
    const fuerte = document.createElement('strong');
    fuerte.textContent = principal;
    td.appendChild(fuerte);
    if (secundario) {
      const pequeno = document.createElement('small');
      pequeno.textContent = secundario;
      td.appendChild(pequeno);
    }
    return td;
  }

  /** Crea un botón de acción (Editar / Eliminar) que guarda el id de la cita. */
  function crearBoton(texto, accion, id, clase) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = `boton boton--mini ${clase}`;
    boton.textContent = texto;
    boton.dataset.accion = accion; // app.js lee esto para saber qué hacer
    boton.dataset.id = id;
    return boton;
  }

  
  function renderizarTabla(citas) {
    el.cuerpoTabla.innerHTML = ''; // limpiamos filas anteriores (no hay datos del usuario aquí)
    el.vacio.classList.toggle('oculto', citas.length > 0);

    citas.forEach((cita) => {
      const fila = document.createElement('tr');

      fila.appendChild(crearCelda(cita.paciente, `CC ${cita.documento}`));
      fila.appendChild(crearCelda(cita.especialidad, cita.medico));
      fila.appendChild(crearCelda(formatearFecha(cita.fecha), cita.hora));

      // Etiqueta de color según el estado
      const tdEstado = document.createElement('td');
      const etiqueta = document.createElement('span');
      etiqueta.className = `etiqueta etiqueta--${cita.estado.toLowerCase()}`;
      etiqueta.textContent = cita.estado;
      tdEstado.appendChild(etiqueta);
      fila.appendChild(tdEstado);

      // Botones de acción
      const tdAcciones = document.createElement('td');
      tdAcciones.className = 'tabla__acciones';
      tdAcciones.append(
        crearBoton('Editar', 'editar', cita.id, 'boton--secundario'),
        crearBoton('Eliminar', 'eliminar', cita.id, 'boton--peligro')
      );
      fila.appendChild(tdAcciones);

      el.cuerpoTabla.appendChild(fila);
    });
  }

  /** Actualiza las 4 tarjetas de resumen de la parte superior. */
  function actualizarResumen(citas) {
    const contar = (estado) => citas.filter((c) => c.estado === estado).length;
    document.getElementById('totalCitas').textContent = citas.length;
    document.getElementById('totalProgramadas').textContent = contar('Programada');
    document.getElementById('totalAtendidas').textContent = contar('Atendida');
    document.getElementById('totalCanceladas').textContent = contar('Cancelada');
  }

  // ------------------------- Formulario -------------------------
  /** Lee los valores del formulario y los devuelve como objeto limpio (sin espacios sobrantes). */
  function leerFormulario() {
    const datos = {};
    CAMPOS.forEach((campo) => {
      datos[campo] = document.getElementById(campo).value.trim();
    });
    return datos;
  }

  /** Pone en modo edición: llena el formulario con la cita seleccionada. */
  function llenarFormulario(cita) {
    document.getElementById('citaId').value = cita.id;
    CAMPOS.forEach((campo) => {
      document.getElementById(campo).value = cita[campo] ?? '';
    });
    el.titulo.textContent = 'Editar cita';
    el.btnGuardar.textContent = 'Actualizar cita';
    el.btnCancelar.classList.remove('oculto');
    el.form.classList.add('form--edicion');
    limpiarErrores();
    document.getElementById('paciente').focus();
  }

  /** Vuelve el formulario al modo "Nueva cita". */
  function reiniciarFormulario() {
    el.form.reset();
    document.getElementById('citaId').value = '';
    el.titulo.textContent = 'Nueva cita';
    el.btnGuardar.textContent = 'Guardar cita';
    el.btnCancelar.classList.add('oculto');
    el.form.classList.remove('form--edicion');
    limpiarErrores();
  }

  /** Muestra debajo de cada campo el mensaje de error que corresponda. */
  function mostrarErrores(errores) {
    limpiarErrores();
    Object.entries(errores).forEach(([campo, mensaje]) => {
      document.getElementById(campo).classList.add('invalido');
      document.querySelector(`[data-error-para="${campo}"]`).textContent = mensaje;
    });
    // Llevamos el cursor al primer campo con error
    const primero = Object.keys(errores)[0];
    if (primero) document.getElementById(primero).focus();
  }

  function limpiarErrores() {
    el.form.querySelectorAll('.invalido').forEach((input) => input.classList.remove('invalido'));
    el.form.querySelectorAll('.campo__error').forEach((small) => { small.textContent = ''; });
  }

  
  /** Muestra una notificación temporal (tipo: 'exito' | 'error' | 'info'). */
  function notificar(mensaje, tipo = 'exito') {
    const aviso = document.createElement('div');
    aviso.className = `notificacion notificacion--${tipo}`;
    aviso.textContent = mensaje;
    el.notificaciones.appendChild(aviso);
    setTimeout(() => aviso.remove(), 3000);
  }

  function abrirModal(cita) {
    el.textoModal.textContent =
      `Se eliminará la cita de ${cita.paciente} (${formatearFecha(cita.fecha)}, ${cita.hora}). Esta acción no se puede deshacer.`;
    el.modal.classList.remove('oculto');
    document.getElementById('btnModalCancelar').focus();
  }

  function cerrarModal() {
    el.modal.classList.add('oculto');
  }

  return {
    renderizarTabla, actualizarResumen,
    leerFormulario, llenarFormulario, reiniciarFormulario, mostrarErrores,
    notificar, abrirModal, cerrarModal,
  };
})();
