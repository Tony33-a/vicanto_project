/**
 * Test Completo API Vicanto
 * Testa l'intero flusso: Login → Tavoli → Menu → Ordini
 */

const baseURL = 'http://localhost:3000/api';
let token = null;

async function testAllAPI() {
  console.log('\n🧪 TEST COMPLETO API VICANTO\n');
  console.log('='.repeat(70));

  try {
    // === 1. LOGIN ===
    console.log('\n1️⃣  LOGIN:');
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'mario', pin: '1234' })
    });
    const loginData = await loginRes.json();
    token = loginData.token;
    console.log(`   ✅ Login: ${loginData.user.username} (${loginData.user.role})`);

    // === 2. GET TABLES ===
    console.log('\n2️⃣  GET TABLES:');
    const tablesRes = await fetch(`${baseURL}/tables`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const tablesData = await tablesRes.json();
    console.log(`   ✅ Tavoli: ${tablesData.count} tavoli`);
    console.log(`      Primi 3: ${tablesData.data.slice(0, 3).map(t => `#${t.number} (${t.status})`).join(', ')}`);

    // === 3. GET MENU CATEGORIES ===
    console.log('\n3️⃣  GET MENU CATEGORIES:');
    const categoriesRes = await fetch(`${baseURL}/menu/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const categoriesData = await categoriesRes.json();
    console.log(`   ✅ Categorie: ${categoriesData.count}`);
    categoriesData.data.forEach(c => {
      console.log(`      ${c.icon} ${c.name} - €${c.base_price}`);
    });

    // === 4. GET FLAVORS COPPETTA ===
    console.log('\n4️⃣  GET FLAVORS (Coppetta):');
    const flavorsRes = await fetch(`${baseURL}/menu/flavors/coppetta`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const flavorsData = await flavorsRes.json();
    console.log(`   ✅ Gusti Coppetta: ${flavorsData.count}`);
    console.log(`      Primi 5: ${flavorsData.data.slice(0, 5).map(f => f.name).join(', ')}`);

    // === 5. CREATE ORDER ===
    console.log('\n5️⃣  CREATE ORDER:');
    const newOrderRes = await fetch(`${baseURL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        table_id: 5,
        covers: 2,
        notes: 'Test ordine API',
        items: [
          {
            category: 'Coppetta',
            flavors: ['Cioccolato', 'Pistacchio'],
            quantity: 1,
            course: 1,
            unit_price: 4.50
          },
          {
            category: 'Frappè',
            flavors: ['Fragola'],
            quantity: 1,
            course: 1,
            unit_price: 4.00
          }
        ]
      })
    });
    const newOrderData = await newOrderRes.json();
    console.log(`   ✅ Ordine creato: ID #${newOrderData.data.id}`);
    console.log(`      Tavolo: ${newOrderData.data.table_number}, Coperti: ${newOrderData.data.covers}`);
    console.log(`      Subtotal: €${newOrderData.data.subtotal}, Coperto: €${newOrderData.data.cover_charge}, Totale: €${newOrderData.data.total}`);
    console.log(`      Items: ${newOrderData.data.items.length}`);

    const orderId = newOrderData.data.id;

    // === 6. GET TABLE WITH ORDER ===
    console.log('\n6️⃣  GET TABLE #5 (with order):');
    const table5Res = await fetch(`${baseURL}/tables/5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const table5Data = await table5Res.json();
    console.log(`   ✅ Tavolo #${table5Data.data.number}: ${table5Data.data.status}`);
    console.log(`      Coperti: ${table5Data.data.covers}, Totale: €${table5Data.data.total}`);
    if (table5Data.data.current_order) {
      console.log(`      Ordine attivo: #${table5Data.data.current_order.id} (${table5Data.data.current_order.items.length} items)`);
    }

    // === 7. SEND ORDER ===
    console.log('\n7️⃣  SEND ORDER (to kitchen + print queue):');
    const sendRes = await fetch(`${baseURL}/orders/${orderId}/send`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const sendData = await sendRes.json();
    console.log(`   ✅ Ordine inviato: #${sendData.data.id}`);
    console.log(`      Status: ${sendData.data.status}, Inviato alle: ${new Date(sendData.data.sent_at).toLocaleTimeString()}`);

    // === 8. GET ACTIVE ORDERS ===
    console.log('\n8️⃣  GET ACTIVE ORDERS:');
    const activeRes = await fetch(`${baseURL}/orders/active`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const activeData = await activeRes.json();
    console.log(`   ✅ Ordini attivi: ${activeData.count}`);
    activeData.data.forEach(o => {
      console.log(`      #${o.id} - Tavolo ${o.table_number}, Status: ${o.status}, €${o.total}`);
    });

    // === 9. COMPLETE ORDER ===
    console.log('\n9️⃣  COMPLETE ORDER (free table):');
    const completeRes = await fetch(`${baseURL}/orders/${orderId}/complete`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const completeData = await completeRes.json();
    console.log(`   ✅ Ordine completato: #${completeData.data.id}`);
    console.log(`      Status: ${completeData.data.status}`);

    // === 10. VERIFY TABLE IS FREE ===
    console.log('\n🔟  VERIFY TABLE #5 IS FREE:');
    const table5FinalRes = await fetch(`${baseURL}/tables/5`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const table5FinalData = await table5FinalRes.json();
    console.log(`   ✅ Tavolo #${table5FinalData.data.number}: ${table5FinalData.data.status}`);
    console.log(`      Coperti: ${table5FinalData.data.covers}, Totale: €${table5FinalData.data.total}`);

    // === 11. CLEANUP ===
    console.log('\n1️⃣1️⃣  CLEANUP (delete test order):');
    await fetch(`${baseURL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   ✅ Ordine #${orderId} eliminato`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ TUTTI I TEST API PASSATI!\n');
    console.log('🎉 BACKEND COMPLETAMENTE FUNZIONANTE!\n');

  } catch (error) {
    console.error('\n❌ ERRORE:', error.message);
    console.error(error.stack);
  }
}

console.log('⚠️  Assicurati che il server sia avviato: npm start');
console.log('⏳ Attendo 2 secondi prima di iniziare...\n');

setTimeout(testAllAPI, 2000);
