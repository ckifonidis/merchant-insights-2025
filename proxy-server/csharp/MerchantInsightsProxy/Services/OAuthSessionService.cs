using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace MerchantInsightsProxy.Services;

public class OAuthSessionService
{
    private readonly ConcurrentDictionary<string, OAuthSession> _sessions = new();
    private readonly Timer _cleanupTimer;
    
    public OAuthSessionService()
    {
        // Clean up expired sessions every 5 minutes
        _cleanupTimer = new Timer(CleanupExpiredSessions, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
    }
    
    public string CreateSession(string? returnUrl = null)
    {
        var sessionId = Guid.NewGuid().ToString("N");
        var state = GenerateSecureString(32);
        var nonce = GenerateSecureString(16);
        
        var session = new OAuthSession
        {
            SessionId = sessionId,
            State = state,
            Nonce = nonce,
            CreatedAt = DateTimeOffset.UtcNow,
            OriginalUrl = returnUrl ?? "/"
        };
        
        _sessions.TryAdd(sessionId, session);
        return sessionId;
    }
    
    public OAuthSession? GetSession(string sessionId)
    {
        _sessions.TryGetValue(sessionId, out var session);
        return session;
    }
    
    public bool ValidateAndRemoveSession(string sessionId, string state)
    {
        if (!_sessions.TryRemove(sessionId, out var session))
        {
            return false;
        }
        
        // Check if session is expired (10 minutes)
        if (DateTimeOffset.UtcNow - session.CreatedAt > TimeSpan.FromMinutes(10))
        {
            return false;
        }
        
        return session.State == state;
    }
    
    private static string GenerateSecureString(int length)
    {
        var bytes = new byte[length];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "")[..length];
    }
    
    private void CleanupExpiredSessions(object? state)
    {
        var expiredThreshold = DateTimeOffset.UtcNow.AddMinutes(-10);
        var expiredSessions = _sessions
            .Where(kvp => kvp.Value.CreatedAt < expiredThreshold)
            .Select(kvp => kvp.Key)
            .ToList();
        
        foreach (var sessionId in expiredSessions)
        {
            _sessions.TryRemove(sessionId, out _);
        }
    }
    
    public void Dispose()
    {
        _cleanupTimer?.Dispose();
    }
}

public class OAuthSession
{
    public string SessionId { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string Nonce { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public string OriginalUrl { get; set; } = "/";
}