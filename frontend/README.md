# Kleavers — Frontend (Fase I)

Aplicación web responsive para la gestión de eventos, clientes y equipos.

## 🛠️ Tecnologías

- **React 19** + **Vite**
- **Tailwind CSS v3** (con `darkMode: 'class'`)
- **React Router DOM** (navegación)
- **Axios** (peticiones HTTP)
- **React Hook Form + Zod** (validación)
- **React Toastify** (feedback)
- **Lucide React** (iconos)
- **TanStack Table** (tablas)

## 📦 Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/nahomyVargasS/ProyectoKleavers.git
cd ProyectoKleavers/frontend

# 2. Instalar dependencias
npm install

# 3. Crear el archivo .env basado en .env.example
cp .env.example .env
# Editar .env con las URLs reales de APIM

# 4. Correr en desarrollo
npm run dev