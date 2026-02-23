using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data;
using System.Data.Common;

namespace ButtonStatistics
{
    public sealed class RollService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHubContext<ClickHub> _hub;
        private readonly ILogger<RollService> _logger;
        private const string TickSql = @"
UPDATE Seconds
SET Count = 0
WHERE [Index] = @secondToResetIndex;

UPDATE Minutes
SET Count = CASE WHEN @isMinuteBoundary = 1 THEN 0 ELSE Count END
WHERE [Index] = @currentMinuteIndex;

UPDATE Hours
SET Count = Count + (SELECT Count FROM Minutes WHERE [Index] = @previousMinuteIndex)
WHERE @isMinuteBoundary = 1 AND [Index] = @hourTransferTargetIndex;

UPDATE Days
SET Count = Count + (SELECT Count FROM Hours WHERE [Index] = @previousHourIndex)
WHERE @isHourBoundary = 1 AND [Index] = @dayTransferTargetIndex;

UPDATE Hours
SET Count = 0
WHERE @isHourBoundary = 1 AND [Index] = @currentHourIndex;

UPDATE Months
SET Count = Count + (SELECT Count FROM Days WHERE [Index] = @previousDayIndex)
WHERE @isDayBoundary = 1 AND [Index] = @monthTransferTargetIndex;

UPDATE Days
SET Count = 0
WHERE @isDayBoundary = 1 AND [Index] = @currentDayIndex;

UPDATE Years
SET Count = Count + (SELECT Count FROM Months WHERE [Index] = @previousMonthIndex)
WHERE @isMonthBoundary = 1 AND [Index] = @yearTransferTargetIndex;

UPDATE Months
SET Count = 0
WHERE @isMonthBoundary = 1 AND [Index] = @currentMonthIndex;

UPDATE Minutes
SET Count = Count + (SELECT Count FROM Seconds WHERE [Index] = @previousSecondIndex)
WHERE [Index] = @currentMinuteIndex;

SELECT
    (SELECT Count FROM Seconds WHERE [Index] = @previousSecondIndex) AS SecondToTransferCount,
    (SELECT Count FROM Minutes WHERE [Index] = @currentMinuteIndex) AS CurrentMinuteCount,
    CASE WHEN @isMinuteBoundary = 1 THEN (SELECT Count FROM Hours WHERE [Index] = @hourTransferTargetIndex) ELSE NULL END AS HourUpdatedCount,
    CASE WHEN @isHourBoundary = 1 THEN (SELECT Count FROM Days WHERE [Index] = @dayTransferTargetIndex) ELSE NULL END AS DayUpdatedCount,
    CASE WHEN @isDayBoundary = 1 THEN (SELECT Count FROM Months WHERE [Index] = @monthTransferTargetIndex) ELSE NULL END AS MonthUpdatedCount,
    CASE WHEN @isMonthBoundary = 1 THEN (SELECT Count FROM Years WHERE [Index] = @yearTransferTargetIndex) ELSE NULL END AS YearUpdatedCount;";

