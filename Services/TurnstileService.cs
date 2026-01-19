using System.Text.Json;

namespace ButtonStatistics.Services;

public class TurnstileService
{
    private readonly HttpClient _httpClient;
    private readonly string _secretKey;
    private readonly ILogger<TurnstileService> _logger;

    public TurnstileService(HttpClient httpClient, IConfiguration configuration, ILogger<TurnstileService> logger)
    {
        _httpClient = httpClient;
        _secretKey = configuration["Turnstile:SecretKey"] ?? throw new InvalidOperationException("Turnstile:SecretKey is not configured");
        _logger = logger;
    }

    public async Task<bool> VerifyTokenAsync(string token, string? remoteIp)
    {
        if (string.IsNullOrWhiteSpace(token))
            return false;

        try
        {
            var formContent = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["secret"] = _secretKey,
                ["response"] = token,
                ["remoteip"] = remoteIp ?? ""
            });

            var response = await _httpClient.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify", formContent);
            var json = await response.Content.ReadAsStringAsync();
            
            using var doc = JsonDocument.Parse(json);
            var success = doc.RootElement.TryGetProperty("success", out var successProp) && successProp.GetBoolean();
            
            if (!success)
            {
                _logger.LogWarning("Turnstile verification failed: {Response}", json);
            }
            
            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying Turnstile token");
            return false;
        }
    }
}
