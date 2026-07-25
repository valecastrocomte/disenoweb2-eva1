# AGENTS.md — Gestor de Inventario de Libros

## Misión

Sistema de gestión de biblioteca/editorial: CRUD de libros, autenticación de usuarios, recuperación de contraseñas, y una interfaz visual con temática editorial (tonos madera, papel crema, azul marino, terracota, verde bosque).

---

## Arquitectura: MVC Estricto

```
src/
├── controllers/     # Lógica de negocio por dominio
│   ├── auth.controller.ts    # Login, registro, logout, recuperación
│   └── book.controller.ts    # CRUD de libros
├── models/          # Capa de acceso a datos (servicios Prisma)
│   ├── user.service.ts       # Operaciones CRUD sobre User
│   └── book.service.ts       # Operaciones CRUD sobre Book
├── views/           # Plantillas Handlebars (.hbs)
│   ├── layouts/main.hbs      # Layout maestro (CDN, navbar, footer)
│   ├── partials/navbar.hbs   # Barra de navegación
│   ├── auth/                 # login, register, forgot-password, reset-password
│   ├── books/                # index (inventario), form (crear/editar)
│   └── error.hbs             # Página de error genérica
├── routes/          # Definición de rutas Express
│   ├── index.ts              # Montaje central + middleware global
│   ├── auth.routes.ts        # Rutas de autenticación
│   └── book.routes.ts        # Rutas CRUD protegidas
├── middlewares/      # Middleware custom
│   └── auth.middleware.ts    # requireAuth, requireAdmin
├── types/           # Tipos TypeScript
│   └── express.d.ts          # Augmentación de sesión
├── app.ts           # Configuración central de Express
└── server.ts        # Entry point: arranca el servidor
```

### Flujo de una petición

```
Request → server.ts → app.ts
  → express-session (cookie)
  → res.locals middleware (user, year)
  → routes/index.ts
    → auth.routes.ts | book.routes.ts
      → controller.method(req, res)
        → models/*.service.ts (Prisma)
        → res.render('vista', { data })
  → Handlebars layout/main.hbs → Response
```

### Modelo de datos

**User**: id, name, email (unique), password (bcrypt hash), role, resetToken?, resetTokenExpiry?, createdAt, updatedAt
**Book**: id, title, author, isbn (unique), description?, genre?, year?, quantity, price?, coverUrl?, userId (FK), createdAt, updatedAt

### Variables globales en vistas

```typescript
res.locals.user  // { id, name, email, role } | null
res.locals.year  // number (año actual)
```

---

## Reglas de Oro

Estas reglas son INVIOLABLES. Todo código propuesto DEBE cumplirlas:

### 1. TypeScript estricto
- CERO `any`. Usar tipos explícitos siempre.
- `const` por defecto. `readonly` donde aplique.
- Named exports. Imports relativos con `.js`.
- Strict mode habilitado (`"strict": true` en tsconfig).

### 2. MVC estricto
- Controllers → lógica de negocio + validación + renderizado.
- Models → acceso a datos vía Prisma. NUNCA Prisma directo en controllers.
- Views → Handlebars `.hbs`. NUNCA lógica compleja en plantillas.
- Routes → definición de rutas. Controllers como instancias de clase.

### 3. Seguridad obligatoria
- Contraseñas: SIEMPRE `bcrypt.hash(password, 10)`. NUNCA texto plano.
- Login: `bcrypt.compare(password, user.password)`.
- Tokens: `crypto.randomBytes(32).toString('hex')`. Expiración ≤ 1 hora.
- Limpiar token después del cambio exitoso.
- Sesiones: `httpOnly: true`. Secret desde `.env`, nunca hardcodeado.
- Input: `.trim()`, `.toLowerCase()` en email, validar TODO antes de procesar.
- Rutas: `requireAuth` en rutas protegidas. `requireAdmin` para admin.

### 4. Manejo de errores
- Todo controller envuelto en `try/catch`.
- Logging descriptivo con `console.error`.
- Respuesta al usuario: `res.status(X).render('error', { title, message })`.
- NUNCA exponer stack traces.

### 5. Validaciones
- Todos los campos obligatorios verificados ANTES de procesar.
- Email: regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- Contraseña: mínimo 8 caracteres, 1 letra + 1 número.
- Confirmación: `password === confirmPassword`.
- Errores en `alert-danger` Bootstrap en la misma vista.

### 6. Convenciones de nombre

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos | kebab-case | `book.controller.ts` |
| Clases/Tipos | PascalCase | `BookService` |
| Funciones/variables | camelCase | `getBooks` |
| Rutas | kebab-case | `/forgot-password` |
| Vistas | kebab-case | `forgot-password.hbs` |

### 7. Estructura de respuesta

```typescript
try {
  // Validar → Servicio → Render/Redirect
} catch (error) {
  console.error('Contexto descriptivo:', error);
  res.status(500).render('error', { title: 'Error', message: '...' });
}
```

### 8. Respuestas HTTP

| Código | Uso |
|--------|-----|
| 200 | Éxito (render) |
| 302 | Redirect post-acción |
| 400 | Validación de input fallida |
| 403 | Sin permisos (requireAdmin) |
| 404 | Ruta no encontrada |
| 500 | Error del servidor |

---

## Stack

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Runtime | Node.js | ≥ 20.0.0 |
| Framework | Express | ^4.21.2 |
| Lenguaje | TypeScript | ^5.7.0 (strict) |
| ORM | Prisma | ^6.12.0 |
| Base de datos | SQLite | (via Prisma) |
| Motor de plantillas | express-handlebars | ^8.0.3 |
| Autenticación | bcrypt | ^5.1.1 |
| Sesiones | express-session | ^1.18.1 |
| Variables de entorno | dotenv | ^16.4.7 |
| Dev server | tsx watch | ^4.19.0 |

### Variables de entorno (.env)

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="tu-secreto-aqui"
PORT=3000
```

### Comandos

```bash
npm run dev              # Desarrollo con hot reload
npm run build            # tsc → dist/
npm start                # node dist/server.js
npx tsc --noEmit         # Type-check
npx prisma generate      # Generar cliente Prisma
npx prisma db push       # Sincronizar schema con DB
npx prisma migrate dev   # Crear migración
npx prisma studio        # UI visual de la DB
```

### Archivos estáticos

- Servidos desde `public/` en la raíz del proyecto.
- CSS custom en `public/css/styles.css`.
- CDN: Google Fonts (Playfair Display, Inter), Bootstrap Icons.
