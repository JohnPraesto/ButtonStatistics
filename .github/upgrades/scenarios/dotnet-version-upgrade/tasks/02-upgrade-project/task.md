# 02-upgrade-project: Update TFM, packages, and resolve API changes

Update the ButtonStatistics project to target net10.0, upgrade Entity Framework Core packages from 8.0.22 to 10.0.10, and address the 11 API compatibility issues identified in the assessment.

**Scope**: Single AspNetCore project with these changes:
- TargetFramework: net8.0 → net10.0
- Microsoft.EntityFrameworkCore packages: 8.0.22 → 10.0.10 (4 packages)
- Microsoft.AspNetCore.OpenApi: already at 10.0.10 (compatible)
- Swashbuckle.AspNetCore: 6.6.2 (compatible, no upgrade needed)

**Key issues to address**:
- 6 source-incompatible APIs (primarily TimeSpan.FromMinutes/FromSeconds)
- 5 behavioral changes (HttpContent, JsonDocument)
- Most frequent issue: TimeSpan overload resolution changes (6 occurrences)

**Research starting points**:
- Check RollService.cs and other files with TimeSpan API usage for overload ambiguity
- Review HttpContent usage patterns for behavioral changes
- Verify JsonDocument handling aligns with .NET 10 behavior

**Done when**: Project builds successfully with zero errors, all packages updated to .NET 10-compatible versions, and all API compatibility issues resolved.
