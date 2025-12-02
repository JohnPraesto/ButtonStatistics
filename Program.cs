using ButtonStatistics;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite("Data Source=clicks.db"));
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

    click.Count = click.Count + 1;

    await db.SaveChangesAsync();

    await hub.Clients.All.SendAsync("clickUpdated", new { click.Index, click.Count });
    return Results.Ok();
});

app.MapGet("/seconds", async (AppDbContext db) =>
    Results.Ok(await db.Seconds.AsNoTracking().ToListAsync()));

app.MapGet("/minutes", async (AppDbContext db) =>
    Results.Ok(await db.Minutes.AsNoTracking().ToListAsync()));

app.MapGet("/hours", async (AppDbContext db) =>
    Results.Ok(await db.Hours.AsNoTracking().ToListAsync()));

app.Run();