using ButtonStatistics;
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

app.MapPost("/clicks/increment-now", async (AppDbContext db, IHubContext<ClickHub> hub) =>
{
    var index = DateTime.UtcNow.Second;

    var click = await db.Seconds.SingleAsync(c => c.Index == index);
    click.Count++;

    var total = await db.TotalClicks.SingleAsync(t => t.Id == 1);
    total.Count++;

    await db.SaveChangesAsync();

    await hub.Clients.All.SendAsync("clickUpdated", new { click.Index, click.Count });
    await hub.Clients.All.SendAsync("totalUpdated", new { count = total.Count });
    return Results.Ok();
});

app.MapGet("/seconds", async (AppDbContext db) =>
    Results.Ok(await db.Seconds.AsNoTracking().OrderBy(s => s.Index).ToListAsync()));

app.MapGet("/minutes", async (AppDbContext db) =>
    Results.Ok(await db.Minutes.AsNoTracking().OrderBy(m => m.Index).ToListAsync()));

app.MapGet("/hours", async (AppDbContext db) =>
    Results.Ok(await db.Hours.AsNoTracking().OrderBy(h => h.Index).ToListAsync()));

app.MapGet("/days", async (AppDbContext db) =>
    Results.Ok(await db.Days.AsNoTracking().OrderBy(h => h.Index).ToListAsync()));

app.MapGet("/total-clicks", async (AppDbContext db) =>
{
    var total = await db.TotalClicks.AsNoTracking().SingleAsync(t => t.Id == 1);
    return Results.Ok(new { count = total.Count });
});

app.Run();