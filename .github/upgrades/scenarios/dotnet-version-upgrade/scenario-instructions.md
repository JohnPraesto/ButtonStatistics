# .NET Version Upgrade to .NET 10

## Preferences
- **Flow Mode**: Automatic
- **Target Framework**: net10.0

## Upgrade Options
- **Upgrade Strategy**: All-at-Once

## Strategy
**Selected**: All-at-Once
**Rationale**: Single project solution with straightforward upgrade path (net8.0 → net10.0), no dependency graph to coordinate, all SDK-style.

### Execution Constraints
- Single atomic upgrade — all changes applied together
- Validate full solution build after upgrade completes
- No tier ordering or phased rollout (single project)
- Package updates and code fixes resolved in one pass

## Source Control
- **Source Branch**: master
- **Working Branch**: dotnet-version-upgrade
- **Commit Strategy**: Single Commit at End
- **Branch Sync**: Auto (Merge)
