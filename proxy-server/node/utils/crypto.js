const crypto = require('crypto');

class CookieEncryption {
  constructor(encryptionKey) {
    if (!encryptionKey || encryptionKey.length < 32) {
      throw new Error('Encryption key must be at least 32 characters long');
    }
    this.key = Buffer.from(encryptionKey.slice(0, 32), 'utf8');
    this.algorithm = 'aes-256-gcm';
  }

  encrypt(data) {
    try {
      const plaintext = JSON.stringify(data);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      cipher.setAAD(Buffer.from('nbg-merchant-insights', 'utf8'));
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Combine iv + authTag + encrypted data
      const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
      return result;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decrypt(encryptedData) {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAAD(Buffer.from('nbg-merchant-insights', 'utf8'));
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}

function generateSecureNonce() {
  return crypto.randomBytes(16).toString('base64url');
}

function generateSecureState() {
  return crypto.randomBytes(32).toString('base64url');
}

module.exports = {
  CookieEncryption,
  generateSecureKey,
  generateSecureNonce,
  generateSecureState
};