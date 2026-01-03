using ButtonStatistics;
using ButtonStatistics.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var env = builder.Environment;

builder.Services.AddDbContextPool<AppDbContext>(options =>
{
    if (env.IsDevelopment())
    {
        options.UseSqlite(builder.Configuration.GetConnectionString("SqliteConnection") ?? "Data Source=clicks.db");
    }
    else
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServerConnection"));
    }
});

builder.Services.AddCors(options =>
        {
            options.AddPolicy(
                "AllowFrontend",
                policy =>
                    policy.WithOrigins("http://localhost:5173", "https://buttonstatistics-e7etafeueza8hhgt.swedencentral-01.azurewebsites.net")
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
            );
        });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR().AddJsonProtocol(o => { o.PayloadSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull; }); // The JsonProtocol thing reduces signal payload when any property is null, it will not send the null properties. However I'm not really sure what consequences not sending null properties might have.
builder.Services.AddHostedService<RollService>();

var app = builder.Build();

// Apply pending migrations on startup (both local and Azure) den här behöver kontrolleras om den ens funkar... uppdatera via consolen annars och ta bort detta 
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        Console.WriteLine("Migrations applied (or already up to date).");
    }
    catch (Exception ex)
    {
        // Log to console so Azure Log Stream shows it.
        Console.WriteLine("Error applying migrations: " + ex);
        throw;
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("AllowFrontend");

app.MapHub<ClickHub>("/hubs/clicks");

app.MapPost("/clicks/increment-now", async (AppDbContext db, IHubContext<ClickHub> hub, IncrementNowRequest req) =>
{
    var secondIndex = DateTime.UtcNow.Second;

    await using var tx = await db.Database.BeginTransactionAsync();

    await db.Database.ExecuteSqlRawAsync("UPDATE Seconds SET Count = Count + 1 WHERE [Index] = {0}", secondIndex);
    await db.Database.ExecuteSqlRawAsync("UPDATE TotalClicks SET Count = Count + 1 WHERE Id = 1");
    await db.Database.ExecuteSqlRawAsync("UPDATE LocalHours SET Count = Count + 1 WHERE [Index] = {0}", req.LocalHour); // lägga samma if-sats här som för localweek day och month? Se om denna krashar först.

    if (req.LocalWeekday is int lw && lw >= 0 && lw <= 6) // what happens here if it is not an int?
        await db.Database.ExecuteSqlRawAsync("UPDATE LocalWeekdays SET Count = Count + 1 WHERE [Index] = {0}", lw);

    if (req.LocalMonth is int lm && lm >= 0 && lm <= 11)
        await db.Database.ExecuteSqlRawAsync("UPDATE LocalMonths SET Count = Count + 1 WHERE [Index] = {0}", lm);

    var secondCount = await db.Seconds.AsNoTracking().Where(s => s.Index == secondIndex).Select(s => s.Count).SingleAsync();
    var totalCount = await db.TotalClicks.AsNoTracking().Where(t => t.Id == 1).Select(t => t.Count).SingleAsync();
    var localHourCount = await db.LocalHours.AsNoTracking().Where(h => h.Index == req.LocalHour).Select(h => h.Count).SingleAsync();

    int? localWeekdayCount = null;
    if (req.LocalWeekday is int lw2 && lw2 >= 0 && lw2 <= 6)
        localWeekdayCount = await db.LocalWeekdays.AsNoTracking().Where(w => w.Index == lw2).Select(w => w.Count).SingleAsync();

    int? localMonthCount = null;
    if (req.LocalMonth is int lm2 && lm2 >= 0 && lm2 <= 11)
        localMonthCount = await db.LocalMonths.AsNoTracking().Where(m => m.Index == lm2).Select(m => m.Count).SingleAsync();

    await tx.CommitAsync();

    // This is one batch of signals. Instead of sending five.
    await hub.Clients.All.SendAsync("statsUpdated", new
    {
        second = new { index = secondIndex, count = secondCount },
        total = totalCount,
        localHour = new { index = req.LocalHour, count = localHourCount },
        localWeekday = (req.LocalWeekday is int lwb) ? new { index = lwb, count = localWeekdayCount } : null, // this is the third time checking if it is an int... do we need that many checks? Can not somehow the first one be sufficient?
        localMonth = (req.LocalMonth is int lmb) ? new { index = lmb, count = localMonthCount } : null
    });

    const int milestone = 4540;

    return Results.Ok(new
    {
        milestoneHit = totalCount == milestone,
        milestone,
        total = totalCount
    });






    // Detta är den gammla less efficient code
    // Den nya ska vara bättre för att:
    // Fewer DB round-trips: no entity loads or SaveChanges tracking. You skip “SELECT row → mutate in memory → UPDATE,” and just do “UPDATE Count = Count + 1.”
    // Less EF overhead: no change tracker, no entity materialization, less GC pressure per click.
    // Shorter write locks: a single UPDATE holds the lock for a much shorter time than read-modify-write, so concurrent clicks contend less. This keeps latency tight and SignalR messages flowing.
    // No lost updates: avoids read-modify-write races under bursty clicks, so counts stay correct without retries or conflicts.
    // Predictable per-click latency: faster server turnaround means charts update sooner, reducing UI stutter.
    // Wrap the UPDATEs + reads in one transaction (commit before broadcasting).
    // Use AsNoTracking for the read-backs.
    // Jag behåller den gamla koden för att den är motsvarig och jag förstår den bättre
    // Så att när jag undrar över något i den nya koden
    // Kan jag titta i den gamla koden och hitta dess motsvarighet

    // var click = await db.Seconds.SingleAsync(c => c.Index == index);
    // click.Count++;

    // var total = await db.TotalClicks.SingleAsync(t => t.Id == 1);
    // total.Count++;

    // // lägga samma if-sats här som för localweek day och month? Se om denna krashar först.
    // var localHour = await db.LocalHours.SingleAsync(h => h.Index == req.LocalHour);
    // localHour.Count++;

    // if (req.LocalWeekday is int lw && lw >= 0 && lw <= 6)
    // {
    //     var weekday = await db.LocalWeekdays.SingleAsync(w => w.Index == lw);
    //     weekday.Count++;
    //     await hub.Clients.All.SendAsync("localWeekdayUpdated", new { index = lw, count = weekday.Count });
    // }

    // if (req.LocalMonth is int lm && lm >= 0 && lm <= 11)
    // {
    //     var month = await db.LocalMonths.SingleAsync(m => m.Index == lm);
    //     month.Count++;
    //     await hub.Clients.All.SendAsync("localMonthUpdated", new { index = lm, count = month.Count });
    // }

    // await db.SaveChangesAsync();

    // await hub.Clients.All.SendAsync("clickUpdated", new { click.Index, click.Count });
    // await hub.Clients.All.SendAsync("totalUpdated", new { count = total.Count });
    // await hub.Clients.All.SendAsync("localHourUpdated", new { index = req.LocalHour, count = localHour.Count });
    // return Results.Ok();
});

app.MapGet("/seconds", async (AppDbContext db) =>
    Results.Ok(await db.Seconds.AsNoTracking().OrderBy(s => s.Index).ToListAsync()));

app.MapGet("/minutes", async (AppDbContext db) =>
    Results.Ok(await db.Minutes.AsNoTracking().OrderBy(m => m.Index).ToListAsync()));

app.MapGet("/hours", async (AppDbContext db) =>
    Results.Ok(await db.Hours.AsNoTracking().OrderBy(h => h.Index).ToListAsync()));

app.MapGet("/days", async (AppDbContext db) =>
    Results.Ok(await db.Days.AsNoTracking().OrderBy(d => d.Index).ToListAsync()));

app.MapGet("/months", async (AppDbContext db) =>
    Results.Ok(await db.Months.AsNoTracking().OrderBy(m => m.Index).ToListAsync()));

app.MapGet("/years", async (AppDbContext db) =>
    Results.Ok(await db.Years.AsNoTracking().OrderBy(y => y.Index).ToListAsync()));

app.MapGet("/local-hours", async (AppDbContext db) =>
    Results.Ok(await db.LocalHours.AsNoTracking().OrderBy(lh => lh.Index).ToListAsync()));

app.MapGet("/local-weekdays", async (AppDbContext db) =>
    Results.Ok(await db.LocalWeekdays.AsNoTracking().OrderBy(w => w.Index).ToListAsync()));

app.MapGet("/local-months", async (AppDbContext db) =>
    Results.Ok(await db.LocalMonths.AsNoTracking().OrderBy(m => m.Index).ToListAsync()));

app.MapGet("/total-clicks", async (AppDbContext db) =>
{
    var total = await db.TotalClicks.AsNoTracking().SingleAsync(t => t.Id == 1);
    return Results.Ok(new { count = total.Count });
});

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/debug/minutes", async (AppDbContext db) =>
{
    // Try to load some data, and serialize what you see
    var list = await db.Minutes.AsNoTracking().OrderBy(m => m.Index).ToListAsync();
    return Results.Ok(list.Select(m => new { m.Index, m.Count }));
});

app.MapFallbackToFile("index.html");

app.Run();