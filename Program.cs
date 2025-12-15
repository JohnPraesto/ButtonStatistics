using ButtonStatistics;
using ButtonStatistics.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContextPool<AppDbContext>(options => options.UseSqlite("Data Source=clicks.db"));
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddHostedService<RollService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();

app.MapHub<ClickHub>("/hubs/clicks");

app.MapPost("/clicks/increment-now", async (AppDbContext db, IHubContext<ClickHub> hub, IncrementNowRequest req) =>
{
    var index = DateTime.UtcNow.Second;

    var click = await db.Seconds.SingleAsync(c => c.Index == index);
    click.Count++;

    var total = await db.TotalClicks.SingleAsync(t => t.Id == 1);
    total.Count++;

    var localHour = await db.LocalHours.SingleAsync(h => h.Index == req.LocalHour);
    localHour.Count++;

    // if (req.LocalWeekday is int lw && lw >= 0 && lw <= 6)
    // {
    //     var weekday = await db.LocalWeekdays.SingleAsync(w => w.Index == lw);
    //     weekday.Count++;
    //     await hub.Clients.All.SendAsync("localWeekdayUpdated", new { index = lw, count = weekday.Count });
    // }

    var weekday = await db.LocalWeekdays.SingleAsync(w => w.Index == req.LocalWeekday);
    weekday.Count++;


    await db.SaveChangesAsync();

    await hub.Clients.All.SendAsync("clickUpdated", new { click.Index, click.Count });
    await hub.Clients.All.SendAsync("totalUpdated", new { count = total.Count });
    await hub.Clients.All.SendAsync("localHourUpdated", new { index = req.LocalHour, count = localHour.Count });
        await hub.Clients.All.SendAsync("localWeekdayUpdated", new { index = req.LocalWeekday, count = weekday.Count });
    return Results.Ok();
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

app.MapGet("/total-clicks", async (AppDbContext db) =>
{
    var total = await db.TotalClicks.AsNoTracking().SingleAsync(t => t.Id == 1);
    return Results.Ok(new { count = total.Count });
});

app.Run();