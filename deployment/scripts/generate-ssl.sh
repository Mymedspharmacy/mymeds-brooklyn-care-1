#!/bin/bash

# Generate SSL certificates for development
# This script creates self-signed certificates for local development

echo "🔐 Generating SSL certificates for development..."

# Create SSL directory
mkdir -p nginx/ssl

# Generate private key
openssl genrsa -out nginx/ssl/key.pem 2048

# Generate certificate signing request
openssl req -new -key nginx/ssl/key.pem -out nginx/ssl/cert.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -in nginx/ssl/cert.csr -signkey nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365

# Set permissions
chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem

# Clean up CSR file
rm nginx/ssl/cert.csr

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates saved in: nginx/ssl/"
echo "🔒 Key file: nginx/ssl/key.pem"
echo "📜 Certificate file: nginx/ssl/cert.pem"
echo ""
echo "⚠️  Note: These are self-signed certificates for development only."
echo "   For production, use proper SSL certificates from a trusted CA."
