const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certsDir = path.join(__dirname, '../certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

const keyPath = path.join(certsDir, 'localhost-key.pem');
const certPath = path.join(certsDir, 'localhost.pem');

// Check if certificates already exist
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('✅ SSL certificates already exist at:');
  console.log(`   Key: ${keyPath}`);
  console.log(`   Cert: ${certPath}`);
  process.exit(0);
}

console.log('🔧 Generating self-signed SSL certificates for localhost...');

try {
  // Generate private key
  execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'pipe' });
  
  // Generate certificate
  const opensslConfig = `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = GR
ST = Attica
L = Athens
O = NBG
OU = IT Department
CN = localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = critical, serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
`;

  const configPath = path.join(certsDir, 'openssl.conf');
  fs.writeFileSync(configPath, opensslConfig);

  execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configPath}" -extensions v3_req`, { stdio: 'pipe' });
  
  // Clean up config file
  fs.unlinkSync(configPath);

  console.log('✅ SSL certificates generated successfully!');
  console.log(`   Key: ${keyPath}`);
  console.log(`   Cert: ${certPath}`);
  console.log('');
  console.log('⚠️  Note: These are self-signed certificates for development only.');
  console.log('   You may need to accept the security warning in your browser.');
  console.log('   For production, use certificates from a trusted CA.');

} catch (error) {
  console.error('❌ Failed to generate SSL certificates:');
  console.error(error.message);
  console.log('');
  console.log('💡 Make sure OpenSSL is installed on your system.');
  console.log('   On macOS: brew install openssl');
  console.log('   On Ubuntu: sudo apt-get install openssl');
  console.log('   On Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
  process.exit(1);
}