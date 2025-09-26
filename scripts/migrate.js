// Importar usando ES modules y compilar TypeScript on-the-fly
const { execSync } = require('child_process');
const path = require('path');

async function runMigration() {
  const command = process.argv[2];

  switch (command) {
    case 'seed':
      console.log(' Ejecutando migración de datos...');
      const seedResult = await seedDatabase();
      if (seedResult.success) {
        console.log(' Migración completada exitosamente');
      } else {
        console.error(' Error en la migración:', seedResult.error);
        process.exit(1);
      }
      break;

    case 'clear':
      console.log('🧹 Limpiando base de datos...');
      const clearResult = await clearDatabase();
      if (clearResult.success) {
        console.log(' Base de datos limpiada exitosamente');
      } else {
        console.error(' Error limpiando la base de datos:', clearResult.error);
        process.exit(1);
      }
      break;

    case 'reset':
      console.log(' Reiniciando base de datos...');
      const clearResetResult = await clearDatabase();
      if (clearResetResult.success) {
        const seedResetResult = await seedDatabase();
        if (seedResetResult.success) {
          console.log(' Base de datos reiniciada exitosamente');
        } else {
          console.error(' Error en la migración:', seedResetResult.error);
          process.exit(1);
        }
      } else {
        console.error(' Error limpiando la base de datos:', clearResetResult.error);
        process.exit(1);
      }
      break;

    default:
      console.log(`
Uso: node scripts/migrate.js [comando]

Comandos disponibles:
  seed    - Poblar la base de datos con datos de demostración
  clear   - Limpiar todos los datos de la base de datos
  reset   - Limpiar y volver a poblar la base de datos

Ejemplos:
  node scripts/migrate.js seed
  node scripts/migrate.js clear
  node scripts/migrate.js reset
      `);
      break;
  }
}

runMigration().catch(console.error);
