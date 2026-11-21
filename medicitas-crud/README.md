# MediCitas · CRUD de citas médicas desarrollado con IA

**Seminario:** Gestión de Software Ágil asistido por Inteligencia Artificial
**Estudiante:** Juan Sebastian Briñez Contreras — Ingeniería de Software, FET
**Docente:** Camilo Morales Vargas


## 1. Descripción

MediCitas es una aplicación web sencilla para **registrar, consultar, editar y eliminar citas médicas** de una IPS pequeña. Cada cita guarda el paciente, su documento, la especialidad, el médico, la fecha, la hora, el estado (Programada, Atendida o Cancelada) y observaciones.

Escogí este tema porque trabajo en el sector salud y conozco el problema real: la agenda de citas cambia todo el tiempo (se reprograman, se cancelan, se atienden), así que es un caso natural para practicar las cuatro operaciones CRUD.


## 3. Tecnologías utilizadas

 **HTML5** — estructura de la página y formulario.
 **CSS3** — estilos con variables, Grid, Flexbox y media queries (sin frameworks).
 **JavaScript (ES6+)** — lógica del CRUD, sin librerías.
 **localStorage** — almacenamiento de los datos en el navegador.
 **IA:** Claude (Anthropic) para generar y refactorizar el código.
 **Git y GitHub** — control de versiones y publicación.




## 6. Capturas de pantalla

Listado de citas 
[Listado de citas](capturas/03-listado.png)

Validaciones del formulario (Create)
[Validaciones](capturas/02-validaciones.png)

Editando una cita (Update)
[Edición](capturas/04-editando.png)

Confirmación antes de eliminar (Delete)
[Eliminar](capturas/05-confirmar-eliminar.png)


## 7. Prompts utilizados

Estos son los prompts que usé, en orden. Cada uno tiene qué pedí y para qué.

### Prompt 1 — Planeación y estructura del proyecto

Voy a crear una aplicación web CRUD de citas médicas para una IPS pequeña, usando solo
HTML, CSS y JavaScript puro, guardando los datos en localStorage sin servidor.
Cada cita tiene: paciente, documento, especialidad, médico, fecha, hora, estado
Programada, Atendida, Cancelada y observaciones.
Propón la estructura de carpetas y archivos separando datos, validaciones, vista y
controlador, y explica en una línea qué hace cada archivo.

Qué pedí y para qué: antes de escribir código, pedí un plan. Así definí desde el inicio la arquitectura en 4 archivos JS y evité tener todo mezclado en uno solo.

### Prompt 2 — Interfaz HTML

Genera el index.html con: un encabezado con el nombre "MediCitas", 4 tarjetas de resumen
(total, programadas, atendidas, canceladas), un formulario con todos los campos de la
cita (especialidad como lista desplegable) y una tabla para listar las citas con botones
Editar y Eliminar. Usa etiquetas semánticas, labels en cada campo y textos en español.

Qué pedí y para qué: la estructura visual de la app. Pedí etiquetas semánticas y `label` para que sea accesible y ordenada.

### Prompt 3 — Capa de datos (CRUD en localStorage)

Crea storage.js con un módulo CitasStorage que tenga las funciones obtenerTodas,
obtenerPorId, crear, actualizar y eliminar usando localStorage. Cada cita debe tener un
id único y fecha de creación. Maneja el caso en que el JSON guardado esté dañado.
Comenta cada función en español.

Qué pedí y para qué: el corazón del CRUD. Pedí que sea un módulo independiente para que la interfaz nunca toque `localStorage` directamente.

### Prompt 4 — Create y Read: guardar y listar

Crea app.js y ui.js para que al enviar el formulario se guarde la cita y la tabla se
actualice sin recargar la página. Ordena las citas por fecha y hora y actualiza los
contadores del resumen. Pinta los datos con textContent en lugar de innerHTML.

Qué pedí y para qué: conectar el formulario con los datos (Create) y mostrar la lista (Read). Pedí `textContent` para evitar inyección de código (XSS).

### Prompt 5 — Update: editar con el mismo formulario

