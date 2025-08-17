namespace MerchantInsightsProxy.Configuration;

public class ProxyConfiguration
{
    public string Port { get; set; } = "5443";
    public string ProxyUrl { get; set; } = "https://localhost:5443";
    public string BackendApiUrl { get; set; } = "http://localhost:3001";
    public string SslCertPath { get; set; } = "../certs/localhost.pem";
    public string SslKeyPath { get; set; } = "../certs/localhost-key.pem";
}