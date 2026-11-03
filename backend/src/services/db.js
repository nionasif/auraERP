import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getInitialSeedData } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../data/database.json');

class CorporateDatabase {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.resetToSeed();
      }
    } catch (err) {
      console.error('[DB] Error loading database.json, initializing from seedData:', err);
      this.resetToSeed();
    }
  }

  resetToSeed() {
    this.data = getInitialSeedData();
    this.save();
    console.log('[DB] Corporate database initialized with enterprise seed data.');
  }

  save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Failed to persist database.json:', err);
    }
  }

  setCollection(collection, items) {
    this.data[collection] = items;
    this.save();
  }

  get(collection) {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch {}
    return (this.data && this.data[collection]) || [];
  }

  findById(collection, id) {
    const list = this.get(collection);
    return list.find(item => item.id === id);
  }

  find(collection, predicate) {
    const list = this.get(collection);
    return list.filter(predicate);
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(item);
    this.save();
    return item;
  }

  update(collection, id, updates) {
    const list = this.get(collection);
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return list[index];
  }

  delete(collection, id) {
    const list = this.get(collection);
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return false;

    list.splice(index, 1);
    this.save();
    return true;
  }
}

export const db = new CorporateDatabase();
export default db;