Implementa la edición: al pulsar "Editar", carga la cita en el mismo formulario, cambia
el título a "Editar cita", el botón a "Actualizar cita" y muestra un botón "Cancelar
edición". Usa un input oculto con el id para saber si se crea o se actualiza.
Usa delegación de eventos en la tabla.

Qué pedí y para qué: reutilizar un solo formulario para crear y editar, en vez de duplicar código. La delegación de eventos permite que funcionen los botones de filas nuevas.

### Prompt 6 — Delete con confirmación

Implementa eliminar con una ventana modal propia (no uses confirm() del navegador) que
muestre el nombre del paciente, la fecha y la hora antes de borrar. Debe cerrarse con
Escape o haciendo clic afuera. Si la cita eliminada se estaba editando, limpia el formulario.

Qué pedí y para qué evitar borrados por accidente y cubrir un caso límite (borrar la cita que se está editando).

### Prompt 7 — Validaciones

Crea validaciones.js con una función validarCita que devuelva un objeto de errores por
campo. Reglas: obligatorios, documento solo números de 6 a 10 dígitos, nombres solo letras,
hora entre 06:00 y 20:00, no permitir citas Programadas en fechas pasadas y no permitir
que un mismo médico tenga dos citas activas en la misma fecha y hora. Muestra cada error
debajo de su campo en rojo.

**Qué pedí y para qué:** que la app no acepte datos incorrectos. La regla de choque de horario la agregué yo porque es un problema real en la agenda de un hospital.

### Prompt 8 — Búsqueda, filtro y datos de ejemplo

Agrega un buscador que filtre en tiempo real por paciente, documento o médico, un
filtro por estado y un botón "Cargar datos de ejemplo" con 4 citas cuyas fechas se
calculen a partir de hoy, para que nunca queden en el pasado.

**Qué pedí y para qué:** mejorar la parte de Read y facilitar la demostración en el video.

### Prompt 9 — Estilos y diseño responsive

Escribe styles.css con un diseño limpio de tipo clínico (verde azulado), variables CSS
para los colores, etiquetas de color para cada estado, notificaciones tipo toast y
diseño responsive. En pantallas pequeñas la tabla debe convertirse en tarjetas.

Qué pedí y para qué: darle una identidad visual propia y que se pueda usar en el celular.

### Prompt 10 — Refactorización y corrección de errores

Revisa todo el código como si fueras un revisor de código: encuentra errores, código
repetido y casos que no se manejan. Al probar encontré dos problemas: (1) la fecha en la
tabla se parte en tres líneas ("17 de nov de 2026") y (2) en el celular la tabla se sale
del ancho de la pantalla. Corrígelos y explícame la causa de cada uno.

Qué pedí y para qué: mejorar el código después de probarlo. La IA explicó que el desborde venía de que los elementos de una cuadrícula CSS no se encogen por defecto (se corrigió con `min-width: 0`) y la fecha se cambió a un formato corto propio (`17 nov 2026`).

### Prompt 11 — Documentación

Ayúdame a redactar el README.md del proyecto con: nombre, descripción, tecnologías,
instrucciones para ejecutar, estructura de archivos, capturas y la lista de prompts
usados con su explicación.

Qué pedí y para qué: documentar el proyecto. Después lo revisé y lo ajusté con mis propias palabras.

## 8. Mis ajustes y decisiones propias

La IA dio la base, pero estas decisiones y cambios fueron míos:
el tema (citas médicas) y los campos, basados en mi experiencia en el sector salud.
La regla de choque de horario** del médico y que no cuente las citas canceladas.
Separar el código en 4 archivos** con una responsabilidad cada uno.
Corregir lo que encontré probando:** formato de fecha y desborde en celular.
Revisé que cada función tuviera comentarios claros en español y entiendo qué hace cada parte.

## 9. Uso responsable de la IA

La IA fue una herramienta de apoyo. Revisé y probé cada parte del código antes de aceptarla, corregí los errores que aparecieron y puedo explicar cómo funciona cada archivo. El código final es responsabilidad mía.