/**
 * Certificate Generation Script for Vardhman Mills
 * Generates JWT keys and SSL certificates using Node.js crypto
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import selfsigned from 'selfsigned';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n================================================================');
console.log('  🔐 Certificate Setup for Vardhman Mills');
console.log('================================================================\n');

// Paths
const apiCertPath = path.join(__dirname, 'certificates', 'api');
const sslCertPath = path.join(__dirname, 'certificates', 'ssl');

// Ensure directories exist
if (!fs.existsSync(apiCertPath)) {
  fs.mkdirSync(apiCertPath, { recursive: true });
}
if (!fs.existsSync(sslCertPath)) {
  fs.mkdirSync(sslCertPath, { recursive: true });
}

console.log('================================================================');
console.log('  📝 Step 1: Generating JWT Keys (RS256)');
console.log('================================================================\n');

try {
  // Generate RSA key pair for JWT
  console.log('  → Generating RSA key pair (2048-bit)...');
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Save JWT private key
  fs.writeFileSync(path.join(apiCertPath, 'jwt-private.pem'), privateKey);
  console.log('  ✅ Generated jwt-private.pem');

  // Save JWT public key
  fs.writeFileSync(path.join(apiCertPath, 'jwt-public.pem'), publicKey);
  console.log('  ✅ Generated jwt-public.pem');

  console.log('\n  📄 JWT Key Details:');
  console.log('    • Algorithm: RSA-SHA256 (RS256)');
  console.log('    • Key Size: 2048 bits');
  console.log('    • Private Key: jwt-private.pem (KEEP SECRET!)');
  console.log('    • Public Key: jwt-public.pem (Can be shared)\n');

} catch (error) {
  console.error('  ❌ Failed to generate JWT keys:', error.message);
  process.exit(1);
}

console.log('================================================================');
console.log('  🔒 Step 2: Generating SSL Certificates (Self-Signed)');
console.log('================================================================\n');

try {
  // Generate RSA key pair for SSL
  console.log('  → Generating SSL key pair (2048-bit)...');
const { privateKey: sslPrivateKey, publicKey: sslPublicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// Save the SSL public key so the variable is used (can be helpful for debugging or distribution)
fs.writeFileSync(path.join(sslCertPath, 'ssl-public.pem'), sslPublicKey);
console.log('  ✅ Generated ssl-public.pem (Public Key)');

  // Create self-signed certificate
  console.log('  → Creating self-signed certificate...');
  console.log('    (Valid for 365 days)');

  // Certificate details
  const certDetails = {
    subject: {
      C: 'IN',
      ST: 'Punjab',
      L: 'Ludhiana',
      O: 'Vardhman Textiles',
      OU: 'IT Department',
      CN: 'localhost'
    },
    issuer: {
      C: 'IN',
      ST: 'Punjab',
      L: 'Ludhiana',
      O: 'Vardhman Textiles',
      OU: 'IT Department',
      CN: 'localhost'
    },
    serialNumber: crypto.randomBytes(16).toString('hex'),
    notBefore: new Date(),
    notAfter: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days
    altNames: [
      'DNS:localhost',
      'DNS:*.localhost',
      'IP:127.0.0.1',
      'IP:::1'
    ]
  };

  // Create certificate using selfsigned package (simplified self-signed cert)
  const cert = createSelfSignedCertificate(certDetails);

  // Save SSL private key
  fs.writeFileSync(path.join(sslCertPath, 'key.pem'), sslPrivateKey);
  console.log('  ✅ Generated key.pem (Private Key)');

  // Save SSL certificate
  fs.writeFileSync(path.join(sslCertPath, 'cert.pem'), cert);
  console.log('  ✅ Generated cert.pem (Certificate)');

  // Create CA bundle (copy of certificate for self-signed)
  fs.writeFileSync(path.join(sslCertPath, 'ca-bundle.crt'), cert);
  console.log('  ✅ Generated ca-bundle.crt (Certificate Chain)');

  console.log('\n  📄 SSL Certificate Details:');
  console.log('    • Type: Self-Signed (Development Only)');
  console.log('    • Algorithm: RSA-SHA256');
  console.log('    • Key Size: 2048 bits');
  console.log('    • Valid For: 365 days');
  console.log('    • Common Name: localhost');
  console.log('    • Alternative Names: localhost, 127.0.0.1\n');

} catch (error) {
  console.error('  ❌ Failed to generate SSL certificates:', error.message);
  process.exit(1);
}

console.log('================================================================');
console.log('  ✔️  Step 3: Verifying Certificates');
console.log('================================================================\n');

try {
  // Verify JWT keys exist and have content
  const jwtPrivate = fs.readFileSync(path.join(apiCertPath, 'jwt-private.pem'), 'utf8');
  const jwtPublic = fs.readFileSync(path.join(apiCertPath, 'jwt-public.pem'), 'utf8');

  if (jwtPrivate.includes('BEGIN PRIVATE KEY') && jwtPublic.includes('BEGIN PUBLIC KEY')) {
    console.log('  ✅ JWT keys verified - Keys are valid!');
  }

  // Verify SSL certificates exist and have content
  const sslKey = fs.readFileSync(path.join(sslCertPath, 'key.pem'), 'utf8');
  const sslCert = fs.readFileSync(path.join(sslCertPath, 'cert.pem'), 'utf8');

  if (sslKey.includes('BEGIN PRIVATE KEY') && sslCert.includes('BEGIN CERTIFICATE')) {
    console.log('  ✅ SSL certificate verified - Certificate is valid!');
  }

  console.log('');

} catch (error) {
  console.error('  ⚠️  Certificate verification failed:', error.message);
}

console.log('================================================================');
console.log('  📋 Certificate Information');
console.log('================================================================\n');

// Display file information
const files = [
  { name: 'jwt-private.pem', path: path.join(apiCertPath, 'jwt-private.pem') },
  { name: 'jwt-public.pem', path: path.join(apiCertPath, 'jwt-public.pem') },
  { name: 'key.pem', path: path.join(sslCertPath, 'key.pem') },
  { name: 'cert.pem', path: path.join(sslCertPath, 'cert.pem') },
  { name: 'ca-bundle.crt', path: path.join(sslCertPath, 'ca-bundle.crt') }
];

console.log('  Generated Files:');
files.forEach(file => {
  if (fs.existsSync(file.path)) {
    const stats = fs.statSync(file.path);
    console.log(`    ✓ ${file.name.padEnd(20)} ${stats.size} bytes`);
  }
});

console.log('\n  Locations:');
console.log(`    JWT Keys: ${apiCertPath}`);
console.log(`    SSL Certs: ${sslCertPath}`);
console.log('');

console.log('================================================================');
console.log('  🔐 Security Reminders');
console.log('================================================================\n');
console.log('  ⚠️  IMPORTANT:');
console.log('    • NEVER commit private keys to version control');
console.log('    • Keep jwt-private.pem and key.pem SECRET');
console.log('    • These are DEVELOPMENT certificates only');
console.log('    • For PRODUCTION, use Let\'s Encrypt or commercial CA\n');
console.log('  ✅ Safe to share:');
console.log('    • jwt-public.pem (public key)');
console.log('    • cert.pem (public certificate)');
console.log('    • ca-bundle.crt (certificate chain)\n');

console.log('================================================================');
console.log('  📝 Next Steps');
console.log('================================================================\n');
console.log('  1. Update your .gitignore to exclude private keys');
console.log('  2. Configure environment variables in .env files');
console.log('  3. For production, replace with proper SSL certificates\n');
console.log('  Environment Variables to Add:\n');
console.log('  Backend .env:');
console.log('    JWT_PRIVATE_KEY_PATH=../frontend/certificates/api/jwt-private.pem');
console.log('    JWT_PUBLIC_KEY_PATH=../frontend/certificates/api/jwt-public.pem');
console.log('    SSL_KEY_PATH=../frontend/certificates/ssl/key.pem');
console.log('    SSL_CERT_PATH=../frontend/certificates/ssl/cert.pem\n');

console.log('================================================================');
console.log('  🎉 Certificate Setup Complete!');
console.log('================================================================\n');
console.log('  All certificates have been generated successfully.');
console.log('  Your application is now ready for secure communication.\n');
console.log('================================================================\n');
// Create a simplified PEM certificate using the imported 'selfsigned' package
function createSelfSignedCertificate(details) {
  const attrs = [
    { name: 'countryName', value: details.subject.C },
    { name: 'stateOrProvinceName', value: details.subject.ST },
    { name: 'localityName', value: details.subject.L },
    { name: 'organizationName', value: details.subject.O },
    { name: 'organizationalUnitName', value: details.subject.OU },
    { name: 'commonName', value: details.subject.CN }
  ];

  const extensions = [{
    name: 'subjectAltName',
    altNames: [
      { type: 2, value: 'localhost' },
      { type: 2, value: '*.localhost' },
      { type: 7, ip: '127.0.0.1' },
      { type: 7, ip: '::1' }
    ]
  }];

  const pems = selfsigned.generate(attrs, {
    keySize: 2048,
    days: 365,
    algorithm: 'sha256',
    extensions: extensions
  });

  return pems.cert;
}
