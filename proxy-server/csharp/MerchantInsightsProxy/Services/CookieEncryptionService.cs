using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using MerchantInsightsProxy.Configuration;

namespace MerchantInsightsProxy.Services;

public class CookieEncryptionService
{
    private readonly SecurityConfiguration _securityConfig;
    private readonly byte[] _key;
    
    public CookieEncryptionService(IOptions<SecurityConfiguration> securityConfig)
    {
        _securityConfig = securityConfig.Value;
        _securityConfig.Validate();
        
        // Use first 32 bytes of the encryption key
        _key = Encoding.UTF8.GetBytes(_securityConfig.CookieEncryptionKey)[..32];
    }
    
    public string Encrypt(object data)
    {
        try
        {
            var json = JsonSerializer.Serialize(data);
            var plainTextBytes = Encoding.UTF8.GetBytes(json);
            
            // Generate a random nonce (12 bytes for GCM)
            var nonce = new byte[12];
            RandomNumberGenerator.Fill(nonce);
            
            var cipherText = new byte[plainTextBytes.Length];
            var tag = new byte[16]; // GCM tag is 16 bytes
            
            using var aesGcm = new AesGcm(_key, 16);
            aesGcm.Encrypt(nonce, plainTextBytes, cipherText, tag);
            
            // Format: nonce:tag:ciphertext (all hex encoded)
            return $"{Convert.ToHexString(nonce)}:{Convert.ToHexString(tag)}:{Convert.ToHexString(cipherText)}";
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to encrypt data", ex);
        }
    }
    
    public T Decrypt<T>(string encryptedData)
    {
        try
        {
            var parts = encryptedData.Split(':');
            if (parts.Length != 3)
            {
                throw new ArgumentException("Invalid encrypted data format");
            }
            
            var nonce = Convert.FromHexString(parts[0]);
            var tag = Convert.FromHexString(parts[1]);
            var cipherText = Convert.FromHexString(parts[2]);
            
            var plainTextBytes = new byte[cipherText.Length];
            
            using var aesGcm = new AesGcm(_key, 16);
            aesGcm.Decrypt(nonce, cipherText, tag, plainTextBytes);
            
            var json = Encoding.UTF8.GetString(plainTextBytes);
            return JsonSerializer.Deserialize<T>(json) ?? throw new InvalidOperationException("Deserialization resulted in null");
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to decrypt data", ex);
        }
    }
    
    // Simplified AES-CBC implementation for better compatibility
    public string EncryptSimple(object data)
    {
        try
        {
            var json = JsonSerializer.Serialize(data);
            var plainTextBytes = Encoding.UTF8.GetBytes(json);
            
            using var aes = Aes.Create();
            aes.Key = _key;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            aes.GenerateIV();
            
            var iv = aes.IV;
            
            using var encryptor = aes.CreateEncryptor();
            using var msEncrypt = new MemoryStream();
            using (var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
            {
                csEncrypt.Write(plainTextBytes, 0, plainTextBytes.Length);
                csEncrypt.FlushFinalBlock();
            }
            
            var cipherText = msEncrypt.ToArray();
            
            // Format: iv:ciphertext (both base64 encoded for URL safety)
            return $"{Convert.ToBase64String(iv)}:{Convert.ToBase64String(cipherText)}";
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to encrypt data", ex);
        }
    }
    
    public T DecryptSimple<T>(string encryptedData)
    {
        try
        {
            var parts = encryptedData.Split(':');
            if (parts.Length != 2)
            {
                throw new ArgumentException("Invalid encrypted data format");
            }
            
            var iv = Convert.FromBase64String(parts[0]);
            var cipherText = Convert.FromBase64String(parts[1]);
            
            using var aes = Aes.Create();
            aes.Key = _key;
            aes.IV = iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;
            
            using var decryptor = aes.CreateDecryptor();
            using var msDecrypt = new MemoryStream(cipherText);
            using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
            using var srDecrypt = new StreamReader(csDecrypt);
            
            var json = srDecrypt.ReadToEnd();
            return JsonSerializer.Deserialize<T>(json) ?? throw new InvalidOperationException("Deserialization resulted in null");
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to decrypt data", ex);
        }
    }
}