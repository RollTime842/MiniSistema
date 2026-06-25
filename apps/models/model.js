import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Model {
  table = "";

  getTable() {
    return this.table;
  }

  async load() {
    const filePath = path.join(__dirname, "..", "..", "data", `${this.table}.json`);
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async save(data) {
    const list = await this.load();
    list.push(data);
    const dir = path.join(__dirname, "..", "..", "data");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, `${this.table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
  }
}
