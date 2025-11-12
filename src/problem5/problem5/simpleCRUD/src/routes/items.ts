import { Router, Request, Response } from "express";
import { db } from "../db";
import { createItemSchema, updateItemSchema, listQuerySchema } from "../schemas/itemSchemas";

const router = Router();

/** Create */
router.post("/", (req: Request, res: Response) => {
  const parsed = createItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const now = new Date().toISOString();
  const stmt = db.prepare(
    "INSERT INTO items (name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?)"
  );
  const info = stmt.run(parsed.data.name, parsed.data.description ?? "", now, now);
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(info.lastInsertRowid as number);
  return res.status(201).json(item);
});

/** List with filters */
router.get("/", (req: Request, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { search, sort, order, limit, offset } = parsed.data;
  const where: string[] = [];
  const params: unknown[] = [];

  if (search && search.trim()) {
    where.push("(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)");
    const token = `%${search.toLowerCase()}%`;
    params.push(token, token);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM items ${whereSql}`)
    .get(...params) as { count: number };

  const items = db
    .prepare(
      `SELECT * FROM items ${whereSql} ORDER BY ${sort} ${order.toUpperCase()} LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  return res.json({ total: totalRow.count, items });
});

/** Get by id */
router.get("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid id" });
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
  if (!item) return res.status(404).json({ error: "Not found" });
  return res.json(item);
});

/** Patch update */
router.patch("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid id" });

  const parsed = updateItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Not found" });

  const now = new Date().toISOString();
  const name = parsed.data.name ?? (existing as any).name;
  const description = parsed.data.description ?? (existing as any).description;

  db.prepare("UPDATE items SET name = ?, description = ?, updatedAt = ? WHERE id = ?").run(
    name,
    description,
    now,
    id
  );

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
  return res.json(item);
});

/** Delete */
router.delete("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid id" });
  const info = db.prepare("DELETE FROM items WHERE id = ?").run(id);
  if (info.changes === 0) return res.status(404).json({ error: "Not found" });
  return res.status(204).send();
});

export default router;
