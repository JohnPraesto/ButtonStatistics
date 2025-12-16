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
        public DbSet<LocalHour> LocalHours { get; set; }
        public DbSet<LocalWeekday> LocalWeekdays { get; set; }
        public DbSet<LocalMonth> LocalMonths { get; set; }
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
            builder.Entity<LocalHour>().HasKey(c => c.Index);
            builder.Entity<LocalHour>().Property(c => c.Index).ValueGeneratedNever();
            builder.Entity<LocalWeekday>().HasKey(c => c.Index);
            builder.Entity<LocalWeekday>().Property(c => c.Index).ValueGeneratedNever();
            builder.Entity<LocalMonth>().HasKey(c => c.Index);
            builder.Entity<LocalMonth>().Property(c => c.Index).ValueGeneratedNever();

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

            var daySeed = new Day[31];
            for (var i = 0; i < 31; i++)
            {
                daySeed[i] = new Day
                {
                    Index = i + 1, // +1 to make day index start at 1 just as DateTime days starts at 1.
                    Count = 0
                };
            }

            var monthSeed = new Month[12];
            for (var i = 0; i < 12; i++)
            {
                monthSeed[i] = new Month
                {
                    Index = i + 1, // Same +1 here as with days
                    Count = 0
                };
            }

            var yearSeed = new Year[50];
            for (var i = 0; i < 50; i++)
            {
                yearSeed[i] = new Year
                {
                    Index = i + 2015, // Creating years with index numbers 2015 to 2065
                    Count = 0
                };
            }

            var localHourSeed = new LocalHour[24];
            for (var i = 0; i < 24; i++)
            {
                localHourSeed[i] = new LocalHour
                {
                    Index = i,
                    Count = 0
                };
            }

            var localWeekdaySeed = new LocalWeekday[7];
            for (var i = 0; i < 7; i++)
            {
                localWeekdaySeed[i] = new LocalWeekday
                {
                    Index = i, // 0 = Sunday ... 6 = Saturday (matches JS getDay())
                    Count = 0
                };
            }

            var localMonthSeed = new LocalMonth[12];
            for (var i = 0; i < 12; i++)
            {
                localMonthSeed[i] = new LocalMonth
                {
                    Index = i, // 0 = Jan ... 11 = Dec (matches JS getMonth())
                    Count = 0
                };
            }

            builder.Entity<Second>().HasData(secondSeed);
            builder.Entity<Minute>().HasData(minuteSeed);
            builder.Entity<Hour>().HasData(hourSeed);
            builder.Entity<Day>().HasData(daySeed);
            builder.Entity<Month>().HasData(monthSeed);
            builder.Entity<Year>().HasData(yearSeed);
            builder.Entity<LocalHour>().HasData(localHourSeed);
            builder.Entity<LocalWeekday>().HasData(localWeekdaySeed);
            builder.Entity<LocalMonth>().HasData(localMonthSeed);
            builder.Entity<TotalClicks>().HasData(new TotalClicks { Id = 1, Count = 0 });
        }

    }
}
