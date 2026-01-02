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
                var previousSecondIndex = (now.Second + 59) % 60; // Example: 14 + 59 % 60 = 73 & 60 = 13 (the current second is 14, the previous second was 13)
                int currentMinuteIndex = now.Minute;
                var previousMinuteIndex = (now.Minute + 59) % 60;
                int currentHourIndex = now.Hour;
                int previousHourIndex = (now.Hour + 23) % 24; // Example 3 + 23 % 24 = 26 % 24 = 2
                int currentDayIndex = now.Day; // Days start at 1 (not 0, like seconds and minutes)
                int previousDayIndex = now.AddDays(-1).Day;
                int currentMonthIndex = now.Month; // Months also start at 1
                int previousMonthIndex = now.AddMonths(-1).Month;
                int currentYearIndex = now.Year;
                // These are set every second. High load every second then?
                // Is it not better to set the dates within each roll over?
                // You need only know what year it is if you're gonna use the year index...
                // ... which is once a month.

                var secondToReset = await db.Seconds.SingleAsync(s => s.Index == secondToResetIndex);
                var secondToTransfer = await db.Seconds.AsNoTracking().SingleAsync(s => s.Index == previousSecondIndex);
                var currentMinute = await db.Minutes.SingleAsync(m => m.Index == currentMinuteIndex);

                secondToReset.Count = 0;
                int secondToTransferCount = secondToTransfer.Count;

                // Once a minute
                if (currentSecondIndex == 0)
                {
                    var minuteToTransfer = await db.Minutes.AsNoTracking().SingleAsync(m => m.Index == previousMinuteIndex); // minuteToTransfer is the previous minute

                    // If the previous minute is the last minute of the hour (index 59).
                    // It means that it is now a new hour and the current minute is the 1st of the new hour.
                    // Then the previous minute count can not be added to the current hour.
                    // It has to be added to the previous hour.
                    if (currentMinuteIndex == 0) // Kan rationaliseras bort. Genom att lägga till && minuteToTransfer.Count != 0. Alltså, den behöver inte göra några databasanrop eller SinglaR signaler om det inte finns några counts att adda.
                    {
                        var previousHour = await db.Hours.SingleAsync(h => h.Index == previousHourIndex);
                        previousHour.Count += minuteToTransfer.Count;
                        await _hub.Clients.All.SendAsync("hourUpdated", new { index = previousHourIndex, count = previousHour!.Count }, stoppingToken);
                    }
                    else
                    {
                        var currentHour = await db.Hours.SingleAsync(h => h.Index == currentHourIndex);
                        currentHour.Count += minuteToTransfer.Count;
                        await _hub.Clients.All.SendAsync("hourUpdated", new { index = currentHourIndex, count = currentHour!.Count }, stoppingToken);
                    }

                    currentMinute.Count = 0; // currentMinute.Count is reset to 0 just before it recieves the clicks from the current second.
                }

                // Once an hour
                if (currentMinuteIndex == 0 && currentSecondIndex == 0)
                {
                    var hourToTransfer = await db.Hours.AsNoTracking().SingleAsync(h => h.Index == previousHourIndex);

                    if (currentHourIndex == 0)
                    {
                        var previousDay = await db.Days.SingleAsync(h => h.Index == previousDayIndex);
                        previousDay.Count += hourToTransfer.Count;
                        await _hub.Clients.All.SendAsync("dayUpdated", new { index = previousDayIndex, count = previousDay!.Count }, stoppingToken);
                    }
                    else
                    {
                        var currentDay = await db.Days.SingleAsync(h => h.Index == currentDayIndex);
                        currentDay.Count += hourToTransfer.Count;
                        await _hub.Clients.All.SendAsync("dayUpdated", new { index = currentDayIndex, count = currentDay!.Count }, stoppingToken);
                    }

                    var currentHour = await db.Hours.SingleAsync(h => h.Index == currentHourIndex);
                    currentHour.Count = 0;
                }

                // Once a day
                if (currentHourIndex == 0 && currentMinuteIndex == 0 && currentSecondIndex == 0)
                {
                    var dayToTransfer = await db.Days.AsNoTracking().SingleAsync(m => m.Index == previousDayIndex); // .AsNoTracking() här? för att denna är read only och behöver inte trackas av EF. Stämmer detta?

                    if (currentDayIndex == 1)
                    {
                        var previousMonth = await db.Months.SingleAsync(m => m.Index == previousMonthIndex); // inte .AsNoTracking() här? för att denna ska uppdateras och trackas ac EF
                        previousMonth.Count += dayToTransfer.Count;
                        await _hub.Clients.All.SendAsync("monthUpdated", new { index = previousMonthIndex, count = previousMonth!.Count }, stoppingToken);
                    }
                    else
                    {
                        var currentMonth = await db.Months.SingleAsync(m => m.Index == currentMonthIndex);
                        currentMonth.Count += dayToTransfer.Count;
                        await _hub.Clients.All.SendAsync("monthUpdated", new { index = currentMonthIndex, count = currentMonth!.Count }, stoppingToken);
                    }

                    var currentDay = await db.Days.SingleAsync(d => d.Index == currentDayIndex);
                    currentDay.Count = 0;
                }

                // Once a month
                if (currentDayIndex == 1 && currentHourIndex == 0 && currentMinuteIndex == 0 && currentSecondIndex == 0)
                {
                    var monthToTransfer = await db.Months.AsNoTracking().SingleAsync(m => m.Index == previousMonthIndex);

                    if (currentMonthIndex == 1)
                    {
                        var previousYear = await db.Years.SingleAsync(h => h.Index == currentYearIndex - 1);
                        previousYear.Count += monthToTransfer.Count;
                        await _hub.Clients.All.SendAsync("yearUpdated", new { index = currentYearIndex - 1, count = previousYear!.Count }, stoppingToken);
                    }
                    else
                    {
                        var currentYear = await db.Years.SingleAsync(h => h.Index == currentYearIndex);
                        currentYear.Count += monthToTransfer.Count;
                        await _hub.Clients.All.SendAsync("yearUpdated", new { index = currentYearIndex, count = currentYear!.Count }, stoppingToken);
                    }

                    var currentMonth = await db.Months.SingleAsync(h => h.Index == currentMonthIndex);
                    currentMonth.Count = 0;
                }

                currentMinute.Count += secondToTransferCount;

                await db.SaveChangesAsync();

                await _hub.Clients.All.SendAsync("secondReset", new { index = secondToResetIndex }, stoppingToken);
                if (currentSecondIndex == 0 || secondToTransferCount > 0) // minuteUpdated signal wont send unless there actually has been seconds transfered to the minute
                    await _hub.Clients.All.SendAsync("minuteUpdated", new { index = currentMinuteIndex, count = currentMinute.Count }, stoppingToken);

                // <500 clients: every-second updates are typically fine.
                // 500–5,000: consider throttling (5–10s).
                // 5,000: push once per minute or use a streaming/aggregation layer.
                // You can also batch minute updates and send only when the value changes (skip sending if count didn’t change).

            }
        }
    }
}



