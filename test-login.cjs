const testLogin = async () => {
  try {
    console.log('🧪 Probando login con Elizabeth...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'elygonzalez9044@gmail.com',
        password: 'elizabeth123' // Cambia por tu contraseña real
      })
    });

    const data = await response.json();
    
    console.log('📊 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', data.user.fullName);
      console.log('📧 Email:', data.user.email);
      console.log('🔑 Rol:', data.user.role);
    } else {
      console.log('❌ Login fallido:', data.message);
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
};

testLogin();