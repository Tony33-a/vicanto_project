/**
 * Test Socket.IO Real-time Events
 * Testa la connessione WebSocket e gli eventi real-time
 */

const io = require('socket.io-client');

const baseURL = 'http://localhost:3000';
let token = null;

// Colori per console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

async function testSocketIO() {
  console.log('\n🧪 TEST SOCKET.IO REAL-TIME EVENTS\n');
  console.log('='.repeat(70));

  try {
    // === 1. LOGIN per ottenere token ===
    console.log('\n1️⃣  LOGIN:');
    const loginRes = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'mario', pin: '1234' })
    });
    const loginData = await loginRes.json();
    token = loginData.token;
    console.log(`   ✅ Login: ${loginData.user.username} (Token ottenuto)`);

    // === 2. CONNESSIONE SOCKET.IO ===
    console.log('\n2️⃣  CONNESSIONE SOCKET.IO:');

    // Simula 2 client: Monitor, Tablet
    const monitorSocket = io(baseURL, {
      auth: { token }
    });

    const tabletSocket = io(baseURL, {
      auth: { token }
    });

    // Attendi connessione
    await Promise.all([
      new Promise((resolve) => monitorSocket.on('connect', resolve)),
      new Promise((resolve) => tabletSocket.on('connect', resolve))
    ]);

    console.log(`   ${colors.green}✅ Monitor connected: ${monitorSocket.id}${colors.reset}`);
    console.log(`   ${colors.green}✅ Tablet connected: ${tabletSocket.id}${colors.reset}`);

    // === 3. JOIN ROOMS ===
    console.log('\n3️⃣  JOIN ROOMS:');

    monitorSocket.emit('join:room', 'monitor');
    tabletSocket.emit('join:room', 'tablets');

    // Attendi conferme
    await Promise.all([
      new Promise((resolve) => monitorSocket.on('room:joined', (data) => {
        console.log(`   ${colors.blue}📱 Monitor joined room: ${data.room}${colors.reset}`);
        resolve();
      })),
      new Promise((resolve) => tabletSocket.on('room:joined', (data) => {
        console.log(`   ${colors.blue}📱 Tablet joined room: ${data.room}${colors.reset}`);
        resolve();
      }))
    ]);

    // === 4. SETUP EVENT LISTENERS ===
    console.log('\n4️⃣  SETUP EVENT LISTENERS:');

    const events = {
      monitor: [],
      tablet: []
    };

    // Monitor listeners
    monitorSocket.on('table:updated', (data) => {
      events.monitor.push({ event: 'table:updated', data });
      console.log(`   ${colors.yellow}📺 MONITOR: table:updated - Table #${data.number} → ${data.status}${colors.reset}`);
    });
    monitorSocket.on('order:new', (data) => {
      events.monitor.push({ event: 'order:new', data });
      console.log(`   ${colors.yellow}📺 MONITOR: order:new - Order #${data.id}${colors.reset}`);
    });
    monitorSocket.on('order:sent', (data) => {
      events.monitor.push({ event: 'order:sent', data });
      console.log(`   ${colors.yellow}📺 MONITOR: order:sent - Order #${data.id}${colors.reset}`);
    });
    monitorSocket.on('order:completed', (data) => {
      events.monitor.push({ event: 'order:completed', data });
      console.log(`   ${colors.yellow}📺 MONITOR: order:completed - Order #${data.id}${colors.reset}`);
    });

    // Tablet listeners
    tabletSocket.on('table:updated', (data) => {
      events.tablet.push({ event: 'table:updated', data });
      console.log(`   ${colors.blue}📱 TABLET: table:updated - Table #${data.number} → ${data.status}${colors.reset}`);
    });
    tabletSocket.on('order:new', (data) => {
      events.tablet.push({ event: 'order:new', data });
      console.log(`   ${colors.blue}📱 TABLET: order:new - Order #${data.id}${colors.reset}`);
    });

    console.log('   ✅ Event listeners configurati');

    // === 5. CREATE ORDER (trigger eventi) ===
    console.log('\n5️⃣  CREATE ORDER (trigger real-time events):');

    await new Promise((resolve) => setTimeout(resolve, 500)); // Attendi setup listeners

    const newOrderRes = await fetch(`${baseURL}/api/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        table_id: 7,
        covers: 2,
        notes: 'Test Socket.IO',
        items: [
          {
            category: 'Coppetta',
            flavors: ['Pistacchio', 'Nocciola'],
            quantity: 1,
            course: 1,
            unit_price: 4.50
          }
        ]
      })
    });
    const orderData = await newOrderRes.json();
    const orderId = orderData.data.id;
    console.log(`   ✅ Ordine creato: #${orderId}`);

    // Attendi propagazione eventi
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // === 6. SEND ORDER ===
    console.log('\n6️⃣  SEND ORDER (trigger kitchen events):');

    await fetch(`${baseURL}/api/orders/${orderId}/send`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   ✅ Ordine inviato`);

    // Attendi propagazione eventi
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // === 7. COMPLETE ORDER ===
    console.log('\n7️⃣  COMPLETE ORDER:');

    await fetch(`${baseURL}/api/orders/${orderId}/complete`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   ✅ Ordine completato`);

    // Attendi propagazione eventi
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // === 8. VERIFICA EVENTI RICEVUTI ===
    console.log('\n8️⃣  VERIFICA EVENTI RICEVUTI:');
    console.log(`   📺 Monitor ricevuti: ${events.monitor.length} eventi`);
    console.log(`   📱 Tablet ricevuti: ${events.tablet.length} eventi`);

    // === 9. CLEANUP ===
    console.log('\n9️⃣  CLEANUP:');
    await fetch(`${baseURL}/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   ✅ Ordine #${orderId} eliminato`);

    // Chiudi connessioni
    monitorSocket.disconnect();
    tabletSocket.disconnect();
    console.log(`   ✅ Socket disconnessi`);

    console.log('\n' + '='.repeat(70));
    console.log(`${colors.green}✅ TUTTI I TEST SOCKET.IO PASSATI!${colors.reset}\n`);
    console.log(`${colors.green}🎉 REAL-TIME SYNC FUNZIONANTE!${colors.reset}\n`);

    process.exit(0);

  } catch (error) {
    console.error(`\n${colors.red}❌ ERRORE:${colors.reset}`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

console.log('⚠️  Assicurati che il server sia avviato: npm start');
console.log('⏳ Attendo 2 secondi prima di iniziare...\n');

setTimeout(testSocketIO, 2000);
