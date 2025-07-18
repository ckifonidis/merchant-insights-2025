using Nbg.NetCore.MerchantInsights.UI.Middleware;
using Nbg.NetCore.MerchantInsights.UI.Services;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add HTTP client for proxy
builder.Services.AddHttpClient();

// Add proxy service
builder.Services.AddScoped<IProxyService, ProxyService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:5174", "http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS
app.UseCors("AllowReactApp");

// Add authentication middleware placeholder
app.UseMiddleware<AuthenticationMiddleware>();

// API proxy middleware - must come before static files
app.UseWhen(context => context.Request.Path.StartsWithSegments("/api"), 
    appBuilder => appBuilder.UseMiddleware<ProxyMiddleware>());

// Serve static files from wwwroot (React build)
app.UseStaticFiles();

// Serve React app files from dist directory
var distPath = Path.Combine(builder.Environment.ContentRootPath, "..", "dist");
if (Directory.Exists(distPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(distPath),
        RequestPath = ""
    });
}

// Fallback to index.html for SPA routing
app.MapFallbackToFile("index.html");

app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();