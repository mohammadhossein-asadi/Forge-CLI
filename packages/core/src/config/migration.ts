export interface MigrationRule {
  fromVersion: string
  toVersion: string
  description: string
  migrate: (config: Record<string, unknown>) => Record<string, unknown>
}

export class ConfigMigration {
  private rules: MigrationRule[] = []

  register(rule: MigrationRule): void {
    this.rules.push(rule)
  }

  getAvailableMigrations(): MigrationRule[] {
    return [...this.rules]
  }

  getMigrationPath(fromVersion: string, toVersion: string): MigrationRule[] {
    const path: MigrationRule[] = []
    let current = fromVersion

    while (current !== toVersion) {
      const next = this.rules.find((r) => r.fromVersion === current)
      if (!next) break
      path.push(next)
      current = next.toVersion
    }

    return path
  }

  async migrate(config: Record<string, unknown>, fromVersion: string, toVersion: string): Promise<Record<string, unknown>> {
    const migrationPath = this.getMigrationPath(fromVersion, toVersion)

    let migrated = { ...config }
    for (const rule of migrationPath) {
      migrated = rule.migrate(migrated)
      migrated.version = rule.toVersion
    }

    return migrated
  }

  hasMigrationPath(fromVersion: string, toVersion: string): boolean {
    const path = this.getMigrationPath(fromVersion, toVersion)
    return path.length > 0
  }

  getLatestVersion(): string {
    const versions = this.rules.map((r) => r.toVersion)
    return versions.sort((a, b) => this.compareVersions(b, a))[0] ?? '1.0.0'
  }

  private compareVersions(a: string, b: string): number {
    const pa = a.split('.').map(Number)
    const pb = b.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      const na = pa[i] ?? 0
      const nb = pb[i] ?? 0
      if (na > nb) return 1
      if (na < nb) return -1
    }
    return 0
  }
}

export const DEFAULT_MIGRATIONS: MigrationRule[] = [
  {
    fromVersion: '1.0.0',
    toVersion: '1.1.0',
    description: 'Add telemetry option to CLI config',
    migrate: (config) => {
      if (!config.cli || typeof config.cli !== 'object') {
        config.cli = {}
      }
      const cli = config.cli as Record<string, unknown>
      if (cli.telemetry === undefined) {
        cli.telemetry = false
      }
      return config
    },
  },
]
