
const Validaciones = (() => {
  const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ.\s]+$/;
  const SOLO_NUMEROS = /^\d{6,10}$/;
  const HORA_INICIO = '06:00';
  const HORA_FIN = '20:00';

  /** Devuelve la fecha de hoy en formato AAAA-MM-DD usando la hora local. */
  function hoyISO() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
  }

  /**
   * Valida una cita.
   * @param {object} cita      Datos que vienen del formulario.
   * @param {Array}  existentes Citas ya guardadas (para revisar choques de horario).
   * @param {string|null} idEnEdicion Id de la cita que se edita (se excluye del choque).
   */
  function validarCita(cita, existentes, idEnEdicion = null) {
    const errores = {};

    // Nombre del paciente
    if (!cita.paciente) {
      errores.paciente = 'El nombre del paciente es obligatorio.';
    } else if (cita.paciente.length < 3) {
      errores.paciente = 'Escribe al menos 3 caracteres.';
    } else if (!SOLO_LETRAS.test(cita.paciente)) {
      errores.paciente = 'El nombre solo puede tener letras y espacios.';
    }

    // Documento
    if (!cita.documento) {
      errores.documento = 'El documento es obligatorio.';
    } else if (!SOLO_NUMEROS.test(cita.documento)) {
      errores.documento = 'Debe tener solo números, entre 6 y 10 dígitos.';
    }

    // Especialidad y médico
    if (!cita.especialidad) errores.especialidad = 'Selecciona una especialidad.';
    if (!cita.medico) {
      errores.medico = 'El nombre del médico es obligatorio.';
    } else if (!SOLO_LETRAS.test(cita.medico)) {
      errores.medico = 'El nombre del médico solo puede tener letras.';
    }

    // Fecha: no se permiten citas "Programadas" en días que ya pasaron
    if (!cita.fecha) {
      errores.fecha = 'La fecha es obligatoria.';
    } else if (cita.estado === 'Programada' && cita.fecha < hoyISO()) {
      errores.fecha = 'Una cita programada no puede quedar en una fecha pasada.';
    }

    // Hora: dentro del horario de atención
    if (!cita.hora) {
      errores.hora = 'La hora es obligatoria.';
    } else if (cita.hora < HORA_INICIO || cita.hora > HORA_FIN) {
      errores.hora = `El horario de atención es de ${HORA_INICIO} a ${HORA_FIN}.`;
    }

    // Choque de horario: el mismo médico no puede tener dos citas a la misma hora
    if (!errores.fecha && !errores.hora && !errores.medico && cita.estado !== 'Cancelada') {
      const choque = existentes.some((otra) =>
        otra.id !== idEnEdicion &&
        otra.estado !== 'Cancelada' &&
        otra.fecha === cita.fecha &&
        otra.hora === cita.hora &&
        otra.medico.toLowerCase() === cita.medico.toLowerCase()
      );
      if (choque) errores.hora = `${cita.medico} ya tiene una cita en esa fecha y hora.`;
    }

    return errores;
  }

  return { validarCita, hoyISO };
})();
