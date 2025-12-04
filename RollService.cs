using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ButtonStatistics
{
    public sealed class RollService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHubContext<ClickHub> _hub;

        public RollService(IServiceScopeFactory scopeFactory, IHubContext<ClickHub> hub)
        {
            _scopeFactory = scopeFactory;
            _hub = hub;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var timer = new PeriodicTimer(TimeSpan.FromSeconds(1));
            //int accumulatedSeconds = 0;
            // så behöver du inte söka upp
            // aktuell minut i database en gång per secund
            // men när secondToRollIndex är 60
            // DÅ överförs de accumulerade sekunderna till aktuell minut
            // och accumulatedSeconds resetas

            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var now = DateTime.UtcNow;
                var currentSecondIndex = now.Second;
                var secondToResetIndex = (now.Second + 1) % 60; // The background service operate on the second before the current second. The increment-now api endpoint only operate in the current second. So they dont operate in the same second at the same time.
                var previousSecondIndex = (now.Second + 59) % 60;
                int currentMinuteIndex = now.Minute;
                var previousMinuteIndex = (now.Minute + 59) % 60;
                int currentHourIndex = now.Hour;

                var secondToReset = await db.Seconds.SingleAsync(s => s.Index == secondToResetIndex);
                var secondToTransfer = await db.Seconds.SingleAsync(s => s.Index == previousSecondIndex);
                var currentMinute = await db.Minutes.SingleAsync(m => m.Index == currentMinuteIndex);

                secondToReset.Count = 0;
                int secondToTransferCount = secondToTransfer.Count;

                if (currentMinuteIndex == 0 && currentSecondIndex == 0)
                {
                    var currentHour = await db.Hours.SingleAsync(h => h.Index == currentHourIndex);
                    currentHour.Count = 0;
                    
                }

                if (currentSecondIndex == 0)
                {
                    var currentHour = await db.Hours.SingleAsync(h => h.Index == currentHourIndex);
                    var minuteToTransfer = await db.Minutes.SingleAsync(m => m.Index == previousMinuteIndex); // minuteToTransfer is the previous minute

                    currentHour.Count += minuteToTransfer.Count;
                    currentMinute.Count = 0; // currentMinute.Count is reset to 0 just before it recieves the clicks from the current second.
                    
                    // Sending update of hour once a minute
                    await _hub.Clients.All.SendAsync("hourUpdated", new { index = currentHourIndex, count = currentHour!.Count }, stoppingToken);
                }

                currentMinute.Count += secondToTransferCount;

                await db.SaveChangesAsync();
                await _hub.Clients.All.SendAsync("secondReset", new { index = secondToResetIndex }, stoppingToken);
                await _hub.Clients.All.SendAsync("minuteUpdated", new { index = currentMinuteIndex, count = currentMinute.Count }, stoppingToken);
            
                // <500 clients: every-second updates are typically fine.
                // 500–5,000: consider throttling (5–10s).
                // 5,000: push once per minute or use a streaming/aggregation layer.
                // You can also batch minute updates and send only when the value changes (skip sending if count didn’t change).
                
            }
        }
    }
}



