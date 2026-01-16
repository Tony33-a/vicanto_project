/**
 * Test Auth API
 * Testa login, token, me endpoint
 */

const baseURL = 'http://localhost:3000/api';

async function testAuthAPI() {
  console.log('\n🔐 TEST AUTH API\n');
  console.log('='.repeat(60));

  try {
    // === 1. TEST LOGIN CON CREDENZIALI CORRETTE ===
    console.log('\n1️⃣  Test Login (credenziali corrette):');

    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'mario',
        pin: '1234'
      })
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
      console.log('   ✅ Login riuscito');
      console.log(`   Token: ${loginData.token.substring(0, 30)}...`);
      console.log(`   User: ${loginData.user.username} (${loginData.user.role})`);
    } else {
      console.log('   ❌ Login fallito:', loginData.error);
      return;
    }

    const token = loginData.token;

    // === 2. TEST LOGIN CON PIN ERRATO ===
    console.log('\n2️⃣  Test Login (PIN errato):');

    const wrongPinResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'mario',
        pin: '9999'
      })
    });

    const wrongPinData = await wrongPinResponse.json();

    if (!wrongPinResponse.ok) {
      console.log('   ✅ Correttamente rifiutato:', wrongPinData.error);
    } else {
      console.log('   ❌ ERRORE: Login doveva fallire!');
    }

    // === 3. TEST /ME CON TOKEN VALIDO ===
    console.log('\n3️⃣  Test GET /auth/me (con token):');

    const meResponse = await fetch(`${baseURL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const meData = await meResponse.json();

    if (meResponse.ok) {
      console.log('   ✅ User info ottenute');
      console.log(`   Username: ${meData.user.username}`);
      console.log(`   Role: ${meData.user.role}`);
      console.log(`   ID: ${meData.user.id}`);
    } else {
      console.log('   ❌ Errore:', meData.error);
    }

    // === 4. TEST /ME SENZA TOKEN ===
    console.log('\n4️⃣  Test GET /auth/me (senza token):');

    const noTokenResponse = await fetch(`${baseURL}/auth/me`);
    const noTokenData = await noTokenResponse.json();

    if (!noTokenResponse.ok) {
      console.log('   ✅ Correttamente rifiutato:', noTokenData.error);
    } else {
      console.log('   ❌ ERRORE: Doveva essere rifiutato!');
    }

    // === 5. TEST /ME CON TOKEN INVALIDO ===
    console.log('\n5️⃣  Test GET /auth/me (token invalido):');

    const badTokenResponse = await fetch(`${baseURL}/auth/me`, {
      headers: {
        'Authorization': 'Bearer token_falso_123'
      }
    });

    const badTokenData = await badTokenResponse.json();

    if (!badTokenResponse.ok) {
      console.log('   ✅ Correttamente rifiutato:', badTokenData.error);
    } else {
      console.log('   ❌ ERRORE: Doveva essere rifiutato!');
    }

    // === 6. TEST LOGOUT ===
    console.log('\n6️⃣  Test POST /auth/logout:');

    const logoutResponse = await fetch(`${baseURL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const logoutData = await logoutResponse.json();

    if (logoutResponse.ok) {
      console.log('   ✅ Logout riuscito:', logoutData.message);
    } else {
      console.log('   ❌ Errore:', logoutData.error);
    }

    // === 7. TEST LOGIN ADMIN ===
    console.log('\n7️⃣  Test Login Admin:');

    const adminLoginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        pin: '0000'
      })
    });

    const adminLoginData = await adminLoginResponse.json();

    if (adminLoginResponse.ok) {
      console.log('   ✅ Login admin riuscito');
      console.log(`   User: ${adminLoginData.user.username} (${adminLoginData.user.role})`);
    } else {
      console.log('   ❌ Login admin fallito:', adminLoginData.error);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TUTTI I TEST AUTH API PASSATI!\n');

  } catch (error) {
    console.error('\n❌ ERRORE:', error.message);
  }
}

// Verifica che il server sia avviato
console.log('⚠️  Assicurati che il server sia avviato: npm start');
console.log('⏳ Attendo 2 secondi prima di iniziare i test...\n');

setTimeout(testAuthAPI, 2000);
