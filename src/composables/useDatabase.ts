
import { ref } from "vue";
import initSqlJs from "sql.js";

const SQL = await initSqlJs({
  locateFile: file => `https://sql.js.org/dist/${file}`
});

const db = ref(null);
const pages = ref([]);
const titles = ref({});
const ready = ref(false);

export function useDatabase() {
  const loadDatabase = async () => {
    if (ready.value) return;

    try {
      const response = await fetch("/database.sqlite");
      const buffer = await response.arrayBuffer();
      const database = new SQL.Database(new Uint8Array(buffer));
      db.value = database;

      const pagesResult = db.value.exec("SELECT * FROM pages");
      if (pagesResult.length) {
        pages.value = pagesResult[0].values.map(row => ({
          name: row[0],
          link: row[1],
          title: row[2],
          body: row[3].split('\\n'),
          hidden: !!row[4]
        }));
      }

      const titlesResult = db.value.exec("SELECT * FROM titles");
      if (titlesResult.length) {
        const [title, subtitle] = titlesResult[0].values[0];
        titles.value = { title, subtitle };
      }

      ready.value = true;
    } catch (error) {
      console.error("Failed to load database:", error);
    }
  };

  return {
    db,
    pages,
    titles,
    ready,
    loadDatabase
  };
}
