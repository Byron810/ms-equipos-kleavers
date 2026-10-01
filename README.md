# Kleavers — Plataforma Web de Coordinación de Eventos

Aplicación web responsive para el equipo de coordinación de eventos de Kleavers. Permite visualizar de forma centralizada la disponibilidad de equipos, el estado de los eventos activos y la información de clientes, eliminando la necesidad de llamadas telefónicas o revisiones manuales para confirmar si es posible atender una nueva solicitud de evento.

**Proyecto Programado I — Diseño de Software · Fase I**
Instituto Tecnológico de Costa Rica — Sede San Carlos

---

## 📋 Descripción del Proyecto

Kleavers resuelve los siguientes problemas de coordinación operativa:

- Falta de visibilidad inmediata sobre la disponibilidad de equipos e inventario al momento de coordinar un nuevo evento.
- Ausencia de un flujo claro para registrar un evento nuevo, asociando clientes, equipos y servicios de catering en un mismo proceso.
- Dificultad para consultar el estado financiero y operativo de cada evento sin recurrir a información dispersa.
- Riesgo de error humano al no existir validaciones visuales que prevengan asignar un equipo no disponible o dejar campos incompletos.

Esta Fase I contempla una aplicación funcional **sin backend real**, utilizando mock services en Azure API Management para simular las respuestas del servidor.

---

## ✨ Funcionalidades principales

- Dashboard con resumen de eventos activos, alertas de disponibilidad y accesos rápidos.
- CRUD completo de Eventos, Clientes y Equipos, con paginación y búsqueda/filtrado en tablas.
- Flujo de creación de evento en 3 pasos (Cliente y Detalles → Equipos → Catering y Resumen), con validación visual de disponibilidad de equipos en tiempo real.
- Modo claro y oscuro con persistencia.
- Diseño responsive (escritorio y móvil).
- Feedback visual (notificaciones de éxito/error/advertencia) y estados vacíos en tablas.

---

## 🖥️ Capturas de Pantalla

> ⚠️ **PENDIENTE — Responsable: Persona 2 (Frontend)**
> Reemplazar esta sección con capturas reales de la aplicación ya desplegada (no del mockup de Figma). Se recomienda incluir al menos: Dashboard, Lista de Eventos, Crear Evento (paso con validación de disponibilidad), y la vista móvil. Formato sugerido:
>
> `![Dashboard](docs/screenshots/dashboard.png)`

---

## 🚀 Instrucciones de Despliegue Local

> ⚠️ **PENDIENTE — Responsable: Persona 2 y Persona 3**
> Completar con los pasos reales del proyecto. Guía de lo que debe incluir esta sección:
>
> ```
> 1. Clonar el repositorio
>    git clone [URL_DEL_REPO]
>
> 2. Instalar dependencias
>    [comando real, ej. npm install]
>
> 3. Configurar variables de entorno
>    [indicar qué variables son necesarias, ej. URL de Azure APIM, SIN incluir las llaves reales]
>
> 4. Levantar el proyecto en local
>    [comando real, ej. npm run dev]
>
> 5. Acceder en el navegador
>    [ej. http://localhost:3000]
> ```
>
> También indicar: versión de Node.js requerida, y cualquier dependencia externa necesaria (ej. CLI de Azure, Postman para probar los mocks).

---

## 🌐 Aplicación Desplegada

> ⚠️ **PENDIENTE — Responsable: Persona 3 (DevOps/Infraestructura)**
> Agregar el enlace de la aplicación en producción (Azure Static Web Apps) y la versión actual visible en la app, asociada al tag automático de Git.
>
> - **URL de producción:** `[pendiente]`
> - **Versión actual:** `[pendiente — ej. v1.2.0]`

---

## 📂 Estructura del Repositorio

> ⚠️ **PENDIENTE — Responsable: Persona 3**
> Reemplazar con el árbol real de carpetas del proyecto una vez esté organizado. Ejemplo de formato esperado:
>
> ```
> /
> ├── .github/workflows/     # Pipelines de CI/CD (GitHub Actions)
> ├── src/
> │   ├── components/
> │   ├── pages/
> │   └── ...
> ├── docs/
> │   └── screenshots/
> ├── mocks/                 # Definiciones de Mock Services (Azure APIM)
> └── README.md
> ```

---

## 🛠️ Tecnologías y Herramientas Utilizadas

| Categoría | Herramienta |
|---|---|
| Diseño UI/UX | Figma |
| Frontend | *(pendiente — Persona 2: framework/librería utilizada)* |
| Mock Services | Azure API Management (Consumption) |
| Autenticación | Google Auth |
| Hosting | Azure Static Web Apps |
| CI/CD | GitHub Actions |
| Control de versiones | GitHub |
| Pruebas de API | Postman |
| Gestión de ramas/commits | SourceTree |

> ⚠️ **PENDIENTE — Responsable: Persona 2**
> Completar la fila de "Frontend" con el framework/librería real utilizada (ej. React, Vue, Angular) y cualquier librería adicional relevante (ej. manejo de estado, componentes UI).

---

## 👥 Créditos

**Equipo de desarrollo:**
Nombre//principalEncargaodDe
- J.Josias Fernandez — Diseño UX/UI y Documentación
- Byron Jiménez Abarca — Frontend y Patrones UX
- Nahomy Vargas Solis — Arquitectura, Mock Services y DevOps/CI-CD

**Curso:** Diseño de Software
**Profesor:** Marcos Rodríguez
**Institución:** Instituto Tecnológico de Costa Rica, Sede San Carlos

---

## 📄 Documentación Adicional

- [Informe de Diseño UI/UX](./docs/Informe_Diseno_UIUX_Kleavers.docx)
- [Documento Formal del Proyecto](./docs/Documento_Formal_Kleavers.docx)
- [Diagrama de Arquitectura (Draw.io)](./docs/diagrama-arquitectura.drawio) — *pendiente, Persona 3*
