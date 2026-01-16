/**
 * Script di verifica database
 * Controlla tabelle, dati e schema
 */

const db = require('./services/database');

async function verifyDatabase() {
  console.log('\n🔍 VERIFICA DATABASE VICANTO\n');
  console.log('='.repeat(60));

  try {
    // 1. Verifica connessione
    console.log('\n1️⃣  Verifica connessione database...');
    await db.raw('SELECT 1');
    console.log('   ✅ Connessione OK');

    // 2. Lista tabelle
    console.log('\n2️⃣  Tabelle presenti:');
    const tables = await db.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    tables.rows.forEach(row => {
      console.log(`   📋 ${row.table_name}`);
    });

    // 3. Verifica tavoli
    console.log('\n3️⃣  Tavoli (tables):');
    const tablesData = await db('tables').select('*').orderBy('number', 'asc');
    console.log(`   Totale: ${tablesData.length} tavoli`);
    console.log(`   Primi 5 tavoli:`);
    tablesData.slice(0, 5).forEach(t => {
      console.log(`   - Tavolo ${t.number}: ${t.status} (coperti: ${t.covers}, totale: €${t.total})`);
    });

    // 4. Verifica utenti
    console.log('\n4️⃣  Utenti (users):');
    const users = await db('users').select('id', 'username', 'role', 'is_active');
    console.log(`   Totale: ${users.length} utenti`);
    users.forEach(u => {
      console.log(`   - ${u.username} (${u.role}) - ${u.is_active ? 'Attivo' : 'Inattivo'}`);
    });

    // 5. Verifica categorie menu
    console.log('\n5️⃣  Categorie Menu (menu_categories):');
    const categories = await db('menu_categories')
      .select('*')
      .orderBy('display_order', 'asc');
    console.log(`   Totale: ${categories.length} categorie`);
    categories.forEach(c => {
      console.log(`   ${c.icon} ${c.name} (${c.code}) - €${c.base_price}`);
    });

    // 6. Verifica gusti
    console.log('\n6️⃣  Gusti (flavors):');
    const flavors = await db('flavors')
      .select('category_code')
      .count('* as count')
      .groupBy('category_code')
      .orderBy('category_code');
    console.log(`   Gusti per categoria:`);
    flavors.forEach(f => {
      console.log(`   - ${f.category_code}: ${f.count} gusti`);
    });

    // Mostra alcuni esempi
    console.log('\n   Esempi gusti Coppetta:');
    const coppettaFlavors = await db('flavors')
      .where('category_code', 'coppetta')
      .orderBy('display_order', 'asc')
      .limit(5);
    coppettaFlavors.forEach(f => {
      console.log(`   - ${f.name}`);
    });

    // 7. Verifica ordini (dovrebbero essere vuoti)
    console.log('\n7️⃣  Ordini (orders):');
    const orders = await db('orders').count('* as count').first();
    console.log(`   Totale: ${orders.count} ordini`);

    // 8. Verifica print_queue (dovrebbe essere vuota)
    console.log('\n8️⃣  Coda stampa (print_queue):');
    const printQueue = await db('print_queue').count('* as count').first();
    console.log(`   Totale: ${printQueue.count} job`);

    // 9. Schema tabella orders (importante)
    console.log('\n9️⃣  Schema tabella orders:');
    const orderColumns = await db.raw(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `);
    orderColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });

    // 10. Schema tabella order_items (importante)
    console.log('\n🔟  Schema tabella order_items:');
    const itemColumns = await db.raw(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'order_items'
      ORDER BY ordinal_position
    `);
    itemColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICA COMPLETATA CON SUCCESSO!\n');

  } catch (error) {
    console.error('\n❌ ERRORE DURANTE LA VERIFICA:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

verifyDatabase();
