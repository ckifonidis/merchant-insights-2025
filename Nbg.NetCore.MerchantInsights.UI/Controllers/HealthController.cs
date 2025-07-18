using Microsoft.AspNetCore.Mvc;

namespace Nbg.NetCore.MerchantInsights.UI.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;
    private readonly IConfiguration _configuration;

    public HealthController(ILogger<HealthController> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    [HttpGet]
    public IActionResult Get()
    {
        var health = new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
            Version = "1.0.0",
            ProxyTarget = _configuration.GetValue<string>("ProxySettings:MockServerUrl"),
            AuthenticationEnabled = _configuration.GetValue<bool>("Authentication:Enabled", false)
        };

        _logger.LogDebug("Health check requested: {@Health}", health);
        
        return Ok(health);
    }
}