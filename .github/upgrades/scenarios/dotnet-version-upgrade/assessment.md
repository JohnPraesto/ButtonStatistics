# Projects and dependencies analysis

This document provides a comprehensive overview of the projects and their dependencies in the context of upgrading to .NETCoreApp,Version=v10.0.

## Table of Contents

- [Executive Summary](#executive-Summary)
  - [Highlevel Metrics](#highlevel-metrics)
  - [Projects Compatibility](#projects-compatibility)
  - [Package Compatibility](#package-compatibility)
  - [API Compatibility](#api-compatibility)
  - [Binding Redirect Configuration](#binding-redirect-configuration)
- [Aggregate NuGet packages details](#aggregate-nuget-packages-details)
- [Top API Migration Challenges](#top-api-migration-challenges)
  - [Technologies and Features](#technologies-and-features)
  - [Most Frequent API Issues](#most-frequent-api-issues)
- [Projects Relationship Graph](#projects-relationship-graph)
- [Project Details](#project-details)

  - [ButtonStatistics.csproj](#buttonstatisticscsproj)


## Executive Summary

### Highlevel Metrics

| Metric | Count | Status |
| :--- | :---: | :--- |
| Total Projects | 1 | All require upgrade |
| Total NuGet Packages | 6 | 4 need upgrade |
| Total Code Files | 30 |  |
| Total Code Files with Incidents | 6 |  |
| Total Lines of Code | 10114 |  |
| Total Number of Issues | 16 |  |
| Estimated LOC to modify | 11+ | at least 0,1% of codebase |

### Projects Compatibility

| Project | Target Framework | Difficulty | Package Issues | API Issues | Binding Issues | Est. LOC Impact | Description |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| [ButtonStatistics.csproj](#buttonstatisticscsproj) | net8.0 | 🟢 Low | 4 | 11 | 0 | 11+ | AspNetCore, Sdk Style = True |

### Package Compatibility

| Status | Count | Percentage |
| :--- | :---: | :---: |
| ✅ Compatible | 2 | 33,3% |
| ⚠️ Incompatible | 0 | 0,0% |
| 🔄 Upgrade Recommended | 4 | 66,7% |
| ***Total NuGet Packages*** | ***6*** | ***100%*** |

### API Compatibility

| Category | Count | Impact |
| :--- | :---: | :--- |
| 🔴 Binary Incompatible | 0 | High - Require code changes |
| 🟡 Source Incompatible | 6 | Medium - Needs re-compilation and potential conflicting API error fixing |
| 🔵 Behavioral change | 5 | Low - Behavioral changes that may require testing at runtime |
| ✅ Compatible | 6725 |  |
| ***Total APIs Analyzed*** | ***6736*** |  |

## Aggregate NuGet packages details

| Package | Current Version | Suggested Version | Projects | Description |
| :--- | :---: | :---: | :--- | :--- |
| Microsoft.AspNetCore.OpenApi | 10.0.10 |  | [ButtonStatistics.csproj](#buttonstatisticscsproj) | ✅Compatible |
| Microsoft.EntityFrameworkCore | 8.0.22 | 10.0.10 | [ButtonStatistics.csproj](#buttonstatisticscsproj) | NuGet package upgrade is recommended |
| Microsoft.EntityFrameworkCore.Sqlite | 8.0.22 | 10.0.10 | [ButtonStatistics.csproj](#buttonstatisticscsproj) | NuGet package upgrade is recommended |
| Microsoft.EntityFrameworkCore.SqlServer | 8.0.22 | 10.0.10 | [ButtonStatistics.csproj](#buttonstatisticscsproj) | NuGet package upgrade is recommended |
| Microsoft.EntityFrameworkCore.Tools | 8.0.22 | 10.0.10 | [ButtonStatistics.csproj](#buttonstatisticscsproj) | NuGet package upgrade is recommended |
| Swashbuckle.AspNetCore | 6.6.2 |  | [ButtonStatistics.csproj](#buttonstatisticscsproj) | ✅Compatible |

## Top API Migration Challenges

### Technologies and Features

| Technology | Issues | Percentage | Migration Path |
| :--- | :---: | :---: | :--- |

### Most Frequent API Issues

| API | Count | Percentage | Category |
| :--- | :---: | :---: | :--- |
| M:System.TimeSpan.FromMinutes(System.Double) | 4 | 36,4% | Source Incompatible |
| T:System.Net.Http.HttpContent | 3 | 27,3% | Behavioral Change |
| T:System.Text.Json.JsonDocument | 2 | 18,2% | Behavioral Change |
| M:System.TimeSpan.FromSeconds(System.Double) | 2 | 18,2% | Source Incompatible |

## Projects Relationship Graph

Legend:
📦 SDK-style project
⚙️ Classic project

```mermaid
flowchart LR
    P1["<b>📦&nbsp;ButtonStatistics.csproj</b><br/><small>net8.0</small>"]
    click P1 "#buttonstatisticscsproj"

```

## Project Details

<a id="buttonstatisticscsproj"></a>
### ButtonStatistics.csproj

#### Project Info

- **Current Target Framework:** net8.0
- **Proposed Target Framework:** net10.0
- **SDK-style**: True
- **Project Kind:** AspNetCore
- **Dependencies**: 0
- **Dependants**: 0
- **Number of Files**: 34
- **Number of Files with Incidents**: 6
- **Lines of Code**: 10114
- **Estimated LOC to modify**: 11+ (at least 0,1% of the project)

#### Dependency Graph

Legend:
📦 SDK-style project
⚙️ Classic project

```mermaid
flowchart TB
    subgraph current["ButtonStatistics.csproj"]
        MAIN["<b>📦&nbsp;ButtonStatistics.csproj</b><br/><small>net8.0</small>"]
        click MAIN "#buttonstatisticscsproj"
    end

```

### API Compatibility

| Category | Count | Impact |
| :--- | :---: | :--- |
| 🔴 Binary Incompatible | 0 | High - Require code changes |
| 🟡 Source Incompatible | 6 | Medium - Needs re-compilation and potential conflicting API error fixing |
| 🔵 Behavioral change | 5 | Low - Behavioral changes that may require testing at runtime |
| ✅ Compatible | 6725 |  |
| ***Total APIs Analyzed*** | ***6736*** |  |

