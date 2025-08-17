using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using System.Security.Cryptography.X509Certificates;
using MerchantInsightsProxy.Configuration;
using MerchantInsightsProxy.Services;
using MerchantInsightsProxy.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configuration
builder.Configuration.AddEnvironmentVariables();
builder.Services.Configure<ProxyConfiguration>(builder.Configuration.GetSection("Proxy"));
builder.Services.Configure<OAuthConfiguration>(builder.Configuration.GetSection("OAuth"));
builder.Services.Configure<SecurityConfiguration>(builder.Configuration.GetSection("Security"));

// Core services
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddDataProtection();

// Custom services
builder.Services.AddSingleton<CookieEncryptionService>();
builder.Services.AddScoped<ProxyService>();
builder.Services.AddSingleton<OAuthSessionService>();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var proxyUrl = builder.Configuration["Proxy:ProxyUrl"] ?? "https://localhost:5443";
        policy.WithOrigins(proxyUrl)
              .AllowCredentials()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Swagger (development only)
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}

// HTTPS configuration - use .NET Core development certificates
builder.WebHost.ConfigureKestrel(options =>
{
    var port = int.Parse(builder.Configuration["Proxy:Port"] ?? "5443");
    
    options.ListenAnyIP(port, listenOptions =>
    {
        listenOptions.UseHttps(); // Uses .NET Core development certificate
    });
});

var app = builder.Build();

// Request logging middleware
app.Use(async (context, next) =>
{
    var requestId = context.Request.Headers["X-Request-ID"].FirstOrDefault() 
                   ?? $"req-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{Guid.NewGuid().ToString("N")[..9]}";
    context.Items["RequestId"] = requestId;
    context.Response.Headers.Append("X-Request-ID", requestId);
    
    Console.WriteLine($"[{requestId}] {context.Request.Method} {context.Request.Path} - {context.Connection.RemoteIpAddress}");
    await next();
});

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

// Trust proxy headers
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// CORS
app.UseCors();

// Custom authentication middleware
app.UseMiddleware<AuthenticationMiddleware>();

// Controllers
app.MapControllers();

// Static files middleware (for serving React SPA)
var distPath = Path.Combine(Directory.GetCurrentDirectory(), "../../../dist");
if (Directory.Exists(distPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(distPath),
        OnPrepareResponse = ctx =>
        {
            // Cache static assets for 1 year, but not HTML files
            if (ctx.File.Name.EndsWith(".html"))
            {
                ctx.Context.Response.Headers.Append("Cache-Control", "no-cache, no-store, must-revalidate");
            }
            else
            {
                ctx.Context.Response.Headers.Append("Cache-Control", "public, max-age=31536000, immutable");
            }
        }
    });
    
    // SPA fallback - serve index.html for unmatched routes
    app.MapFallback(async context =>
    {
        var indexPath = Path.Combine(distPath, "index.html");
        if (File.Exists(indexPath))
        {
            context.Response.ContentType = "text/html";
            context.Response.Headers.Append("Cache-Control", "no-cache, no-store, must-revalidate");
            await context.Response.SendFileAsync(indexPath);
        }
        else
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsync("Frontend build not found. Please run 'npm run build' first.");
        }
    });
}
else
{
    Console.WriteLine($"⚠️  Frontend build directory not found at {distPath}");
    Console.WriteLine("   Please run 'npm run build' to create the frontend build.");
}

// Graceful shutdown
var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
lifetime.ApplicationStopping.Register(() =>
{
    Console.WriteLine("📤 Shutting down gracefully...");
});

// Start server
Console.WriteLine("🚀 NBG Merchant Insights Proxy Server (.NET Core 8) Started");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
var port = builder.Configuration["Proxy:Port"] ?? "5443";
var proxyUrl = builder.Configuration["Proxy:ProxyUrl"] ?? $"https://localhost:{port}";
var backendUrl = builder.Configuration["Proxy:BackendApiUrl"] ?? "http://localhost:3001";
var oauthEnabled = bool.Parse(builder.Configuration["OAuth:Enabled"] ?? "true");
Console.WriteLine($"📍 Server URL: {proxyUrl}");
Console.WriteLine($"🔒 SSL: Enabled ({app.Environment.EnvironmentName} certificates)");
Console.WriteLine($"🔐 OAuth2: {(oauthEnabled ? "Enabled" : "Disabled")}");
Console.WriteLine($"🎯 Backend API: {backendUrl}");
Console.WriteLine($"🌍 Environment: {app.Environment.EnvironmentName}");
Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
Console.WriteLine("");
Console.WriteLine("Available endpoints:");
Console.WriteLine($"  🏠 Application: {proxyUrl}/");
Console.WriteLine($"  🔑 Login:       {proxyUrl}/login");
Console.WriteLine($"  👤 UserInfo:    {proxyUrl}/userinfo (protected)");
Console.WriteLine($"  📊 Health:      {proxyUrl}/health");
Console.WriteLine($"  🔌 API Proxy:   {proxyUrl}/api/*");
Console.WriteLine("");

if (app.Environment.IsDevelopment())
{
    Console.WriteLine("⚠️  Development Mode: Self-signed certificates in use");
    Console.WriteLine("   You may need to accept the security warning in your browser");
    Console.WriteLine("");
}

app.Run();
