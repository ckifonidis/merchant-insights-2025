namespace MerchantInsightsProxy.Configuration;

public class SecurityConfiguration
{
    public string CookieEncryptionKey { get; set; } = string.Empty;
    public string SessionSecret { get; set; } = string.Empty;
    
    public void Validate()
    {
        if (string.IsNullOrEmpty(CookieEncryptionKey) || CookieEncryptionKey.Length < 32)
        {
            throw new InvalidOperationException("CookieEncryptionKey must be at least 32 characters long");
        }
        
        if (string.IsNullOrEmpty(SessionSecret) || SessionSecret.Length < 16)
        {
            throw new InvalidOperationException("SessionSecret must be at least 16 characters long");
        }
    }
}