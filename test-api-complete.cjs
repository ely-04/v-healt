const testAPI = async () => {
  try {
    console.log('🧪 Probando conexión a la API...');
    
    // Test 1: Health check
    console.log('\n1. Probando /api/health');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test 2: Login test
    console.log('\n2. Probando /api/auth/login');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'elygonzalez9044@gmail.com',
        password: 'elizabeth123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📊 Login response status:', loginResponse.status);
    console.log('📋 Login response:', loginData);

    // Test 3: CAPTCHA test
    console.log('\n3. Probando /api/captcha/generate');
    const captchaResponse = await fetch('http://localhost:3000/api/captcha/generate');
    const captchaData = await captchaResponse.json();
    console.log('🔢 CAPTCHA response:', captchaData);

  } catch (error) {
    console.error('💥 Error completo:', error);
    console.error('🔍 Tipo de error:', error.name);
    console.error('📝 Mensaje:', error.message);
  }
};

testAPI();