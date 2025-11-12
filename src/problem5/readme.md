# Express + TypeScript + SQLite CRUD Server

This is a simple backend service built with **Express.js** and **TypeScript**, providing a basic **CRUD API** backed by **SQLite** for persistent storage.  
It also includes a lightweight HTML front-end for interacting with the database directly from the browser.

---

## Features

- TypeScript + Express.js backend  
- SQLite for persistence (using `better-sqlite3`)  
- RESTful API routes under `/api/items`  
- Frontend interface for adding, editing, deleting, and viewing items  
- Hot reload in development with `ts-node` and `nodemon`

---

## Project Structure

```
simpleCRUD/
├── src/
│   ├── common/              # constants and helpers
│   ├── routes/
│   │   ├── index.ts         # base routes
│   │   └── items.ts         # CRUD API routes for items
│   ├── public/
│   │   ├── scripts/
│   │   │   └── items.js     # frontend logic for browser UI
│   │   └── stylesheets/
│   │       └── users.css    # simple CSS reused from template
│   ├── views/
│   │   └── items.html       # web interface for CRUD operations
│   ├── db.ts                # SQLite connection and setup
│   ├── server.ts            # Express server configuration
│   └── index.ts             # entrypoint for server startup
├── package.json
├── tsconfig.json
└── README.md
```

---

## Configuration

Default configuration values are loaded from `/src/common/constants/ENV.ts`.

|  Variable |    Default   |               Description             |
|-----------|--------------|---------------------------------------|
| `PORT`    | `3000`       | Port the Express server listens on    |
| `NODE_ENV`| `development`| Environment mode                      |
| `DB_PATH` | `data.sqlite`| SQLite file for storage               |

To override, create `.env.development`:

```env
PORT=3000
DB_PATH=./data.sqlite
```

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/eugeneChuBNE/code-challenge
cd simpleCRUD
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build and run

**Development (hot reload)**
```bash
npm run dev
```

**Production (compiled JS)**
```bash
npm run build
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

---

## Testing the API

Use the included PowerShell script `demo.ps1` to test all CRUD operations:

```powershell
./demo.ps1
```

This script performs:
1. Create an item  
2. List items  
3. Get item by ID  
4. Update an item  
5. Delete the item  

A screenshot of this script's run is attached under ./screenshots/demo_ps1.PNG

---

## Web Interface

Open [http://localhost:3000](http://localhost:3000) in your browser.  
You will see a simple interface that allows you to:

- Add new items (name + description)
- Edit existing items
- Delete items
- View items stored in the SQLite database

Otherwise, there are some screenshots attached under ./screenshots/

### Example API
```
Example API Response (GET /api/items)
{
  "total": 2,
  "items": [
    {
      "id": 1,
      "name": "Sample Item",
      "description": "Hello world",
      "createdAt": "2025-11-12T09:45:00.000Z",
      "updatedAt": "2025-11-12T09:46:00.000Z"
    }
  ]
}
```
---

## API Endpoints

| Method  |      Endpoint    |                                       Description                                 |
|---------|------------------|-----------------------------------------------------------------------------------|
| `POST`  | `/api/items`     | Create a new item                                                                 |
| `GET`   | `/api/items`     | List items (with optional filters: `search`, `limit`, `offset`, `sort`, `order`)  | -------> not done with the filter yet...
| `GET`   | `/api/items/:id` | Retrieve one item by ID                                                           |
| `PATCH` | `/api/items/:id` | Update item name or description                                                   |
| `DELETE`| `/api/items/:id` | Delete an item                                                                    |

**Example payloads:**

```json
// POST /api/items
{
  "name": "Example Item",
  "description": "This is a test item"
}

// PATCH /api/items/1
{
  "description": "Updated description"
}
```

---

## System Flow Diagram

Below is a simplified diagram of how data flows through the application.

```
+-------------------+         +----------------------+         +------------------+
|   Web Browser     |         |    Express Server    |         |     SQLite DB    |
|-------------------|         |----------------------|         |------------------|
| HTML (items.html) | <-----> | Routes (/api/items)  | <-----> | items table      |
| JS (items.js)     |         | Controllers & Models |         | (id, name, desc) |
+-------------------+         +----------------------+         +------------------+

1. The user interacts with items.html via forms and buttons.
2. items.js sends AJAX requests (GET, POST, PATCH, DELETE) to /api/items.
3. The Express server routes requests to the appropriate handler in itemsRouter.
4. SQLite stores or retrieves data from the `items` table.
5. Results are sent back to the browser and rendered dynamically via Handlebars templates.
```

---

## Technologies Used

- Node.js (v18+)
- Express.js (v5)
- TypeScript
- SQLite3 (via better-sqlite3)
- Handlebars.js (frontend rendering)
- Bootstrap 5 (styling)

---

## Development Commands

|         Command      |                    Description          |
|----------------------|-----------------------------------------|
| `npm run dev`        | Run with hot reload (ts-node + nodemon) |
| `npm run build`      | Compile TypeScript to JavaScript        |
| `npm start`          | Run compiled app (production)           |
| `npm run lint`       | Lint source files                       |
| `npm run type-check` | TypeScript validation only              |

---

## Notes

- The SQLite database file (`data.sqlite`) will be created automatically on first run.
- All items persist between runs unless the file is deleted.
- To reset the database, simply rm `data.sqlite`.

## (Still) notes (but for myself) - Eugeneeee, u forgot to add filters!!!

This document will be updated along with the development of this prod :D