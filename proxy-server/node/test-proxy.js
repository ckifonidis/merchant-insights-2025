const https = require('https');
const { config } = require('./utils/config');

// Allow self-signed certificates for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testProxy() {
  console.log('🧪 Testing NBG Proxy Server...\n');

  const tests = [
    {
      name: 'Health Check',
      path: '/health',
      expectedStatus: 200
    },
    {
      name: 'Static File (should serve React app or 404)',
      path: '/',
      expectedStatus: [200, 404]
    },
    {
      name: 'Login Endpoint',
      path: '/login',
      expectedStatus: [302, 503] // Redirect to OAuth or service unavailable
    },
    {
      name: 'Auth Status',
      path: '/auth/status',
      expectedStatus: 200
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const result = await makeRequest(test.path);
      const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
      
      if (expectedStatuses.includes(result.statusCode)) {
        console.log(`✅ ${test.name}: ${result.statusCode} ${result.statusMessage}`);
      } else {
        console.log(`❌ ${test.name}: Expected ${test.expectedStatus}, got ${result.statusCode}`);
      }
      
      if (test.path === '/health' && result.statusCode === 200) {
        try {
          const data = JSON.parse(result.data);
          console.log(`   Status: ${data.status}`);
          console.log(`   Environment: ${data.environment}`);
          console.log(`   Build Ready: ${data.buildReady}`);
        } catch (e) {
          console.log(`   Response: ${result.data.substring(0, 100)}...`);
        }
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
    
    console.log('');
  }
}

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: config.PROXY_PORT,
      path: path,
      method: 'GET',
      rejectUnauthorized: false // Allow self-signed certificates
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run tests if this file is executed directly
if (require.main === module) {
  testProxy().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testProxy };