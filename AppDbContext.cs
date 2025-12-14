using ButtonStatistics.Models;
using Microsoft.EntityFrameworkCore;

namespace ButtonStatistics
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Second> Seconds { get; set; }
        public DbSet<Minute> Minutes { get; set; }
        public DbSet<Hour> Hours { get; set; }
        public DbSet<Day> Days { get; set; }
        public DbSet<Month> Months { get; set; }
        public DbSet<Year> Years { get; set; }
        public DbSet<TotalClicks> TotalClicks { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Second>().HasKey(c => c.Index);
            builder.Entity<Second>().Property(c => c.Index).ValueGeneratedNever();
            builder.Entity<Minute>().HasKey(c => c.Index);
            builder.Entity<Minute>().Property(c => c.Index).ValueGeneratedNever();
            builder.Entity<Hour>().HasKey(c => c.Index);
            builder.Entity<Hour>().Property(c => c.Index).ValueGeneratedNever();
            builder.Entity<Day>().HasKey(c => c.Index);
            builder.Entity<Day>().Property(c => c.Index).ValueGeneratedNever();
            builder.Entity<Month>().HasKey(c => c.Index);
            builder.Entity<Month>().Property(c => c.Index).ValueGeneratedNever();
            builder.Entity<Year>().HasKey(c => c.Index);
            builder.Entity<Year>().Property(c => c.Index).ValueGeneratedNever();

            var secondSeed = new Second[60];
            for (var i = 0; i < 60; i++)
            {
                secondSeed[i] = new Second
                {
                    Index = i,
                    Count = 0
                };
            }

            var minuteSeed = new Minute[60];
            for (var i = 0; i < 60; i++)
            {
                minuteSeed[i] = new Minute
                {
                    Index = i,
                    Count = 0
                };
            }

            var hourSeed = new Hour[24];
            for (var i = 0; i < 24; i++)
            {
                hourSeed[i] = new Hour
                {
                    Index = i,
                    Count = 0
                };
            }

            var daySeed = new Day[30];
            for (var i = 0; i < 30; i++)
            {
                daySeed[i] = new Day
                {
                    Index = i,
                    Count = 0
                };
            }

            var monthSeed = new Month[12];
            for (var i = 0; i < 12; i++)
            {
                monthSeed[i] = new Month
                {
                    Index = i,
                    Count = 0
                };
            }

            var yearSeed = new Year[10];
            for (var i = 0; i < 10; i++)
            {
                yearSeed[i] = new Year
                {
                    Index = i,
                    Count = 0
                };
            }

            builder.Entity<Second>().HasData(secondSeed);
            builder.Entity<Minute>().HasData(minuteSeed);
            builder.Entity<Hour>().HasData(hourSeed);
            builder.Entity<Day>().HasData(daySeed);
            builder.Entity<Month>().HasData(monthSeed);
            builder.Entity<Year>().HasData(yearSeed);
            builder.Entity<TotalClicks>().HasData(new TotalClicks { Id = 1, Count = 0 });
        }

    }
}
