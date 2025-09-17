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
    // Standard OpenID Connect claims
    public string sub { get; set; } = string.Empty;
    public string? name { get; set; }
    public string? preferred_username { get; set; }
    public string? email { get; set; }
    public bool email_verified { get; set; }
    public string? iss { get; set; }
    public string? aud { get; set; }
    public long? iat { get; set; }
    public long? exp { get; set; }
    
    // NBG-specific claims
    public string? idp_provider { get; set; }
    public string? picture { get; set; }
    public string? ibank_user_id { get; set; }
    public string? sms_otp_mobile { get; set; }
    public string? phone_number { get; set; }
    public string? PhoneNumberVerified { get; set; }
    public string? customer_code { get; set; }
    public string? amount_limit_per_transaction { get; set; }
    public string? authorization_level { get; set; }
    public string? number_of_approvals { get; set; }
    public string? phone_number_verified { get; set; }
    public object? role { get; set; }  // Can be string or string[] from OAuth provider
}