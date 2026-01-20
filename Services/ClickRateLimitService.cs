using System.Collections.Concurrent;

namespace ButtonStatistics.Services;

/// <summary>
/// Tracks click counts per IP to determine when Turnstile verification is required.
/// Thresholds:
/// - 15 clicks/second triggers Turnstile (matches the rate limiter)
/// - 500 clicks/minute triggers Turnstile
/// - 15,000 clicks/hour triggers Turnstile  
/// - 2+ hours of continuous clicking triggers Turnstile (catches slow bots)
/// </summary>
public class ClickRateLimitService
{
    private const int SecondThreshold = 15; // Same as the rate limiter in Program.cs
    private const int MinuteThreshold = 500;
    private const int HourThreshold = 15_000;
    private static readonly TimeSpan SustainedActivityThreshold = TimeSpan.FromHours(2);
    private static readonly TimeSpan SessionGapThreshold = TimeSpan.FromMinutes(30); // Gap that resets session

    private readonly ConcurrentDictionary<string, ClickTracker> _trackers = new();
    private readonly Timer _cleanupTimer;

    public ClickRateLimitService()
    {
        // Clean up old entries every 5 minutes
        _cleanupTimer = new Timer(CleanupOldEntries, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
    }

    /// <summary>
    /// Records a click for the given IP and returns whether Turnstile is now required.
    /// </summary>
    public (bool requiresTurnstile, int secondCount, int minuteCount, int hourCount, bool sustainedActivity) RecordClick(string clientIp)
    {
        var now = DateTime.UtcNow;
        var tracker = _trackers.GetOrAdd(clientIp, _ => new ClickTracker(now));
        
        lock (tracker)
        {
            // Check if session should reset (gap > 30 minutes = user took a break)
            if (tracker.LastClickTime.HasValue && (now - tracker.LastClickTime.Value) > SessionGapThreshold)
            {
                tracker.ResetSession(now);
            }
            
            tracker.RecordClick(now);
            
            var secondCount = tracker.GetSecondCount(now);
            var minuteCount = tracker.GetMinuteCount(now);
            var hourCount = tracker.GetHourCount(now);
            var sustainedActivity = tracker.IsSustainedActivity(now, SustainedActivityThreshold);
            
            var requiresTurnstile = secondCount >= SecondThreshold
                                 || minuteCount >= MinuteThreshold 
                                 || hourCount >= HourThreshold 
                                 || sustainedActivity;
            
            return (requiresTurnstile, secondCount, minuteCount, hourCount, sustainedActivity);
        }
    }

    /// <summary>
    /// Checks if Turnstile is required for the given IP without recording a click.
    /// </summary>
    public (bool requiresTurnstile, int secondCount, int minuteCount, int hourCount, bool sustainedActivity) CheckStatus(string clientIp)
    {
        var now = DateTime.UtcNow;
        
        if (!_trackers.TryGetValue(clientIp, out var tracker))
            return (false, 0, 0, 0, false);
        
        lock (tracker)
        {
            var secondCount = tracker.GetSecondCount(now);
            var minuteCount = tracker.GetMinuteCount(now);
            var hourCount = tracker.GetHourCount(now);
            var sustainedActivity = tracker.IsSustainedActivity(now, SustainedActivityThreshold);
            
            var requiresTurnstile = secondCount >= SecondThreshold
                                 || minuteCount >= MinuteThreshold 
                                 || hourCount >= HourThreshold 
                                 || sustainedActivity;
            
            return (requiresTurnstile, secondCount, minuteCount, hourCount, sustainedActivity);
        }
    }

    /// <summary>
    /// Resets the click count for a client after successful Turnstile verification.
    /// This gives them a fresh start.
    /// </summary>
    public void ResetAfterVerification(string clientIp)
    {
        _trackers.TryRemove(clientIp, out _);
    }

    private void CleanupOldEntries(object? state)
    {
        var now = DateTime.UtcNow;
        var cutoff = now.AddHours(-12);
        
        foreach (var kvp in _trackers)
        {
            var tracker = kvp.Value;
            lock (tracker)
            {
                // Remove if no activity in the last 12 hours
                if (!tracker.LastClickTime.HasValue || tracker.LastClickTime.Value < cutoff)
                {
                    _trackers.TryRemove(kvp.Key, out _);
                }
            }
        }
    }

    private class ClickTracker
    {
        // For second/minute/hour rate limiting - use sliding window counters (O(1) space)
        private int _secondCount;
        private int _minuteCount;
        private int _hourCount;
        private DateTime _secondWindowStart;
        private DateTime _minuteWindowStart;
        private DateTime _hourWindowStart;
        
        // For sustained activity detection
        public DateTime SessionStartTime { get; private set; }
        public DateTime? LastClickTime { get; private set; }
        public int SessionClickCount { get; private set; }

        public ClickTracker(DateTime now)
        {
            SessionStartTime = now;
            _secondWindowStart = now;
            _minuteWindowStart = now;
            _hourWindowStart = now;
            _secondCount = 0;
            _minuteCount = 0;
            _hourCount = 0;
            SessionClickCount = 0;
        }

        public void RecordClick(DateTime now)
        {
            // Slide the second window if needed
            if ((now - _secondWindowStart).TotalSeconds >= 1)
            {
                _secondWindowStart = now;
                _secondCount = 0;
            }
            _secondCount++;
            
            // Slide the minute window if needed
            if ((now - _minuteWindowStart).TotalMinutes >= 1)
            {
                _minuteWindowStart = now;
                _minuteCount = 0;
            }
            _minuteCount++;
            
            // Slide the hour window if needed
            if ((now - _hourWindowStart).TotalHours >= 1)
            {
                _hourWindowStart = now;
                _hourCount = 0;
            }
            _hourCount++;
            
            LastClickTime = now;
            SessionClickCount++;
        }

        public int GetSecondCount(DateTime now)
        {
            // If the window has expired, return 0
            if ((now - _secondWindowStart).TotalSeconds >= 1)
                return 0;
            return _secondCount;
        }

        public int GetMinuteCount(DateTime now)
        {
            // If the window has expired, return 0
            if ((now - _minuteWindowStart).TotalMinutes >= 1)
                return 0;
            return _minuteCount;
        }

        public int GetHourCount(DateTime now)
        {
            // If the window has expired, return 0
            if ((now - _hourWindowStart).TotalHours >= 1)
                return 0;
            return _hourCount;
        }

        public bool IsSustainedActivity(DateTime now, TimeSpan threshold)
        {
            // Session duration exceeds threshold
            var sessionDuration = now - SessionStartTime;
            return sessionDuration >= threshold;
        }

        public void ResetSession(DateTime now)
        {
            SessionStartTime = now;
            SessionClickCount = 0;
            // Keep rate limit counters - they'll naturally slide
        }
    }
}
