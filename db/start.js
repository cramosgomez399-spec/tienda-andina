// PostgreSQL local sin instalar nada en Windows: los binarios vienen en node_modules
// y los datos quedan en ./data. Ctrl+C lo detiene limpiamente.
import { existsSync } from 'node:fs';
import EmbeddedPostgres from 'embedded-postgres';

const PUERTO = 5433;
const pg = new EmbeddedPostgres({
  databaseDir: './data',
  user: 'postgres',
  password: 'postgres',
  port: PUERTO,
  persistent: true,
  // UTF-8 explícito: en Windows initdb usaría WIN1252 y fallarían caracteres especiales.
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
});

if (!existsSync('./data/PG_VERSION')) await pg.initialise();
await pg.start();
try {
  await pg.createDatabase('medusa');
} catch {
  // ya existe
}
console.log(`PostgreSQL listo: postgres://postgres:postgres@localhost:${PUERTO}/medusa`);

const detener = async () => {
  await pg.stop();
  process.exit(0);
};
process.on('SIGINT', detener);
process.on('SIGTERM', detener);
setInterval(() => {}, 1 << 30);