        public RollService(IServiceScopeFactory scopeFactory, IHubContext<ClickHub> hub, ILogger<RollService> logger)
        {
            _scopeFactory = scopeFactory;
            _hub = hub;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var timer = new PeriodicTimer(TimeSpan.FromSeconds(1));

            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
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
                var isMinuteBoundary = currentSecondIndex == 0;
                var isHourBoundary = currentMinuteIndex == 0 && isMinuteBoundary;
                var isDayBoundary = currentHourIndex == 0 && isHourBoundary;
                var isMonthBoundary = currentDayIndex == 1 && isDayBoundary;

                var hourTransferTargetIndex = currentMinuteIndex == 0 ? previousHourIndex : currentHourIndex;
                var dayTransferTargetIndex = currentHourIndex == 0 ? previousDayIndex : currentDayIndex;
                var monthTransferTargetIndex = currentDayIndex == 1 ? previousMonthIndex : currentMonthIndex;
                var yearTransferTargetIndex = currentMonthIndex == 1 ? currentYearIndex - 1 : currentYearIndex;

                await using var tx = await db.Database.BeginTransactionAsync(stoppingToken);
                var conn = db.Database.GetDbConnection();
                if (conn.State != ConnectionState.Open)
                    await conn.OpenAsync(stoppingToken);

                await using var cmd = conn.CreateCommand();
                cmd.Transaction = db.Database.CurrentTransaction?.GetDbTransaction();
                cmd.CommandText = TickSql;

                AddParameter(cmd, "@secondToResetIndex", secondToResetIndex);
                AddParameter(cmd, "@previousSecondIndex", previousSecondIndex);
                AddParameter(cmd, "@currentMinuteIndex", currentMinuteIndex);
                AddParameter(cmd, "@previousMinuteIndex", previousMinuteIndex);
                AddParameter(cmd, "@currentHourIndex", currentHourIndex);
                AddParameter(cmd, "@previousHourIndex", previousHourIndex);
                AddParameter(cmd, "@currentDayIndex", currentDayIndex);
                AddParameter(cmd, "@previousDayIndex", previousDayIndex);
                AddParameter(cmd, "@currentMonthIndex", currentMonthIndex);
                AddParameter(cmd, "@previousMonthIndex", previousMonthIndex);
                AddParameter(cmd, "@hourTransferTargetIndex", hourTransferTargetIndex);
                AddParameter(cmd, "@dayTransferTargetIndex", dayTransferTargetIndex);
                AddParameter(cmd, "@monthTransferTargetIndex", monthTransferTargetIndex);
                AddParameter(cmd, "@yearTransferTargetIndex", yearTransferTargetIndex);
                AddParameter(cmd, "@isMinuteBoundary", isMinuteBoundary ? 1 : 0);
                AddParameter(cmd, "@isHourBoundary", isHourBoundary ? 1 : 0);
                AddParameter(cmd, "@isDayBoundary", isDayBoundary ? 1 : 0);
                AddParameter(cmd, "@isMonthBoundary", isMonthBoundary ? 1 : 0);

                    await using var reader = await cmd.ExecuteReaderAsync(stoppingToken);
                    await EnsureReaderOnDataRowAsync(reader, stoppingToken);

                    var secondToTransferCount = reader.GetInt32(0);
                    var currentMinuteCount = reader.GetInt32(1);
                    int? hourUpdatedCount = reader.IsDBNull(2) ? null : reader.GetInt32(2);
                    int? dayUpdatedCount = reader.IsDBNull(3) ? null : reader.GetInt32(3);
                    int? monthUpdatedCount = reader.IsDBNull(4) ? null : reader.GetInt32(4);
                    int? yearUpdatedCount = reader.IsDBNull(5) ? null : reader.GetInt32(5);

                    await reader.CloseAsync();

                    await tx.CommitAsync(stoppingToken);

                    await _hub.Clients.All.SendAsync("secondReset", new { index = secondToResetIndex }, stoppingToken);

                    if (isMinuteBoundary || secondToTransferCount > 0)
                    {
                        await _hub.Clients.All.SendAsync("minuteUpdated", new { index = currentMinuteIndex, count = currentMinuteCount }, stoppingToken);
                    }

                    if (isMinuteBoundary && hourUpdatedCount.HasValue)
                    {
                        await _hub.Clients.All.SendAsync("hourUpdated", new { index = hourTransferTargetIndex, count = hourUpdatedCount.Value }, stoppingToken);
                    }

                    if (isHourBoundary && dayUpdatedCount.HasValue)
                    {
                        await _hub.Clients.All.SendAsync("dayUpdated", new { index = dayTransferTargetIndex, count = dayUpdatedCount.Value }, stoppingToken);
                    }

                    if (isDayBoundary && monthUpdatedCount.HasValue)
                    {
                        await _hub.Clients.All.SendAsync("monthUpdated", new { index = monthTransferTargetIndex, count = monthUpdatedCount.Value }, stoppingToken);
                    }

                    if (isMonthBoundary && yearUpdatedCount.HasValue)
                    {
                        await _hub.Clients.All.SendAsync("yearUpdated", new { index = yearTransferTargetIndex, count = yearUpdatedCount.Value }, stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "RollService tick failed; continuing to next tick.");
                }

            }
        }

        private static async Task EnsureReaderOnDataRowAsync(DbDataReader reader, CancellationToken cancellationToken)
        {
            if (reader.FieldCount > 0 && await reader.ReadAsync(cancellationToken))
            {
                return;
            }

            while (await reader.NextResultAsync(cancellationToken))
            {
                if (reader.FieldCount > 0 && await reader.ReadAsync(cancellationToken))
                {
                    return;
                }
            }

            throw new InvalidOperationException("RollService SQL batch did not return a data row.");
        }

        private static void AddParameter(System.Data.Common.DbCommand cmd, string name, object value)
        {
            var parameter = cmd.CreateParameter();
            parameter.ParameterName = name;
            parameter.Value = value;
            cmd.Parameters.Add(parameter);
        }
    }
}



