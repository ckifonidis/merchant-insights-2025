#!/bin/bash

echo "🔧 Generating SSL certificates for NBG Merchant Insights Proxy"
echo "============================================================"

# Navigate to the script directory
cd "$(dirname "$0")"

# Certificate paths
KEY_PATH="localhost-key.pem"
CERT_PATH="localhost.pem"
COMBINED_PATH="localhost-combined.pem"
PFX_PATH="localhost.pfx"

# Check if certificates already exist
if [ -f "$KEY_PATH" ] && [ -f "$CERT_PATH" ]; then
  echo "✅ SSL certificates already exist:"
  echo "   🔑 Private Key: $(pwd)/$KEY_PATH"
  echo "   📄 Certificate: $(pwd)/$CERT_PATH"
  echo "   🔗 Combined PEM: $(pwd)/$COMBINED_PATH"
  echo "   📦 PKCS#12 (.pfx): $(pwd)/$PFX_PATH"
  echo ""
  echo "🔄 To regenerate certificates, delete existing files and run this script again."
  exit 0
fi

# Check if OpenSSL is available
if ! command -v openssl &> /dev/null; then
    echo "❌ OpenSSL is not installed. Please install OpenSSL first."
    echo ""
    echo "💡 Installation instructions:"
    echo "   On macOS: brew install openssl"
    echo "   On Ubuntu: sudo apt-get install openssl"
    echo "   On Windows: Download from https://slproweb.com/products/Win32OpenSSL.html"
    exit 1
fi

echo "🔐 Generating self-signed SSL certificates for localhost..."

# Generate private key
echo "📋 Generating private key..."
openssl genrsa -out "$KEY_PATH" 2048

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate private key"
    exit 1
fi

# Create OpenSSL configuration
CONFIG_FILE="openssl.conf"
cat > "$CONFIG_FILE" << EOF
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
EOF

# Generate certificate
echo "📋 Generating certificate..."
openssl req -new -x509 -key "$KEY_PATH" -out "$CERT_PATH" -days 365 -config "$CONFIG_FILE" -extensions v3_req

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate certificate"
    rm -f "$CONFIG_FILE"
    exit 1
fi

# Clean up config file
rm -f "$CONFIG_FILE"

# Create combined certificate file for .NET Core compatibility
echo "📋 Creating combined PEM file..."
cat "$KEY_PATH" "$CERT_PATH" > "$COMBINED_PATH"

# Create PKCS#12 (.pfx) file for .NET Core (alternative format)
echo "📋 Creating PKCS#12 (.pfx) file..."
openssl pkcs12 -export -out "$PFX_PATH" -inkey "$KEY_PATH" -in "$CERT_PATH" -password pass:

echo ""
echo "✅ SSL certificates generated successfully!"
echo "   🔑 Private Key: $(pwd)/$KEY_PATH"
echo "   📄 Certificate: $(pwd)/$CERT_PATH"  
echo "   🔗 Combined PEM: $(pwd)/$COMBINED_PATH"
echo "   📦 PKCS#12 (.pfx): $(pwd)/$PFX_PATH"
echo ""

# Add certificate to system keychain (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🔒 Adding certificate to macOS keychain..."
    
    # Check if certificate is already in keychain
    if security find-certificate -c "localhost" /Library/Keychains/System.keychain > /dev/null 2>&1; then
        echo "⚠️  Certificate already exists in system keychain"
        echo "🔄 Removing existing certificate..."
        sudo security delete-certificate -c "localhost" /Library/Keychains/System.keychain 2>/dev/null || true
    fi
    
    # Add certificate to system keychain as trusted
    echo "📥 Installing certificate to system keychain..."
    sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$(pwd)/$CERT_PATH"
    
    if [ $? -eq 0 ]; then
        echo "✅ Certificate successfully added to macOS system keychain"
        echo "🌐 Browser should now trust https://localhost:5443 automatically"
    else
        echo "❌ Failed to add certificate to keychain (requires admin privileges)"
        echo "💡 You can manually add the certificate or accept the browser warning"
    fi
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Linux detected - certificate installation varies by distribution"
    echo "💡 For Ubuntu/Debian:"
    echo "   sudo cp $(pwd)/$CERT_PATH /usr/local/share/ca-certificates/localhost.crt"
    echo "   sudo update-ca-certificates"
    
else
    echo "🪟 For Windows, manually import the certificate:"
    echo "   1. Double-click $(pwd)/$CERT_PATH"
    echo "   2. Click 'Install Certificate'"
    echo "   3. Select 'Local Machine' → 'Trusted Root Certification Authorities'"
fi

echo ""
echo "💡 Multiple formats generated for compatibility:"
echo "   - Node.js: Uses separate key + cert PEM files"
echo "   - .NET Core: Uses X509Certificate2.CreateFromPemFile() with same files"
echo "   - Both implementations: Identical certificates = no browser conflicts"
echo ""
echo "⚠️  Note: These are self-signed certificates for development only."
echo "   For production, use certificates from a trusted CA."
echo ""
echo "🚀 Ready to start proxy servers with unified certificates!"