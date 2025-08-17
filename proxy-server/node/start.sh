#!/bin/bash

echo "🚀 Starting NBG Merchant Insights Proxy Server"
echo "=============================================="

# Navigate to proxy-server directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# SSL Certificate Management (unified with .NET Core)
echo "🔐 Setting up SSL certificates..."

# Check if .NET is available for unified certificate approach
if command -v dotnet &> /dev/null; then
    echo "📦 .NET Core detected - using unified certificate approach"
    
    # Check if .NET development certificates exist and are trusted
    if ! dotnet dev-certs https --check --trust --quiet 2>/dev/null; then
        echo "🔧 Creating and trusting .NET Core development certificates..."
        
        # First, clean any existing certificates to ensure fresh state
        dotnet dev-certs https --clean --quiet 2>/dev/null
        
        # Create and trust new development certificates
        dotnet dev-certs https --trust
        
        if [ $? -ne 0 ]; then
            echo "❌ Failed to create .NET Core certificates"
            echo "💡 Please run manually: dotnet dev-certs https --trust"
            echo "🔄 Falling back to OpenSSL certificate generation..."
            npm run generate-certs
        else
            echo "✅ .NET Core development certificates created and trusted"
        fi
    else
        echo "✅ .NET Core development certificates already exist and are trusted"
    fi
    
    # Export .NET certificates to PEM format for Node.js (if .NET certs are available)
    if dotnet dev-certs https --check --quiet 2>/dev/null; then
        if [ ! -d "certs" ]; then
            mkdir -p certs
        fi
        
        echo "📤 Exporting .NET Core certificates for Node.js compatibility..."
        
        # Export certificate in PEM format
        dotnet dev-certs https --export-path "certs/localhost.pem" --format Pem --no-password
        
        if [ $? -eq 0 ] && [ -f "certs/localhost.pem" ]; then
            # Export private key by converting through PFX format
            echo "🔑 Extracting private key from .NET certificate..."
            
            # Export as PFX with temporary password
            dotnet dev-certs https --export-path "/tmp/dotnet-dev-cert.pfx" --password "temp123" --format Pfx 2>/dev/null
            
            if [ -f "/tmp/dotnet-dev-cert.pfx" ]; then
                # Extract private key from PFX using openssl
                if command -v openssl &> /dev/null; then
                    openssl pkcs12 -in "/tmp/dotnet-dev-cert.pfx" -nocerts -out "certs/localhost-key.pem" -nodes -password pass:temp123 2>/dev/null
                    
                    # Clean up temporary PFX file
                    rm -f "/tmp/dotnet-dev-cert.pfx"
                    
                    if [ -f "certs/localhost-key.pem" ]; then
                        echo "✅ Successfully exported .NET Core certificates for Node.js"
                        echo "   📄 Certificate: certs/localhost.pem (from .NET Core)"
                        echo "   🔑 Private Key: certs/localhost-key.pem (from .NET Core)"
                        echo "   🔗 Both Node.js and .NET Core proxies now use identical certificates"
                    else
                        echo "❌ Failed to extract private key from .NET certificate"
                        echo "🔄 Falling back to OpenSSL certificate generation..."
                        rm -f "certs/localhost.pem"
                        npm run generate-certs
                    fi
                else
                    echo "❌ OpenSSL not available for private key extraction"
                    echo "🔄 Falling back to OpenSSL certificate generation..."
                    rm -f "certs/localhost.pem"
                    npm run generate-certs
                fi
            else
                echo "❌ Failed to export .NET certificate as PFX"
                echo "🔄 Falling back to OpenSSL certificate generation..."
                rm -f "certs/localhost.pem"
                npm run generate-certs
            fi
        else
            echo "❌ Failed to export .NET certificate to PEM format"
            echo "🔄 Falling back to OpenSSL certificate generation..."
            npm run generate-certs
        fi
    else
        echo "❌ .NET Core certificates not available after creation attempt"
        echo "🔄 Falling back to OpenSSL certificate generation..."
        npm run generate-certs
    fi
    
else
    echo "⚠️  .NET Core not detected - using OpenSSL certificates"
    # Generate SSL certificates if they don't exist (fallback)
    if [ ! -f "certs/localhost-key.pem" ] || [ ! -f "certs/localhost.pem" ]; then
        echo "🔐 Generating SSL certificates with OpenSSL..."
        npm run generate-certs
    else
        echo "✅ SSL certificates already exist"
    fi
fi

# Final validation that certificates exist
if [ ! -f "certs/localhost-key.pem" ] || [ ! -f "certs/localhost.pem" ]; then
    echo "❌ SSL certificate setup failed!"
    echo "💡 Please ensure either .NET Core is installed with 'dotnet dev-certs https --trust'"
    echo "   or OpenSSL is available for certificate generation"
    exit 1
else
    echo "🔒 SSL certificates ready for HTTPS server"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Environment file not found. Copying from example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before running in production."
fi

# Check if React app is built
if [ ! -d "../dist" ]; then
    echo "⚠️  React application not built. Building now..."
    cd ..
    if [ -f "package.json" ]; then
        npm install
        npm run build
    else
        echo "❌ No package.json found in parent directory. Please build the React app first."
        exit 1
    fi
    cd proxy-server
fi

echo "✅ Setup complete. Starting proxy server..."
echo ""

# Start the server
npm start