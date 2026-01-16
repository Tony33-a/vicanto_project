/**
 * Script di gestione Menu
 * Gestisci categorie e gusti in modo interattivo
 */

const MenuCategory = require('./models/MenuCategory');
const Flavor = require('./models/Flavor');
const db = require('./services/database');

async function showMenu() {
  console.log('\n📋 GESTIONE MENU VICANTO\n');
  console.log('1. Mostra tutte le categorie');
  console.log('2. Mostra gusti per categoria');
  console.log('3. Aggiungi nuova categoria');
  console.log('4. Aggiungi nuovo gusto');
  console.log('5. Cambia prezzo categoria');
  console.log('6. Disabilita gusto');
  console.log('0. Esci\n');
}

async function listCategories() {
  console.log('\n📦 CATEGORIE MENU:\n');
  const categories = await MenuCategory.findAll();
  categories.forEach(c => {
    console.log(`${c.icon} ${c.name} (${c.code})`);
    console.log(`   Prezzo: €${c.base_price} | Ordine: ${c.display_order} | Attiva: ${c.is_active ? 'Sì' : 'No'}`);
    console.log('');
  });
}

async function listFlavors(categoryCode) {
  console.log(`\n🍦 GUSTI PER ${categoryCode.toUpperCase()}:\n`);
  const flavors = await Flavor.findByCategory(categoryCode);
  flavors.forEach((f, i) => {
    console.log(`${i+1}. ${f.name} (ID: ${f.id}) - ${f.is_available ? '✅ Disponibile' : '❌ Non disponibile'}`);
  });
  console.log('');
}

async function addCategory() {
  console.log('\n➕ AGGIUNGI CATEGORIA\n');
  console.log('Esempio:');
  console.log('  Code: bibite');
  console.log('  Name: Bibite');
  console.log('  Icon: 🥤');
  console.log('  Price: 2.50');
  console.log('  Display Order: 5\n');

  // In un ambiente reale useresti readline o inquirer per input
  // Per ora mostro solo l'esempio di codice da usare:

  console.log('📝 Copia e modifica questo codice:\n');
  console.log(`const newCategory = await MenuCategory.create({
  code: 'bibite',           // Nome tecnico (lowercase, no spazi)
  name: 'Bibite',           // Nome visualizzato
  icon: '🥤',               // Emoji
  base_price: 2.50,         // Prezzo base
  is_active: true,
  display_order: 5          // Ordine visualizzazione
});
console.log('✅ Categoria creata:', newCategory);`);
}

async function addFlavor() {
  console.log('\n➕ AGGIUNGI GUSTO\n');
  console.log('📝 Copia e modifica questo codice:\n');
  console.log(`const newFlavor = await Flavor.create({
  name: 'Tiramisu',              // Nome gusto
  category_code: 'coppetta',     // Categoria (coppetta, cono, crepes, frappe)
  is_available: true,
  display_order: 13              // Ordine visualizzazione
});
console.log('✅ Gusto aggiunto:', newFlavor);`);
}

async function changePrice() {
  console.log('\n💰 CAMBIA PREZZO\n');
  console.log('📝 Copia e modifica questo codice:\n');
  console.log(`const category = await MenuCategory.findByCode('coppetta');
const updated = await MenuCategory.update(category.id, {
  base_price: 5.00  // Nuovo prezzo
});
console.log('✅ Prezzo aggiornato:', updated.name, '€' + updated.base_price);`);
}

async function disableFlavor() {
  console.log('\n❌ DISABILITA GUSTO\n');
  console.log('📝 Copia e modifica questo codice:\n');
  console.log(`const disabled = await Flavor.setUnavailable(23);  // ID del gusto
console.log('✅ Gusto disabilitato');`);
}

async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    await showMenu();

    console.log('💡 GUIDA RAPIDA:\n');
    console.log('Questo script ti mostra esempi di codice da usare.');
    console.log('Puoi creare script personalizzati in backend/scripts/\n');

    console.log('📚 ESEMPI PRATICI:\n');

    // Mostra categorie esistenti
    await listCategories();

    // Mostra gusti coppetta
    await listFlavors('coppetta');

    console.log('\n📝 OPERAZIONI COMUNI:\n');
    console.log('--- AGGIUNGI CATEGORIA ---');
    await addCategory();

    console.log('\n--- AGGIUNGI GUSTO ---');
    await addFlavor();

    console.log('\n--- CAMBIA PREZZO ---');
    await changePrice();

    console.log('\n--- DISABILITA GUSTO ---');
    await disableFlavor();

    console.log('\n' + '='.repeat(60));
    console.log('\n💡 TIP: Crea un file in backend/scripts/mio_script.js');
    console.log('   Copia il codice che ti serve, modificalo ed eseguilo con:');
    console.log('   node backend/scripts/mio_script.js\n');

  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

main();
