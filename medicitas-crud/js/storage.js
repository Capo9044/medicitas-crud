/**

  /** Lee todas las citas guardadas. Si no hay nada o el dato está dañado, devuelve []. */
  function obtenerTodas() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE));
      return Array.isArray(datos) ? datos : [];
    } catch (error) {
      console.error('Datos dañados en localStorage, se reinicia la lista.', error);
      return [];
    }
  }

  /** Sobrescribe la lista completa en localStorage. */
  function guardarTodas(citas) {
    localStorage.setItem(CLAVE, JSON.stringify(citas));
  }

  /** Genera un identificador único para cada cita. */
  function generarId() {
    // crypto.randomUUID existe en navegadores modernos; si no, usamos fecha + aleatorio
    if (window.crypto && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /** Agrega una cita nueva y la devuelve con su id y fecha de creación. */
  function crear(datos) {
    const citas = obtenerTodas();
    const nueva = {
      ...datos,
      id: generarId(),
      creadaEn: new Date().toISOString(),
      actualizadaEn: null,
    };
    citas.push(nueva);
    guardarTodas(citas);
    return nueva;
  }

 
  /** Busca una sola cita por su id (se usa al editar). */
  function obtenerPorId(id) {
    return obtenerTodas().find((cita) => cita.id === id) || null;
  }

  /** Reemplaza los datos de una cita existente. Devuelve la cita actualizada o null. */
  function actualizar(id, datos) {
    const citas = obtenerTodas();
    const indice = citas.findIndex((cita) => cita.id === id);
    if (indice === -1) return null;

    // Conservamos id y fecha de creación; solo cambiamos los campos editables
    citas[indice] = {
      ...citas[indice],
      ...datos,
      id,
      actualizadaEn: new Date().toISOString(),
    };
    guardarTodas(citas);
    return citas[indice];
  }

  
  /** Elimina una cita por id. Devuelve true si la encontró y la borró. */
  function eliminar(id) {
    const citas = obtenerTodas();
    const restantes = citas.filter((cita) => cita.id !== id);
    guardarTodas(restantes);
    return restantes.length < citas.length;
  }

  // Solo exponemos lo que el resto de la app necesita usar
  return { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
})();
