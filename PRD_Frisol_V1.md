# Product Requirements Document (PRD) - Frisol V1

## 1. Visión y Objetivo
**Frisol V1** es una plataforma centralizada (B2B/Interna) diseñada para el relevamiento, diagnóstico, y seguimiento de incidencias o "dolores" experimentados por clientes. Utiliza marcos metodológicos de resolución de problemas (Lean, Root Cause Analysis, 5W1H, los 5 Porqués) para transformar simples reportes de soporte en planes estructurados de diagnóstico con KPIs medibles.

El sistema empodera a las diferentes "Tribus" (unidades de negocio como Retail, Finance, Telco, Cross) proporcionándoles un flujo de trabajo de 7 fases estructuradas: desde el conocimiento inicial del cliente hasta el cierre del proyecto, involucrando a Customer Success Managers, Product Owners y Desarrolladores.

---

## 2. Roles de Usuario

| Rol | Descripción y Permisos |
| :--- | :--- |
| **admin** | Gestor global del sistema. Puede crear nuevos usuarios, designar roles y administrar accesos o tribus enteras (vía `/admin/users`). |
| **csm** (Customer Success) | El dueño principal del contacto con el cliente. Inicia los proyectos (`PRJ-XXXXX`), recaba los síntomas (5W1H), captura la evidencia y valida con el cliente la satisfacción. |
| **po** (Product Owner) | Analiza cómo los "dolores" impactan transversalmente el producto; define o revisa los KPIs, y prioriza el problema frente a desarrollo. |
| **dev** (Developer) | Encargado o soporte de participar en el análisis técnico profundo, la investigación (Causas/Root Cause), y ejecutar soluciones tecnológicas. |

---

## 3. Arquitectura Técnica
- **Infraestructura**: Despliegue en contenedores vía Docker/Docker Compose.
- **Base de Datos**: PostgreSQL 16 Alpine.
- **Backend (API)**: NestJS (con Typescript en Node.js). Expuesto en puerto 3001. Contiene la lógica transaccional. Encriptación mediante bcrypt (`pgcrypto`).
- **Frontend**: Single Page Application construida con React, Vite, y TypeScript. Manejo de estado local con Zustand y caché persistente con Tamstack Query (React Query). Estilos basados en Tailwind CSS y uso de React Router. Mapeo de puertos en :80 clásico vía Nginx.

---

## 4. Entidades y Esquema de Datos Principal

1. **Tribes**: Unidades de estructuración (`id`, `name`). Por defecto: Retail, Finance, Telco, Cross.
2. **Users**: Entidad de logueo (`email`, `password_hash`, `role`, `tribe_id`).
3. **Projects**: El corazón transaccional del sistema.
  - **Identificador**: Auto genérico secuencial `PRJ-00001`...
  - **Estados**: `en_progreso`, `terminado`, `cerrado`.
  - Contiene información genérica: `nombre_cliente`, `crm_id`, audit track (cerrado by, terminado by).
4. **Symptoms (Diagrama 5W1H)**:
  - Preguntas clave: Qué (what), Quién (who), Cuándo (when), Dónde (where), Cómo (how). Resultan en una Declaración (declaration) del problema.
5. **Causas (Diagrama de los 5 Porqués & Ishikawa)**:
  - Análisis profundo interativo (`why_1` al `why_5`).
  - Origen de la causa raíz: `origin_metodo` (métodos), `origin_maquina` (herramientas de software/hardware), `origin_gobernanza` (procesos).
6. **KPIs**: Indicadores cuantitativos del proyecto (`valor_actual`, `valor_objetivo`).

---

## 5. Flow de Negocio de Proyectos (Las 7 Etapas)

1. **Cliente / Inicio**: Carga de datos base (Cliente, proyecto, interlocutuores principales, fecha de inicio).
2. **Diagnóstico**: Relevamiento técnico del "pain_point". Marco de trabajo: **5W1H** para desgranar qué duele y dónde duele.
3. **Evidencia**: Recolección de validaciones empíricas del problema detectado (logs, capturas interactivas, testimonios).
4. **Voz del Dolor**: Expresión directa de cómo afecta al usuario, con narrativa orientada a producto y Customer Success.
5. **Causas**: Empleo de los **5 Whys** para alcanzar el punto neurálgico del dolor. Clasificación del origen.
6. **Impacto**: Dimensionamiento en negocio y seguimiento mediante la medición de **KPIs**.
7. **Cierre**: Autorización para concluir los esfuerzos (cambio de estado). Auditoría de "quién terminó" y "quién cerró".

> [!NOTE]
> Esta estructura de etapas forzosa asegura que no se salten pasos en metodologías de Quality Assurance para servicios de alto nivel de SLA.

---

## 6. Requerimientos Funcionales Críticos
- **R1 - Seguridad**: Se exige protección de sesión (rutas envueltas en `ProtectedRoute` via `App.tsx` global). No se puede acceder sin un token JWT o store state validado.
- **R2 - Auditoría de Estados**: Cuando el proyecto avanza, los estados `en_progreso` mutan a `terminado` o `cerrado`, dejando estampa local de quién lo efectuó a qué hora en la base de datos (Ej: `cerrado_by`, `cerrado_at`).
- **R3 - Cascadas**: Borrar o deshacer el proyecto debe depurar recursivamente `symptoms`, `causas` y `kpis` (`ON DELETE CASCADE` integrado en esquema SQL).

---

## 7. Alcance (In Scope vs Out of Scope)
**In Scope de Frisol V1**: Creación de un proyecto y todo su seguimiento a lo largo de las 7 páginas obligatorias. Administración básica de usuarios.
**Out of Scope de Frisol V1**: Manejo de facturación, emisión de tickets al cliente final vía Email, integraciones directas bidireccionales con Jira/Hubspot (aún requieren ingresos manuales mediante `crm_id` referencial).
