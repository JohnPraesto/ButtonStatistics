# .NET 10 Upgrade Plan

## Overview

**Target**: Upgrade ButtonStatistics.csproj from .NET 8 to .NET 10
**Scope**: 1 AspNetCore project, ~10k LOC, SDK-style

### Selected Strategy
**All-At-Once** — All projects upgraded simultaneously in a single operation.
**Rationale**: Single project solution with straightforward upgrade path - no dependency graph coordination needed.

## Tasks

### 01-prerequisites: Verify SDK and tooling compatibility

Ensure the development environment is ready for .NET 10, including SDK installation and global.json compatibility checks. This project already uses SDK-style format, so no conversion is needed.

Verifies:
- .NET 10 SDK is installed and accessible
- No global.json file enforces an incompatible SDK version
- Development environment can build .NET 10 projects

**Done when**: .NET 10 SDK is confirmed available, and no global.json conflicts exist.

---

### 02-upgrade-project: Update TFM, packages, and resolve API changes

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

---

### 03-final-validation: Build, test, and document

Perform full solution validation to ensure the upgrade is complete and functional. Run the full test suite, verify runtime behavior, and document any deferred recommendations.

**Validation steps**:
- Clean build of entire solution with zero errors and zero warnings
- All automated tests pass
- Application starts successfully and basic functionality works

**Done when**: Solution builds cleanly, all tests pass, and application runs without runtime errors.
