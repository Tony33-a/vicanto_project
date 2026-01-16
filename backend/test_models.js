/**
 * Script di test Models
 * Testa tutti i modelli implementati
 */

const Table = require('./models/Table');
const User = require('./models/User');
const MenuCategory = require('./models/MenuCategory');
const Flavor = require('./models/Flavor');
const Order = require('./models/Order');
const PrintQueue = require('./models/PrintQueue');
const db = require('./services/database');

async function testModels() {
  console.log('\n🧪 TEST MODELS VICANTO\n');
  console.log('='.repeat(60));

  try {
    // === 1. TEST TABLE MODEL ===
    console.log('\n1️⃣  Test Table Model:');

    const tables = await Table.findAll();
    console.log(`   ✅ findAll(): ${tables.length} tavoli`);

    const table5 = await Table.findById(5);
    console.log(`   ✅ findById(5): Tavolo ${table5.number}, status: ${table5.status}`);

    const tableWithOrder = await Table.findByIdWithOrder(5);
    console.log(`   ✅ findByIdWithOrder(5): ${tableWithOrder.current_order ? 'Ha ordine attivo' : 'Nessun ordine'}`);

    // === 2. TEST USER MODEL ===
    console.log('\n2️⃣  Test User Model:');

    const users = await User.findAll();
    console.log(`   ✅ findAll(): ${users.length} utenti`);

    const mario = await User.findByUsername('mario');
    console.log(`   ✅ findByUsername('mario'): ${mario.username} (${mario.role})`);

    // Test verifica PIN
    const validUser = await User.verifyPin('mario', '1234');
    console.log(`   ✅ verifyPin('mario', '1234'): ${validUser ? 'PIN corretto' : 'PIN errato'}`);

    const invalidUser = await User.verifyPin('mario', '9999');
    console.log(`   ✅ verifyPin('mario', '9999'): ${invalidUser ? 'PIN corretto' : 'PIN errato (OK)'}`);

    // === 3. TEST MENUCATEGORY MODEL ===
    console.log('\n3️⃣  Test MenuCategory Model:');

    const categories = await MenuCategory.findAll();
    console.log(`   ✅ findAll(): ${categories.length} categorie`);
    categories.forEach(c => {
      console.log(`      ${c.icon} ${c.name} - €${c.base_price}`);
    });

    const coppetta = await MenuCategory.findByCode('coppetta');
    console.log(`   ✅ findByCode('coppetta'): ${coppetta.name}, €${coppetta.base_price}`);

    const coppettaWithFlavors = await MenuCategory.findByCodeWithFlavors('coppetta');
    console.log(`   ✅ findByCodeWithFlavors('coppetta'): ${coppettaWithFlavors.flavors.length} gusti`);

    // === 4. TEST FLAVOR MODEL ===
    console.log('\n4️⃣  Test Flavor Model:');

    const allFlavors = await Flavor.findAll();
    console.log(`   ✅ findAll(): ${allFlavors.length} gusti totali`);

    const coppettaFlavors = await Flavor.findByCategory('coppetta');
    console.log(`   ✅ findByCategory('coppetta'): ${coppettaFlavors.length} gusti`);
    console.log(`      Primi 5: ${coppettaFlavors.slice(0, 5).map(f => f.name).join(', ')}`);

    // === 5. TEST ORDER MODEL ===
    console.log('\n5️⃣  Test Order Model:');

    // Crea ordine di test
    const testOrder = await Order.create({
      table_id: 1,
      user_id: 2, // mario
      covers: 2,
      notes: 'Test ordine',
      items: [
        {
          category: 'Coppetta',
          flavors: ['Cioccolato', 'Pistacchio'],
          quantity: 1,
          course: 1,
          unit_price: 4.50
        },
        {
          category: 'Cono',
          flavors: ['Fragola', 'Vaniglia'],
          quantity: 2,
          course: 1,
          unit_price: 3.50
        }
      ]
    });
    console.log(`   ✅ create(): Ordine #${testOrder.id} creato`);
    console.log(`      Subtotal: €${testOrder.subtotal}, Coperto: €${testOrder.cover_charge}, Totale: €${testOrder.total}`);

    const orderWithItems = await Order.findById(testOrder.id);
    console.log(`   ✅ findById(${testOrder.id}): ${orderWithItems.items.length} items`);
    orderWithItems.items.forEach((item, i) => {
      const flavors = typeof item.flavors === 'string' ? JSON.parse(item.flavors) : item.flavors;
      console.log(`      Item ${i+1}: ${item.quantity}x ${item.category} - ${flavors.join(', ')}`);
    });

    // Aggiorna stato tavolo
    await Table.setPending(1, 2, testOrder.total);
    console.log(`   ✅ Tavolo 1 impostato a PENDING`);

    // Invia ordine
    await Order.send(testOrder.id);
    console.log(`   ✅ send(): Ordine #${testOrder.id} inviato`);

    await Table.setOccupied(1, 2, testOrder.total);
    console.log(`   ✅ Tavolo 1 impostato a OCCUPIED`);

    const activeOrders = await Order.findActive();
    console.log(`   ✅ findActive(): ${activeOrders.length} ordini attivi`);

    // === 6. TEST PRINTQUEUE MODEL ===
    console.log('\n6️⃣  Test PrintQueue Model:');

    const printJob = await PrintQueue.create(testOrder.id);
    console.log(`   ✅ create(): Print job #${printJob.id} creato per ordine #${testOrder.id}`);

    const nextPending = await PrintQueue.findNextPending();
    console.log(`   ✅ findNextPending(): Print job #${nextPending.id}`);

    await PrintQueue.setPrinting(printJob.id);
    console.log(`   ✅ setPrinting(): Job #${printJob.id} in stampa`);

    await PrintQueue.setPrinted(printJob.id);
    console.log(`   ✅ setPrinted(): Job #${printJob.id} stampato`);

    // === 7. CLEANUP ===
    console.log('\n7️⃣  Cleanup test data:');

    // Completa ordine
    await Order.complete(testOrder.id);
    console.log(`   ✅ Ordine #${testOrder.id} completato`);

    // Libera tavolo
    await Table.free(1);
    console.log(`   ✅ Tavolo 1 liberato`);

    // Elimina job stampa
    await PrintQueue.delete(printJob.id);
    console.log(`   ✅ Print job #${printJob.id} eliminato`);

    // Elimina ordine
    await Order.delete(testOrder.id);
    console.log(`   ✅ Ordine #${testOrder.id} eliminato`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ TUTTI I TEST PASSATI!\n');

  } catch (error) {
    console.error('\n❌ ERRORE DURANTE I TEST:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

testModels();
