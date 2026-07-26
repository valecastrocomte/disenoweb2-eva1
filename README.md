# Gestor de Inventario de Libros

Sistema web MVC para la gestión de una biblioteca o editorial personal. Permite a los usuarios registrarse, autenticarse, y administrar un inventario de libros con operaciones CRUD completas, recuperación de contraseñas, y una interfaz visual con temática editorial.

---

## 1. Objetivo del Software

El **Gestor de Inventario de Libros** es una aplicación web diseñada para organizar y administrar colecciones de libros de forma personal. Está orientada a bibliotecas pequeñas, librerías o lectores que deseen mantener un registro digital de su inventario.

### Funcionalidades principales

| Módulo | Funcionalidad |
|--------|---------------|
| **Autenticación** | Registro de usuarios, inicio de sesión con sesiones, cierre de sesión |
| **Recuperación de contraseña** | Enlace de recuperación vía token con expiración de 1 hora |
| **CRUD de libros** | Crear, leer, actualizar y eliminar libros del inventario |
| **Inventario visual** | Tabla con badges de stock (disponible/bajo/agotado), empty state |
| **Validación robusta** | Email válido, contraseñas con complejidad mínima, confirmación de contraseña |
| **UX preservativa** | Campos de email/nombre se mantienen al fallar la validación |

### Flujo de usuario

```
Registrarse → Iniciar Sesión → Ver Inventario → Crear/Editar/Eliminar Libros
                  ↑                                        |
                  └──── Recuperar Contraseña ←─────────────┘
```

---

## Stack Utilizado

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Runtime | Node.js | ≥ 20.0.0 | Ejecución del servidor JavaScript |
| Framework | Express | ^4.21.2 | Routing y middleware HTTP |
| Lenguaje | TypeScript | ^5.7.0 | Type safety estricto (strict mode) |
| ORM | Prisma | ^6.12.0 | Cliente tipado para base de datos |
| Base de datos | SQLite | — | Almacenamiento local sin servidor |
| Plantillas | express-handlebars | ^8.0.3 | Motor de plantillas server-side |
| Autenticación | bcrypt | ^5.1.1 | Hashing de contraseñas (salt 10) |
| Sesiones | express-session | ^1.18.1 | Manejo de sesiones HTTP |
| Variables | dotenv | ^16.4.7 | Configuración desde `.env` |
| Dev server | tsx watch | ^4.19.0 | Hot reload en desarrollo |
| Frontend | Google Fonts + Bootstrap Icons | — | Tipografía e iconografía |

### Comandos disponibles

```bash
npm run dev              # Desarrollo con hot reload (localhost:3000)
npm run build            # Compilar TypeScript a dist/
npm start                # Ejecutar en producción
npx prisma generate      # Generar cliente Prisma
npx prisma db push       # Sincronizar schema con la DB
npx prisma studio        # UI visual de la base de datos
npx tsc --noEmit         # Type-check sin emitir archivos
```
## Instalación y Ejecución

### Prerrequisitos

