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

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Second>().HasKey(c => c.Index);
            builder.Entity<Second>().Property(c => c.Index).ValueGeneratedNever();
            builder.Entity<Minute>().HasKey(c => c.Index);
            builder.Entity<Minute>().Property(c => c.Index).ValueGeneratedNever();
            builder.Entity<Hour>().HasKey(c => c.Index);
            builder.Entity<Hour>().Property(c => c.Index).ValueGeneratedNever();

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

            builder.Entity<Second>().HasData(secondSeed);
            builder.Entity<Minute>().HasData(minuteSeed);
            builder.Entity<Hour>().HasData(hourSeed);
        }

    }
}
