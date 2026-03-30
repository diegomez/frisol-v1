# Esquema de Wireframes (UI Mappings) - Frisol V1

Este documento mapea la estructura visual e interactiva de las páginas de la plataforma, guiadas por el sistema de ruteo de `App.tsx` y el flujo de los 7 pasos.

## 1. Login Page (`/login`)
- **Layout**: Centrado (Glassmorphism card sobre fondo tenue/imagen abstracta).
- **Componentes**:
  - Logo "Frisol" (Header).
  - Selector de Correo/Email (`input[type=email]`).
  - Input de Contraseña (`input[type=password]`).
  - Botón: `[ 🔐 Iniciar Sesión ]` (Deshabilitado si está vacío).
- **Interacción**: Redirecciona a `/dashboard` si es exitoso.

---

## 2. Dashboard General (`/dashboard`)
- **Layout**: Barra de navegación superior (Navbar) y contenido en cuadrícula (Grid).
- **Navbar**: Logo | Menú de usuario (Derecha, con opción de Logout). Si el usuario es `admin`, se ve el link `[ 👥 Usuarios ]`.
- **Área Principal**:
  - Título: `Hola, {nombre} - Tribu {tribu}`
  - Botón Acción Primaria: `[ + Nuevo Proyecto/Incidencia ]`
  - **Tabla/Tarjetas de Proyectos Activos**:
    - Muestra ID (`PRJ-00001`), Cliente, Estado (En Progreso / Cerrado), y Fecha de inicio.
    - Botón de Acción en la fila: `[ ➡️ Abrir Proyecto ]`

---

## 3. Administrador de Usuarios (`/admin/users`) *Solo Admin*
- **Layout**: Similar al dashboard (Navbar arriba).
- **Área Principal**:
  - Título: `Gestión de Accesos`
  - Botón: `[ + Crear Usuario ]`
  - **Tabla de Usuarios**: Display de Email, Nombre, Rol (`csm`, `admin`, `po`, `dev`), Tribu y un Toggle Activo/Inactivo.

---

## Flujo del Proyecto (Layout Envolvente: `ProjectLayout`)
**Rutas Válidas**: `/projects/:id/*`
- Todos los pasos siguientes comparten un *Layout*:
  - **Header**: ID del proyecto y Nombre del Cliente.
  - **Sidebar / Stepper horizontal**: Una barra de progreso que muestra los 7 pasos obligatorios. El paso actual está resaltado.

### 3.1 Paso 1: Cliente (`1-cliente`)
- **Sección Izquierda**: Datos Generales (Read Only, tomados de la BD si ya se creó):
  - ID de CRM, Cliente, Fecha.
- **Formulario**:
  - `Nombre del Proyecto` (Text Input)
  - `Interlocutores` (Text Area / Tag Input)
- **Footer del Layout**: Botón flotante derecho `[ Siguiente: 2 - Diagnóstico ➡️ ]`.

### 3.2 Paso 2: Diagnóstico (`2-diagnostico`)
- **Estructura Formulario (Metodología 5W1H)**:
  - Trello/Card Style o formularios apilados:
    - **What?** (Qué sucede)
    - **Who?** (A quién afecta)
    - **When?** (Cuándo ocurre)
    - **Where?** (Dónde se evidencia)
    - **How?** (Cómo se manifiesta)
  - **Caja de Resumen (Declaration)**: Auto-generada o rellenable. Expresa el dolor en 1 frase.
- **Footer**: `[ ⬅️ Atrás ]` | `[ Siguiente: 3 - Evidencia ➡️ ]`.

### 3.3 Paso 3: Evidencia (`3-evidencia`)
- **Área de Drag & Drop**: Para subir capturas de pantalla, archivos o documentos.
- **Text Area Rica**: Para describir los pasos para reproducir o adjuntar logs. (Campo: `evidencia`).
- **Footer**: `[ ⬅️ Atrás ]` | `[ Siguiente: 4 - Voz del Dolor ➡️ ]`.

### 3.4 Paso 4: Voz del Dolor (`4-voz-dolor`)
- **Layout de Enfoque Humanizado**:
  - **Text Area Grande** (Estilo cita / Quote block): *"¿Qué dice el cliente literalmente sobre esto?"*
  - Oportunidad para que el PO entienda la fricción real, no solo la técnica.
- **Footer**: `[ ⬅️ Atrás ]` | `[ Siguiente: 5 - Causas ➡️ ]`.

### 3.5 Paso 5: Causas (`5-causas`)
- **Gráfico de Ishikawa Interactivo** o **Listado 5 Whys**:
  - 5 inputs en cascada: *Por qué 1 -> Por qué 2 -> Por qué 3 -> Por qué 4 -> Por qué 5*
  - **Causa Raíz** (Input Final bloqueado hasta llenar al menos 3 Porqués).
- **Selector de Origen del Problema** (Checkboxes/Radio):
  - `[ ] Goberanza` | `[ ] Máquina/Tecnología` | `[ ] Método/Proceso`
- **Footer**: `[ ⬅️ Atrás ]` | `[ Siguiente: 6 - Impacto ➡️ ]`.

### 3.6 Paso 6: Impacto (`6-impacto`)
- **Sección Impacto de Negocio**:
  - Text area para relatar cómo este problema se traduce en pérdida monetaria, retasamiento de SLA o churn/fuga.
- **Sección KPIs (Tabla Dinámica)**:
  - Botón: `[ + Agregar Métrica ]`
  - Fila: `Nombre Métrica (Texto)` | `Valor Actual` | `Valor Objetivo`.
- **Footer**: `[ ⬅️ Atrás ]` | `[ Siguiente: 7 - Cierre ➡️ ]`.

### 3.7 Paso 7: Cierre (`7-cierre`)
- **Resumen Completo**: Una vista read-only o un PDF exportable mostrando los 6 pasos anteriores amalgamados (El Diagnóstico, La Causa Raíz, La Voz del Dolor y Los KPIs de resolución).
- **Botón de Acción Final (Call to Action principal - Rojo/Verde)**:
  - `[ ✅ Finalizar Fase de Diagnóstico y Marcar Terminado ]` (Solo visible si todo está completo).
  - Al clickear, el estado cambia y el nombre de quien cierra queda estampado en base de datos. Se vuelve al dashboard.
