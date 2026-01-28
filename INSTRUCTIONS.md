# User Service – Project Guide & TypeScript for Beginners

This document explains how the project works, how the code is connected, and teaches you the TypeScript and export/import concepts used here.

---

## Table of Contents

1. [How a Request Flows Through the Project](#1-how-a-request-flows-through-the-project)
2. [Folder Structure & What Each Part Does](#2-folder-structure--what-each-part-does)
3. [Step-by-Step: What Calls What](#3-step-by-step-what-calls-what)
4. [TypeScript Concepts Used in This Project](#4-typescript-concepts-used-in-this-project)
5. [Default vs Named Exports – When to Use Which](#5-default-vs-named-exports--when-to-use-which)
6. [Quick Reference: Imports in This Project](#6-quick-reference-imports-in-this-project)

---

## 1. How a Request Flows Through the Project

When someone sends a request (e.g. “Register a new user”), it moves in one direction and the response comes back in the opposite direction.

```
CLIENT (Postman / Browser / App)
    |
    |  HTTP Request: POST /api/v1/users/register  { name, email, password }
    v
┌─────────────────────────────────────────────────────────────────────────┐
│  index.ts (Entry point)                                                 │
│  - Creates Express app                                                  │
│  - Mounts routes at /api                                                │
│  - Starts server                                                        │
└─────────────────────────────────────────────────────────────────────────┘
    |
    |  app.use("/api", apiRoutes)
    v
┌─────────────────────────────────────────────────────────────────────────┐
│  routes/index.ts                                                        │
│  - All /api/* goes here                                                 │
│  - Mounts v1 routes at /v1                                              │
└─────────────────────────────────────────────────────────────────────────┘
    |
    |  router.use("/v1", v1Routes)
    v
┌─────────────────────────────────────────────────────────────────────────┐
│  routes/v1/index.ts                                                     │
│  - /api/v1/* is here                                                     │
│  - /info  → InfoRoutes   |  /users  → UserRoutes                         │
└─────────────────────────────────────────────────────────────────────────┘
    |
    |  router.use("/users", UserRoutes)   →  POST /users/register
    v
┌─────────────────────────────────────────────────────────────────────────┐
│  routes/v1/user-routes.ts                                               │
│  - POST /register  →  UserController.registerUser                       │
└─────────────────────────────────────────────────────────────────────────┘
    |
    |  UserController.registerUser(req, res)
    v
┌─────────────────────────────────────────────────────────────────────────┐
│  controllers/user-controller.ts                                         │
│  - Wrapped in tryCatch (catches errors, sends error response)           │
│  - Reads req.body (name, email, password)                                │
│  - Calls UserService.createUser(...)                                     │
└─────────────────────────────────────────────────────────────────────────┘
    |
    |  UserService.createUser({ name, email, password })
    v
┌─────────────────────────────────────────────────────────────────────────┐
│  services/user-service.ts                                               │
│  - Business logic: check if user exists, hash password, create user,    │
│    create JWT token                                                     │
│  - Uses UserRepository for database                                      │
│  - Throws AppError if something is wrong (e.g. "User already exists")    │
└─────────────────────────────────────────────────────────────────────────┘
    |
    |  userRepository.getByEmail()  /  userRepository.create()
    v
┌─────────────────────────────────────────────────────────────────────────┐
│  repositories/user-repository.ts                                         │
│  - Extends CrudRepository (get, create, update, destroy, getAll)         │
│  - Adds getByEmail() for User                                            │
│  - Talks to MongoDB via Mongoose (User model)                            │
└─────────────────────────────────────────────────────────────────────────┘
    |
    |  this.model.findOne()  /  this.model.create()
    v
┌─────────────────────────────────────────────────────────────────────────┐
│  models/user.ts                                                         │
│  - Defines User schema (name, email, password, role, playlist)           │
│  - Mongoose turns this into MongoDB collection                           │
└─────────────────────────────────────────────────────────────────────────┘
    |
    v
  MONGODB (database)
```

**Response path (going back):**

- **Success:** Controller gets the result from the service → sets `SuccessResponse.data` → sends `res.status(201).json(SuccessResponse)`.
- **Error:** If the service (or repository) throws `AppError`, the controller’s `tryCatch` catches it → sets `ErrorResponse` → sends `res.status(statusCode).json(ErrorResponse)`.

So: **Route → Controller → Service → Repository → Model → DB**, and the response goes back the same chain (with `tryCatch` handling errors in the controller).

---

## 2. Folder Structure & What Each Part Does

| Folder / File     | Purpose                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| **src/index.ts**  | Entry point. Creates Express app, loads config, mounts `/api` routes, connects to DB, starts server. |
| **config/**       | Server config (PORT), logger (winston). No business logic.                                           |
| **controllers/**  | Handle HTTP: read `req`, call services, send `res` (success or error via tryCatch).                  |
| **services/**     | Business logic. Call repositories, throw `AppError` on validation/business errors.                   |
| **repositories/** | Database access. `CrudRepository` = base; `UserRepository` extends it and uses `User` model.         |
| **models/**       | Mongoose schemas (e.g. User). Define shape of data in MongoDB.                                       |
| **routes/**       | Map URL paths to controllers (e.g. POST `/users/register` → `UserController.registerUser`).          |
| **middlewares/**  | Placeholder for future middleware (auth, etc.).                                                      |
| **utils/**        | Shared helpers: tryCatch, AppError, SuccessResponse, ErrorResponse, enums.                           |

**Rule of thumb:**

- **Routes** = “which URL calls which controller”
- **Controllers** = “what to do with this request and how to respond”
- **Services** = “business rules and workflows”
- **Repositories** = “how to read/write the database”
- **Models** = “what the data looks like in the database”

---

## 3. Step-by-Step: What Calls What

### 3.1 Startup (when you run `npm run dev`)

1. **index.ts** runs.
2. Loads **config** (`ServerConfig`, `Logger`).
3. Creates Express app, mounts **routes** at `/api`.
4. Calls `app.listen(PORT, ...)`.
5. In the callback, calls `connectDB()` (e.g. from db-config) to connect to MongoDB.

So at startup: **index.ts** uses **config** and **routes**; **routes** are built from **routes/index.ts** and **routes/v1/\*.ts**, which import **controllers**.

### 3.2 When a request hits the server

Example: **POST /api/v1/users/register** with body `{ name, email, password }`.

1. **index.ts** has `app.use("/api", apiRoutes)` → request goes to **routes/index.ts**.
2. **routes/index.ts** has `router.use("/v1", v1Routes)` → goes to **routes/v1/index.ts**.
3. **routes/v1/index.ts** has `router.use("/users", UserRoutes)` → goes to **routes/v1/user-routes.ts**.
4. **user-routes.ts** has `router.post("/register", UserController.registerUser)` → calls **controllers/user-controller.ts** `registerUser`.
5. **user-controller.ts**
   - Inside tryCatch: reads `req.body`, calls `UserService.createUser(...)`.
   - If that throws (e.g. AppError), tryCatch catches it and sends ErrorResponse.
6. **user-service.ts** `createUser`
   - Uses **UserRepository** (getByEmail, create).
   - Throws **AppError** if user already exists.
   - Returns `{ user, token }`.
7. **user-repository.ts**
   - Extends **CrudRepository**; uses **User** model from **models/user.ts** to talk to MongoDB.

So the **call chain** for this request is:

- **index** → **routes** → **v1 routes** → **user-routes** → **user-controller** → **user-service** → **user-repository** → **User model** → **MongoDB**.

Errors thrown in service or repository are caught by **tryCatch** in the controller, which uses **ErrorResponse** and **AppError** to send the right status and body.

---

## 4. TypeScript Concepts Used in This Project

You don’t need to know everything about TypeScript to read this project. Here are the bits we actually use.

### 4.1 Types and type annotations

TypeScript adds **types** (e.g. “this is a string”, “this is a number”) so the editor and compiler can catch mistakes.

**Syntax: `variableName: Type`**

```ts
const name: string = "Alice";
const age: number = 25;
const isActive: boolean = true;
```

**In function parameters and return:**

```ts
function greet(name: string): string {
  return "Hello, " + name;
}
```

- `name: string` = “name must be a string”.
- `: string` after `)` = “this function returns a string”.

So when you see something like:

```ts
async getByEmail(email: string) { ... }
```

it means: “`getByEmail` is a function that takes one argument, and that argument must be a string”.

### 4.2 `interface` – describing object shapes

An **interface** is a way to describe the “shape” of an object: what keys it has and what type each key is.

**Example from the project (models/user.ts):**

```ts
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  playlist: string[];
}
```

- `interface IUser` = “there is a type named IUser”.
- `extends Document` = “IUser has everything Mongoose’s Document has (like \_id), plus the fields below”.
- The rest = “every IUser has name (string), email (string), etc.”.

So whenever we say “this variable is an IUser”, TypeScript knows it has `name`, `email`, `password`, `role`, `playlist`. We use this for the User model and for typing repositories.

### 4.3 `Record<string, unknown>` – “object with string keys”

You’ll see this in CrudRepository and response objects:

```ts
async create(data: Record<string, unknown>) { ... }
```

- `Record<K, V>` = “object whose keys are type K and values are type V”.
- `Record<string, unknown>` = “object with string keys and values we don’t care to type precisely (unknown)”.

So “data is an object with string keys” – flexible for create/update payloads.

### 4.4 Generics – `<T>` “type parameter”

Generics let one piece of code work with “some type T” without hard-coding which type.

**From crud-repository.ts:**

```ts
class CrudRepository<T> {
  constructor(protected model: Model<T>) {}
  // ...
}
```

- `CrudRepository<T>` = “CrudRepository is generic; T is a type we’ll choose when we use it”.
- `Model<T>` = “Mongoose model for documents of type T”.

**In user-repository.ts:**

```ts
class UserRepository extends CrudRepository<IUser> {
  constructor() {
    super(User as Model<IUser>);
  }
}
```

- `CrudRepository<IUser>` = “this CrudRepository works with IUser documents”.
- So inside the base class, `this.model` is understood to work with IUser (find, create, etc.).

You don’t have to memorize the syntax; just read “CrudRepository of IUser” = “repository for User documents”.

### 4.5 `as` – type assertion (“trust me, treat this as that type”)

Sometimes TypeScript can’t infer the exact type we want. We tell it: “treat this value as this type”.

**Example:**

```ts
process.env.MONGO_URI as string;
```

- `process.env.MONGO_URI` is typed as `string | undefined`.
- We say “use it as string” because we know we set it in .env.

**Another example:**

```ts
super(User as Model<IUser>);
```

- We’re telling TypeScript: “treat User (the Mongoose model) as Model<IUser>” so it matches the base class.

Use `as` only when you’re sure the value really is that type (e.g. env vars you control).

### 4.6 `type` in imports – “only use this for types”

```ts
import type { Model } from "mongoose";
import type { IUser } from "../models/user.js";
```

- `import type` = “I only need this for TypeScript types; don’t include it in the compiled JavaScript”.
- So we use it for interfaces and types that disappear at runtime (Model, IUser).

### 4.7 Optional chaining and nullish coalescing

- **Optional chaining:** `obj?.property` – if `obj` is null/undefined, the whole expression is undefined instead of throwing.
- **Nullish coalescing:** `a ?? b` – “use a if it’s not null/undefined, else use b”.

**From index.ts:**

```ts
const PORT = ServerConfig.PORT ?? 3001;
```

So: “use ServerConfig.PORT if it exists, otherwise use 3001”.

### 4.8 `export default` vs `export { X }`

We’ll cover this in detail in the next section; the important idea is:

- **Default export:** one main thing per file; you import it with any name: `import X from "./file.js"`.
- **Named export:** you export by name; you import with the same name: `import { X } from "./file.js"`.

---

## 5. Default vs Named Exports – When to Use Which

### 5.1 Default export

**Definition:** The file exports **one main thing**. That thing doesn’t have a fixed name at import time.

**How to export:**

```ts
// user-repository.ts
class UserRepository extends CrudRepository<IUser> { ... }
export default UserRepository;
```

**How to import:**

```ts
import UserRepository from "./user-repository.js";
// You could also write:  import AnyName from "./user-repository.js";
```

- The **name you use** (e.g. `UserRepository`) is chosen by the **importer**, not by the file.
- One default per file.

**When to use default export:**

- A single main “thing” per file: one class, one function, or one object.
- Examples in this project: `UserRepository`, `CrudRepository`, `UserService`, `tryCatch`, `AppError`, `Logger`, `ServerConfig`, route routers (e.g. `router` in route files), controllers (e.g. `{ registerUser }`), services (e.g. `{ createUser }`).

### 5.2 Named export

**Definition:** The file exports **one or more things by name**. The importer must use those names (or rename explicitly).

**How to export:**

```ts
// models/index.ts
import { User } from "./user.js";
export { User };
```

Or directly in the same file:

```ts
// models/user.ts
export const User = mongoose.model<IUser>("User", schema);
export interface IUser { ... }
```

**How to import:**

```ts
import { User } from "./models/index.js";
import { User, IUser } from "./models/user.js";
```

- You must use the **exact name** (or use `as` to rename): `import { User as UserModel } from "./models/index.js"`.
- You can import several at once: `import { ServerConfig, Logger } from "./config/index.js"`.

**When to use named export:**

- When a file has **multiple** things to export (e.g. config: both ServerConfig and Logger).
- When the **name is important** and should be the same everywhere (e.g. `User`, `IUser`, `StatusCodes`).
- Barrel files (index.ts) that re-export several things: `export { InfoController, UserController }`.

### 5.3 Mixing default and named in one file

You can have both in the same file:

```ts
export default class UserRepository { ... }
export const SOME_CONSTANT = 42;
```

Import:

```ts
import UserRepository, { SOME_CONSTANT } from "./user-repository.js";
```

(Default first, then named in `{ }`.)

### 5.4 Re-exporting (barrel files)

**config/index.ts:**

```ts
import ServerConfig from "./server-config.js"; // default from server-config
import Logger from "./logger-config.js"; // default from logger-config

export { ServerConfig, Logger }; // named re-export
```

- We **import** the defaults with our chosen names.
- We **re-export** them as **named** so others can do: `import { ServerConfig, Logger } from "./config/index.js"`.

So: “this folder’s main exports are ServerConfig and Logger; you get them as named exports from the barrel”.

**controllers/index.ts:**

```ts
import InfoController from "./info-controller.js";
import UserController from "./user-controller.js";

export { InfoController, UserController };
```

- Each controller file exports **one default** (an object with methods).
- The barrel imports them and re-exports as **named** so routes can do: `import { UserController } from "../../controllers/index.js"` and then use `UserController.registerUser`.

### 5.5 Why we use `.js` in imports

We write TypeScript (`.ts`), but Node runs compiled JavaScript (`.js`). So we import the **output** path:

```ts
import UserRepository from "./user-repository.js";
```

So the rule: in imports, use the path that will exist at **runtime** (`.js`), not the source (`.ts`).

### 5.6 Summary table

| Situation                       | Prefer           | Example                                     |
| ------------------------------- | ---------------- | ------------------------------------------- |
| One main thing per file         | Default export   | `export default UserRepository`             |
| Multiple things from one file   | Named exports    | `export { ServerConfig, Logger }`           |
| Barrel re-exporting many things | Named re-exports | `export { InfoController, UserController }` |
| Third-party library             | Depends on lib   | `import express from "express"` (default)   |
| Need same name everywhere       | Named            | `export { User }`, `import { User }`        |

---

## 6. Quick Reference: Imports in This Project

| File / layer                         | Imports from                                                           | Exports                                  |
| ------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------- |
| **index.ts**                         | routes, config (ServerConfig, Logger)                                  | (entry, no export)                       |
| **routes/index.ts**                  | express, v1 routes (default)                                           | default router                           |
| **routes/v1/index.ts**               | express, info-routes (default), user-routes (default)                  | default router                           |
| **routes/v1/user-routes.ts**         | express, controllers (UserController)                                  | default router                           |
| **controllers/user-controller.ts**   | StatusCodes, services (UserService), utils (SuccessResponse, tryCatch) | default { registerUser }                 |
| **controllers/index.ts**             | info-controller (default), user-controller (default)                   | named { InfoController, UserController } |
| **services/user-service.ts**         | repositories (UserRepository), AppError, StatusCodes                   | default { createUser }                   |
| **services/index.ts**                | user-service (default)                                                 | named { UserService }                    |
| **repositories/user-repository.ts**  | Model (type), IUser (type), User (model), CrudRepository (default)     | default UserRepository                   |
| **repositories/crud-repository.ts**  | Model (type), AppError, StatusCodes                                    | default CrudRepository                   |
| **repositories/index.ts**            | crud-repository (default), user-repository (default)                   | named { CrudRepository, UserRepository } |
| **models/user.ts**                   | mongoose                                                               | named User, IUser                        |
| **models/index.ts**                  | user (User)                                                            | named { User }                           |
| **config/index.ts**                  | server-config (default), logger-config (default)                       | named { ServerConfig, Logger }           |
| **utils/TryCatch.ts**                | express types, ErrorResponse (default), AppError (default)             | default tryCatch                         |
| **utils/common/error-response.ts**   | —                                                                      | default error object                     |
| **utils/common/success-response.ts** | —                                                                      | default success object                   |
| **utils/errors/app-error.ts**        | —                                                                      | default AppError class                   |

---

## Summary

- **Flow:** Request → index → routes → v1 routes → specific route file → controller (with tryCatch) → service → repository → model → MongoDB. Response (or error) goes back the same way; tryCatch in the controller sends ErrorResponse on errors.
- **Layers:** Routes map URLs to controllers; controllers call services and send HTTP responses; services contain business logic and use repositories; repositories use models to talk to the DB.
- **TypeScript here:** types and interfaces describe shapes; generics (`CrudRepository<T>`) let one class work for different models; `as` and `import type` are used where needed.
- **Exports:** Use **default** for the one main export of a file (classes, routers, controller/service objects). Use **named** for multiple exports and when the name should be fixed (e.g. barrel files, config, models). Imports use `.js` because that’s what runs at runtime.

If you follow one request (e.g. POST /api/v1/users/register) through the list in Section 3 and look at the corresponding files, you’ll see exactly how the flow and imports/exports work in practice.
