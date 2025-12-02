using Microsoft.AspNetCore.SignalR;

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
                var secondToResetIndex = now.Second + 1; // The background service operate on the second before the current second. The increment-now api endpoint only operate in the current second. So they dont operate in the same second at the same time.
                int minuteToRecieveIndex = now.Minute;

                if (secondToResetIndex == 60) secondToResetIndex = 0;
                var secondToReset = db.Seconds.Single(s => s.Index == secondToResetIndex);
                secondToReset.Count = 0;

                var previousSecondIndex = (now.Second + 59) % 60;
                var secondToTransfer = db.Seconds.Single(s => s.Index == previousSecondIndex);
                int secondToTransferCount = secondToTransfer.Count;

                if (now.Second == 0)
                {
                    int hourToRecieveIndex = now.Hour;
                    var hourToRecieve = db.Hours.Single(h => h.Index == hourToRecieveIndex);

                    var previousMinuteIndex = (now.Minute + 59) % 60;
                    var minuteToTransfer = db.Minutes.Single(m => m.Index == previousMinuteIndex); // minuteToTransfer is the previous minute
                    hourToRecieve.Count += minuteToTransfer.Count;

                    var minuteToReset = db.Minutes.Single(m => m.Index == minuteToRecieveIndex); // minuteToReset is the current minute. Its count is reset to 0 just before it recieves the clicks from the current second.
                    minuteToReset.Count = 0;
                }

                var currentMinute = db.Minutes.Single(m => m.Index == minuteToRecieveIndex);
                currentMinute.Count += secondToTransferCount;

                if (minuteToRecieveIndex == 0 && now.Second == 0)
                {
                    int hourToRollIndex = now.Hour;
                    var hourToRoll = db.Hours.Single(h => h.Index == hourToRollIndex);
                    hourToRoll.Count = 0;
                }

                await db.SaveChangesAsync();

                // await _hub.Clients.All.SendAsync("secondRolled", new { completedSecondIndex, minute }, stoppingToken);
                // should not all clients be updated here?
                // intead of that updates comes from the increment-now endpoint?
                // and does that endpoint only update when the endpoint is called?

            }
        }
    }
}



