using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ButtonStatistics.Models;

namespace ButtonStatistics.Services;

public class MailjetNotificationService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MailjetNotificationService> _logger;
    private readonly string? _apiKey;
    private readonly string? _secretKey;
    private readonly string? _fromEmail;
    private readonly string? _fromName;
    private readonly string? _toEmail;

    public MailjetNotificationService(HttpClient httpClient, IConfiguration configuration, ILogger<MailjetNotificationService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        var section = configuration.GetSection("Mailjet");
        _apiKey = section["ApiKey"];
        _secretKey = section["SecretKey"];
        _fromEmail = section["FromEmail"];
        _fromName = section["FromName"];
        _toEmail = section["ToEmail"];
    }

    public async Task SendTurnstileActivatedAsync(string clientIp, string reason, int secondCount, int minuteCount, int hourCount, bool sustainedActivity)
    {
        var subject = "Turnstile activated";
        var text = $"Turnstile activation at {DateTime.UtcNow:O}.\n\nReason: {reason}\nIP: {clientIp}\nSecond count: {secondCount}\nMinute count: {minuteCount}\nHour count: {hourCount}\nSustained activity: {sustainedActivity}";

        await SendEmailAsync(subject, text);
    }

    public async Task SendDonationRequestSubmittedAsync(DonationRequest donationRequest, string countryCode)
    {
        var subject = $"Donation request submitted for milestone {donationRequest.Milestone:N0}";
        var text = $"Donation request submitted at {DateTime.UtcNow:O}.\n\n" +
                   $"Milestone: {donationRequest.Milestone:N0}\n" +
                   $"Original milestone time (UTC): {donationRequest.DateTime:O}\n" +
                   $"Country: {countryCode}\n" +
                   $"Name: {FormatOptional(donationRequest.Name)}\n" +
                   $"Email: {FormatOptional(donationRequest.Email)}\n" +
                   $"Message/Charity: {FormatOptional(donationRequest.Message)}";

        await SendEmailAsync(subject, text);
    }

    private async Task SendEmailAsync(string subject, string text)
    {
        if (!IsConfigured())
        {
            _logger.LogWarning("Mailjet not configured. Skipping email with subject: {Subject}", subject);
            return;
        }

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.mailjet.com/v3.1/send");

            var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_apiKey}:{_secretKey}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authValue);

            var payload = new
            {
                Messages = new[]
                {
                    new
                    {
                        From = new { Email = _fromEmail, Name = _fromName },
                        To = new[] { new { Email = _toEmail} },
                        Subject = subject,
                        TextPart = text
                    }
                }
            };

            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogError("Mailjet request failed. Status: {StatusCode}, Body: {Body}", response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Mailjet email with subject: {Subject}", subject);
        }
    }

    private bool IsConfigured()
    {
        return !string.IsNullOrWhiteSpace(_apiKey)
            && !string.IsNullOrWhiteSpace(_secretKey)
            && !string.IsNullOrWhiteSpace(_fromEmail)
            && !string.IsNullOrWhiteSpace(_toEmail);
    }

    private static string FormatOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? "(not provided)" : value;
    }
}