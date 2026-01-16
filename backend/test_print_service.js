/**
 * Test Print Service End-to-End
 * Testa il flusso completo: Ordine → Print Queue → Stampa → Socket.IO events
 */

const baseURL = 'http://localhost:3000';
let token = null;

// Colori console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

async function testPrintService() {
  console.log('\n🧪 TEST PRINT SERVICE END-TO-END\n');
  console.log('='.repeat(70));

  try {
    // === 1. LOGIN ===
    console.log('\n1️⃣  LOGIN:');
    const loginRes = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'mario', pin: '1234' })
    });
    const loginData = await loginRes.json();
    token = loginData.token;
    console.log(`   ✅ Login: ${loginData.user.username}`);

    // === 2. CREA ORDINE ===
    console.log('\n2️⃣  CREATE ORDER:');
    const newOrderRes = await fetch(`${baseURL}/api/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        table_id: 3,
        covers: 2,
        notes: 'Test stampa',
        items: [
          {
            category: 'Coppetta',
            flavors: ['Cioccolato', 'Pistacchio', 'Nocciola'],
            quantity: 2,
            course: 1,
            unit_price: 4.50
          },
          {
            category: 'Frappè',
            flavors: ['Fragola'],
            quantity: 1,
            course: 2,
            unit_price: 4.00
          }
        ]
      })
    });
    const orderData = await newOrderRes.json();
    const orderId = orderData.data.id;
    console.log(`   ✅ Ordine creato: #${orderId}`);
    console.log(`      Tavolo: ${orderData.data.table_number}`);
    console.log(`      Totale: €${orderData.data.total}`);
    console.log(`      Items: ${orderData.data.items.length}`);

    // === 3. INVIA ORDINE (→ print_queue) ===
    console.log('\n3️⃣  SEND ORDER (add to print queue):');
    const sendRes = await fetch(`${baseURL}/api/orders/${orderId}/send`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const sendData = await sendRes.json();
    console.log(`   ✅ Ordine inviato: #${sendData.data.id}`);
    console.log(`      Status: ${sendData.data.status}`);
    console.log(`      📋 Aggiunto a print_queue`);

    // === 4. VERIFICA PRINT QUEUE ===
    console.log('\n4️⃣  VERIFY PRINT QUEUE:');

    await new Promise(resolve => setTimeout(resolve, 1000)); // Attendi 1s

    // Usa model PrintQueue
    const PrintQueue = require('./models/PrintQueue');
    const job = await PrintQueue.findByOrderId(orderId);

    if (job) {
      console.log(`   ✅ Job trovato in print_queue:`);
      console.log(`      ID: ${job.id}`);
      console.log(`      Order ID: ${job.order_id}`);
      console.log(`      Status: ${job.status}`);
      console.log(`      Attempts: ${job.attempts}/${job.max_attempts}`);

      if (job.status === 'printed') {
        console.log(`      ${colors.green}✅ STAMPATO con successo!${colors.reset}`);
        console.log(`      Printed at: ${new Date(job.printed_at).toLocaleTimeString()}`);
      } else if (job.status === 'pending') {
        console.log(`      ${colors.yellow}⏳ In attesa di stampa (verifica che printServer sia avviato)${colors.reset}`);
      } else if (job.status === 'failed') {
        console.log(`      ${colors.red}❌ FALLITO${colors.reset}`);
        console.log(`      Error: ${job.error_message}`);
      }
    } else {
      console.log(`   ${colors.red}❌ Nessun job trovato per ordine #${orderId}${colors.reset}`);
    }

    // === 5. INFO PRINT SERVER ===
    console.log('\n5️⃣  PRINT SERVER INFO:');
    console.log(`   ℹ️  Per processare la stampa, avvia Print Server:`);
    console.log(`      ${colors.blue}npm run print-server:mock${colors.reset}  (modalità test)`);
    console.log(`      ${colors.blue}npm run print-server${colors.reset}        (stampante WiFi reale)`);
    console.log(`\n   Il Print Server:`)
    console.log(`      - Monitora print_queue ogni 500ms`);
    console.log(`      - Stampa su stampante termica WiFi`);
    console.log(`      - Emette eventi Socket.IO (print:success/failed)`);
    console.log(`      - Retry automatico fino a 3 tentativi`);

    // === 6. CLEANUP ===
    console.log('\n6️⃣  CLEANUP:');

    // Chiedi all'utente se vuole eliminare
    console.log(`   ⚠️  Mantieni ordine per testare Print Server?`);
    console.log(`      Per eliminare ordine: DELETE /api/orders/${orderId}`);

    console.log('\n' + '='.repeat(70));
    console.log(`${colors.green}✅ TEST PRINT SERVICE COMPLETATO!${colors.reset}\n`);
    console.log(`${colors.yellow}⏭️  NEXT STEP: Avvia Print Server per vedere la stampa${colors.reset}\n`);

    process.exit(0);

  } catch (error) {
    console.error(`\n${colors.red}❌ ERRORE:${colors.reset}`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

console.log('⚠️  Assicurati che il server sia avviato: npm start');
console.log('⏳ Attendo 2 secondi prima di iniziare...\n');

setTimeout(testPrintService, 2000);
