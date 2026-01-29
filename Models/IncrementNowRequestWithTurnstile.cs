namespace ButtonStatistics.Models;

public record IncrementNowRequestWithTurnstile(
    int LocalHour,
    int LocalWeekday,
    int LocalMonth,
    string? TurnstileToken,
    bool? IsTrusted);
