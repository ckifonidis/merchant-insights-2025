namespace MerchantInsightsProxy.Models;

public class AuthTokenData
{
    public string AccessToken { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public string? IdToken { get; set; }
    public long? ExpiresAt { get; set; }
    public string? Scope { get; set; }
}

public class TokenResponse
{
    public string access_token { get; set; } = string.Empty;
    public string? refresh_token { get; set; }
    public string? id_token { get; set; }
    public int? expires_in { get; set; }
    public string? scope { get; set; }
    public string? token_type { get; set; }
}

public class UserInfo
{
    public string sub { get; set; } = string.Empty;
    public string? name { get; set; }
    public string? preferred_username { get; set; }
    public string? email { get; set; }
    public bool email_verified { get; set; }
    public string? iss { get; set; }
    public string? aud { get; set; }
    public long? iat { get; set; }
    public long? exp { get; set; }
}