- [Node.js](https://nodejs.org/) v20 o superior
- npm (viene incluido con Node.js)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/valecastrocomte/disenoweb2-eva1.git
cd disenoweb2-eva1

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario (los valores por defecto funcionan para desarrollo)

# 4. Generar cliente de Prisma y sincronizar base de datos
npx prisma generate
npx prisma db push

# 5. Iniciar el servidor de desarrollo
npm run dev

# 6. Finalizar el servidor de desarrollo
npx kill-port 3000
```

El servidor arranca en **http://localhost:3000**. Al acceder se redirige automáticamente a `/login`.

### Usuario de prueba

Para probar sin registrarse, crea un usuario desde la pantalla de registro (`/register`) con:
- **Email**: tu@correo.com
- **Contraseña**: Mínimo 8 caracteres, 1 letra y 1 número (ej: `clave1234`)

### Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor con hot reload |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada |
| `npx prisma studio` | Abre la UI visual de la base de datos |
| `npx prisma db push` | Sincroniza el schema con la DB después de cambios |
| `npx tsc --noEmit` | Verifica tipos sin generar archivos |
## 2. Estructura de Carpetas

```
├── AGENTS.md                      # Punto de entrada para agentes de IA (arnés agéntico)
├── README.md                      # Este archivo
├── package.json                   # Dependencias y scripts npm
├── tsconfig.json                  # Configuración TypeScript (strict mode)
├── .env                           # Variables de entorno (DATABASE_URL, SESSION_SECRET, PORT)
├── .gitignore
│
├── prisma/
│   ├── schema.prisma              # Schema de base de datos (User, Book)
│   └── dev.db                     # Base de datos SQLite (archivada)
│
├── public/
│   └── css/
│       └── styles.css             # Estilos personalizados (tema editorial/biblioteca)
│
└── src/
    ├── server.ts                  # Entry point: arranca el servidor Express
    ├── app.ts                     # Configuración central (Handlebars, session, middleware)
    │
    ├── controllers/
    │   ├── auth.controller.ts     # Login, registro, logout, forgot/reset password
    │   └── book.controller.ts     # CRUD completo de libros
    │
    ├── models/
    │   ├── user.service.ts        # Servicio Prisma para User
    │   └── book.service.ts        # Servicio Prisma para Book
    │
    ├── routes/
    │   ├── index.ts               # Montaje central + middleware global (user, year)
    │   ├── auth.routes.ts         # Rutas de autenticación
    │   └── book.routes.ts         # Rutas CRUD protegidas con requireAuth
    │
    ├── middlewares/
    │   └── auth.middleware.ts     # requireAuth, requireAdmin
    │
    ├── views/
    │   ├── layouts/
    │   │   └── main.hbs           # Layout maestro (Google Fonts, Bootstrap Icons, CSS)
    │   ├── partials/
    │   │   └── navbar.hbs         # Barra de navegación (sesión-aware)
    │   ├── auth/
    │   │   ├── login.hbs
    │   │   ├── register.hbs
    │   │   ├── forgot-password.hbs
    │   │   └── reset-password.hbs
    │   ├── books/
    │   │   ├── index.hbs          # Tabla de inventario + empty state + modal eliminar
    │   │   └── form.hbs           # Formulario crear/editar libro
    │   └── error.hbs              # Página de error genérica
    │
    └── types/
        └── express.d.ts           # Augmentación de tipo para express-session
```

---

## 3. Justificación Técnica

### Node.js + Express
- **Razón**: Runtime JavaScript en el servidor con ecosistema maduro. Express es el framework web más estable y minimalista de Node, ideal para aplicaciones MVC sin over-engineering.
- **Alternativa descartada**: NestJS (demasiado pesado para este alcance), Fastify (menor ecosistema de middleware).

### TypeScript
- **Razón**: Type safety estricto (`"strict": true` en tsconfig) previene errores en tiempo de compilación. Interfaces explícitas en controllers, services y tipos de sesión. CERO `any` como regla de proyecto.
- **Beneficio**: Refactorizaciones seguras, autocompletado en IDE, detección temprana de bugs.

### Prisma + SQLite
- **Razón**: Prisma ofrece un ORM tipado con schema-first que genera automáticamente el cliente. SQLite elimina la necesidad de un servidor de base de datos separado — ideal para desarrollo local y prototipado rápido.
- **Alternativa descartada**: TypeORM (menos type-safe), raw SQL (pérdida de abstracción).

### Handlebars (express-handlebars)
- **Razón**: Motor de plantillas server-side con sintaxis simple. Layouts anidados, parciales reutilizables, y helpers personalizados (`eq`, `lte`, `gte`). Sin build step ni hidratación compleja como en frameworks SPA.
- **Alternativa descartada**: EJS (sintaxis menos legible), React/Vue SSR (complejidad innecesaria para forms CRUD).

### bcrypt + express-session
- **Razón**: bcrypt con salt rounds 10 es el estándar para hashing de contraseñas. express-session con cookies httpOnly maneja autenticación sin la complejidad de JWT para una app server-rendered.

---

## 4. Uso de IA y Prompts

### Herramienta utilizada

**OpenCode** (modelo `opencode-zen/big-pickle`) — agente de código autónomo con acceso a terminal, lector de archivos, editor, y navegador. Opera dentro del directorio del proyecto con permisos de lectura/escritura.

### Ejemplos de prompts clave

**1. Scaffolding inicial (prompt compuesto)**
> "Actúa como Diseñador UI/UX y Desarrollador Front-End experto. Queremos dar a nuestra aplicación un diseño visual elegante, cálido y temático relacionado con la lectura. Implementa estilos con paleta: fondo crema, navbar azul marino, botones verde bosque/terracota, Google Fonts Playfair Display + Inter."

Resultado: Creación de `public/css/styles.css` (460+ líneas), todos los `.hbs`, y el backend MVC completo delegado a subagente.

**2. Validación de seguridad**
> "Actúa como Desarrollador Backend Senior experto en Seguridad. Actualiza el controlador con: confirmación de contraseña, complejidad mínima (8+ chars, 1 letra + 1 número), validación de email, hash bcrypt."

Resultado: 5 capas de validación en `postRegister`, regex de email, mensajes de error específicos.

**3. Recuperación de contraseña**
> "Actúa como un Desarrollador Backend Senior experto en Node.js, Express, Prisma y Handlebars. Queremos agregar el flujo de Recuperar Contraseña con crypto.randomBytes(32), expiración de 1 hora, y vista de prueba en desarrollo."

Resultado: Flujo completo forgot/reset password con 4 métodos en el controller, 2 vistas nuevas, y routes.

**4. Arnés agéntico**
> "Actúa como un Arquitecto de Software. Crea AGENTS.md con Reglas de Oro: TypeScript estricto, MVC estricto, seguridad obligatoria, manejo de errores, validaciones, convenciones de nombre."

Resultado: `AGENTS.md` con 8 reglas inviolables que guiaron todo el desarrollo posterior.

### Patrón de prompts utilizado

Cada prompt seguía la estructura:
```
Actúa como [rol experto].
Queremos [objetivo concreto].
Implementa [cambios específicos].
[Restricciones técnicas y de seguridad].
```

---

## 5. Patrón de Arquitectura: MVC

La aplicación sigue el patrón **MVC (Model-View-Controller)** de forma estricta, donde cada capa tiene una responsabilidad definida y no se mezclan concerns.

### Modelo (Model) — `src/models/`

Capa de acceso a datos que encapsula todas las operaciones de Prisma.

```typescript
// src/models/book.service.ts
export class BookService {
  async findAll(): Promise<BookWithUser[]> {
    return prisma.book.findMany({
      include: { user: { select: { id: true, name: true } } },
      orderBy: { title: 'asc' },
    });
  }
}
```

- Cada service es una clase con métodos CRUD.
- Usa `PrismaClient` como única conexión a la DB.
- **NUNCA** se usa Prisma directamente en controllers.

### Vista (View) — `src/views/`

Plantillas Handlebars server-side con layout maestro.

```
views/
├── layouts/main.hbs      ← CDN + navbar + footer (se inyecta {{{body}}})
├── partials/navbar.hbs   ← Reutilizable en todas las páginas
├── auth/                 ← Formularios de autenticación
├── books/                ← Inventario y formularios CRUD
└── error.hbs             ← Error genérico
```

- Helpers Handlebars (`eq`, `lte`, `gte`) para lógica condicional simple.
- Datos recibidos del controller como variables de template (`{{title}}`, `{{#each books}}`).
- **NUNCA** se ejecuta lógica de negocio en las vistas.

### Controlador (Controller) — `src/controllers/`

Orquesta la lógica de negocio: valida input → llama al model → renderiza o redirige.

```typescript
// src/controllers/book.controller.ts
export class BookController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const books = await bookService.findAll();
      res.render('books/index', { title: 'Libros', books });
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).render('error', { title: 'Error', message: '...' });
    }
  }
}
```

- Cada controller es una clase instanciada en el router.
- Todo método es `async` con `try/catch`.
- Validaciones de input ANTES de llamar al service.

### Rutas (Routes) — `src/routes/`

Definen qué controlador responde a cada HTTP method + path.

```typescript
// src/routes/book.routes.ts
bookRouter.use(requireAuth);           // Middleware global del router
bookRouter.get('/new', controller.getNew);     // Estáticas ANTES de dinámicas
bookRouter.get('/:id/edit', controller.getEdit);
```

### Flujo completo

```
HTTP Request
  → app.ts (session, body parser, static files)
    → routes/index.ts (res.locals middleware)
      → auth.routes.ts | book.routes.ts
        → controller.method(req, res)
          → model.service.ts (Prisma query)
          → res.render('vista', { data })  // o res.redirect()
            → Handlebars + main.hbs layout
              → HTTP Response
```

---

## 6. Constitución del Arnés Agéntico

### ¿Qué es el arnés agéntico?

El archivo `AGENTS.md` en la raíz del proyecto funciona como el **punto de entrada y contrato de código** para cualquier agente de IA que trabaje en el repositorio. Establece las reglas que el agente DEBE seguir antes de proponer o escribir código.

### Estructura de AGENTS.md

El archivo contiene 8 secciones organizadas:

| Sección | Propósito |
|---------|-----------|
| **Misión** | Describe qué es el software y para qué sirve |
| **Arquitectura** | Estructura de directorios, flujo de petición, modelo de datos |
| **Reglas de Oro** | 8 reglas inviolables que todo código debe cumplir |
| **Stack** | Tecnologías, versiones, dependencias |
| **Variables de entorno** | Configuración de `.env` |
| **Comandos** | Scripts npm y prisma disponibles |

### Las 8 Reglas de Oro

1. **TypeScript estricto** — CERO `any`, `const` por defecto, named exports.
2. **MVC estricto** — Separación clara de responsabilidades.
3. **Seguridad obligatoria** — bcrypt, tokens crypto, sesiones httpOnly.
4. **Manejo de errores** — try/catch en todo controller, sin stack traces al cliente.
5. **Validaciones** — Regex email, complejidad de contraseña, confirmación.
6. **Convenciones de nombre** — kebab-case archivos, PascalCase clases, camelCase funciones.
7. **Estructura de respuesta** — Patrón try/catch con logging descriptivo.
8. **Respuestas HTTP** — Códigos correctos (200, 302, 400, 403, 404, 500).

### Cómo guió el desarrollo

Cada prompt de desarrollo hacía referencia implícita o explícita a las reglas de `AGENTS.md`:

| Fase del proyecto | Regla de Oro aplicada |
|-------------------|----------------------|
| MVC inicial | Regla 2 (MVC estricto) + Regla 6 (nombres kebab-case) |
| Validación auth | Regla 5 (validaciones) + Regla 3 (seguridad) |
| Recuperación contraseña | Regla 3 (tokens crypto, expiración) |
| Preservación de campos UX | Regla 7 (estructura de respuesta) |
| Arquitectura de rutas | Regla 2 (estáticas antes de dinámicas) |

### Commit history como evidencia

```
bbe105d fix(auth): preservar nombre y email en registro cuando falla la validacion
9423da6 fix(auth): preservar email en login cuando fallan las credenciales
44adae8 refactor: consolidar arnés agéntico en un solo AGENTS.md
34034ed docs: crear arnés agéntico con reglas de arquitectura
e27d44d feat(auth): flujo completo de recuperación de contraseña
4a12746 feat(auth): validación robusta de registro y login
2526d01 feat(config): helpers Handlebars y montaje de rutas
e12e6af feat(frontend): tema visual biblioteca + vistas Handlebars
9b8255f feat(backend): modelos, controladores, rutas y middleware MVC
7341cf7 configuracion inicial con arnes agentico
```

Cada commit es atómico, descriptivo, y respeta las convenciones establecidas en el arnés. El desarrollo se mantuvo alineado porque el agente consultó `AGENTS.md` como contrato de código antes de cada cambio.

---

## Comandos rápidos

```bash
# Instalación
npm install
npx prisma generate
npx prisma db push

# Desarrollo
npm run dev              # http://localhost:3000

# Build
npm run build
npm start
```

## Licencia

Proyecto académico — Gestor de Inventario de Libros.
