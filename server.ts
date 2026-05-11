import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';

const dbPath = path.join(process.cwd(), 'database.json');

// Get entire database
async function getDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return default state with admin user
    return {
      'studio_employees': [{
        id: "1",
        name: "Admin",
        role: "admin",
        permissions: [],
        phone: "",
        salary: "",
        password: "pass",
        joiningDate: new Date().toISOString(),
        status: "Active"
      }]
    };
  }
}

async function saveDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

async function startServer() {
  // Ensure DB exists on startup
  const db = await getDb();
  await saveDb(db);
  
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb', strict: false }));

  // Dump all data for frontend boot
  app.get("/api/sync", async (req, res) => {
    try {
      const data = await getDb();
      res.json(data);
    } catch (err: any) {
      console.error('Error in /api/sync', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Universal GET
  app.get("/api/store/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const data = await getDb();
      res.json(data[key] || null);
    } catch (err: any) {
      console.error('Error fetching ' + req.params.key, err);
      res.status(500).json({ error: err.message });
    }
  });

  // Universal SET
  app.post("/api/store/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const body = req.body;
      
      const data = await getDb();
      data[key] = body;
      await saveDb(data);
      
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error saving ' + req.params.key, err);
      res.status(500).json({ error: err.message });
    }
  });

  // Universal DELETE single item
  app.delete("/api/store/:key", async (req, res) => {
    try {
      const key = req.params.key;
      const data = await getDb();
      delete data[key];
      await saveDb(data);
      
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting ' + req.params.key, err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
    console.error("Failed to start server:", err);
});
