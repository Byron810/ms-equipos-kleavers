# Kleavers — Plataforma Web de Coordinación de Eventos

Aplicación web responsive para el equipo de coordinación de eventos de Kleavers. Permite visualizar de forma centralizada la disponibilidad de equipos, el estado de los eventos activos y la información de clientes, eliminando la necesidad de llamadas telefónicas o revisiones manuales para confirmar si es posible atender una nueva solicitud de evento.

**Proyecto Programado I — Diseño de Software · Fase I**
Instituto Tecnológico de Costa Rica — Sede San Carlos

---

## Descripción del Proyecto

Kleavers resuelve los siguientes problemas de coordinación operativa:

- Falta de visibilidad inmediata sobre la disponibilidad de equipos e inventario al momento de coordinar un nuevo evento.
- Ausencia de un flujo claro para registrar un evento nuevo, asociando clientes, equipos y servicios de catering en un mismo proceso.
- Dificultad para consultar el estado financiero y operativo de cada evento sin recurrir a información dispersa.
- Riesgo de error humano al no existir validaciones visuales que prevengan asignar un equipo no disponible o dejar campos incompletos.

Esta Fase I contempla una aplicación funcional **sin backend real**, utilizando mock services en Azure API Management para simular las respuestas del servidor.

---

## Funcionalidades principales

- Dashboard con resumen de eventos activos, alertas de disponibilidad y accesos rápidos.
- CRUD completo de Eventos, Clientes y Equipos, con paginación y búsqueda/filtrado en tablas.
- Flujo de creación de evento en 3 pasos (Cliente y Detalles → Equipos → Catering y Resumen), con validación visual de disponibilidad de equipos en tiempo real.
- Modo claro y oscuro con persistencia.
- Diseño responsive (escritorio y móvil).
- Feedback visual (notificaciones de éxito/error/advertencia) y estados vacíos en tablas.

---

## Capturas de Pantalla

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Lista de Eventos
![Lista de Eventos](docs/screenshots/eventos.png)

### Crear Evento
![Crear Evento](docs/screenshots/crearevento.png)

### Vista Móvil
![Vista Móvil](docs/screenshots/movil.jpeg)

---

## Instrucciones de Despliegue Local

```
1. Clonar el repositorio
   git clone https://github.com/nahomyVargasS/ProyectoKleavers.git
   cd ProyectoKleavers/frontend

2. Instalar dependencias
   npm install

3. Configurar variables de entorno
   Crear un archivo .env dentro de frontend/ con:
   VITE_API_BASE_URL=https://kleavers-apim.azure-api.net/v1
   VITE_GOOGLE_CLIENT_ID=838687610360-uq4qhudd7e639ttot4mev332m0rjkrf3.apps.googleusercontent.com

4. Levantar el proyecto en local
   npm run dev

5. Acceder en el navegador
   http://localhost:5173/
```

**Requisitos:** Node.js 18 o superior, npm.
**Dependencias externas para pruebas:** Postman (para probar los endpoints de la APIM usando el token JWT de Google Auth como autorización).

---

## Aplicación Desplegada

- **URL de producción:** https://zealous-coast-0924c7910.6.azurestaticapps.net/
- **Versión actual:** v1.0.0

La versión mostrada en el Dashboard se inyecta automáticamente desde el tag de Git generado por el pipeline de GitHub Actions en cada despliegue.

---

## Estructura del Repositorio

```
/
├── .github/workflows/     → Pipelines de CI/CD (GitHub Actions)
├── docs/                  → Documentación, wireframes, diagramas, capturas
├── frontend/              → Código fuente de la aplicación (ver detalle abajo)
└── README.md
```

**Detalle de `frontend/`:**

```
frontend/
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── ui/
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── Spinner.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   └── useDebounce.js
│   ├── pages/
│   │   ├── Clientes.jsx
│   │   ├── CrearEvento.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DetalleEvento.jsx
│   │   ├── Equipos.jsx
│   │   ├── Eventos.jsx
│   │   ├── Login.jsx
│   │   └── NotFound.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── clientesService.js
│   │   ├── equiposService.js
│   │   └── eventosService.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
└── package.json
```

---

## Tecnologías y Herramientas Utilizadas

| Categoría | Herramienta |
|---|---|
| Diseño UI/UX | Figma |
| Frontend | React 19 + Vite |
| Enrutamiento | React Router DOM |
| Estilos | Tailwind CSS v3 (modo oscuro nativo con `darkMode: 'class'`) |
| Cliente HTTP | Axios |
| Formularios y validación | React Hook Form + Zod |
| Notificaciones | React Toastify |
| Íconos | Lucide React |
| Tablas | TanStack Table |
| Mock Services | Azure API Management (Consumption) |
| Autenticación | Google Auth |
| Hosting | Azure Static Web Apps |
| CI/CD | GitHub Actions |
| Control de versiones | GitHub |
| Pruebas de API | Postman |
| Gestión de ramas/commits | SourceTree |

---

## Créditos

**Equipo de desarrollo:**
- J. Josias Fernández — Diseño UX/UI y Documentación
- Byron Jiménez Abarca — Frontend y Patrones UX
- Nahomy Vargas Solís — Arquitectura, Mock Services y DevOps/CI-CD

**Curso:** Diseño de Software
**Profesor:** Marcos Rodríguez
**Institución:** Instituto Tecnológico de Costa Rica, Sede San Carlos

---

## Documentación Adicional

- [Informe de Diseño UI/UX](./docs/Informe_Diseno_UIUX_Kleavers.docx)
- [Documento Formal del Proyecto](./docs/Documento_Formal_Kleavers.docx)
- [Diagrama de Arquitectura (Draw.io)](./docs/diagrama/diagrama-arquitectura.drawio.svg) · [Vista previa (PNG)](./docs/diagrama/diagrama.png)
