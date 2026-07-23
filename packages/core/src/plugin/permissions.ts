export interface PermissionCheck {
  plugin: string
  permission: string
  granted: boolean
  reason?: string
}

export class PluginPermissionManager {
  private grantedPermissions = new Map<string, Set<string>>()
  private requestedPermissions = new Map<string, string[]>()
  private autoApprove = false

  setAutoApprove(auto: boolean): void {
    this.autoApprove = auto
  }

  requestPermission(pluginName: string, permission: string): boolean {
    if (this.autoApprove) {
      this.grantPermission(pluginName, permission)
      return true
    }

    // Store the request
    const requests = this.requestedPermissions.get(pluginName) ?? []
    requests.push(permission)
    this.requestedPermissions.set(pluginName, requests)

    // For now, auto-grant for development
    this.grantPermission(pluginName, permission)
    return true
  }

  grantPermission(pluginName: string, permission: string): void {
    const perms = this.grantedPermissions.get(pluginName) ?? new Set()
    perms.add(permission)
    this.grantedPermissions.set(pluginName, perms)
  }

  revokePermission(pluginName: string, permission: string): void {
    const perms = this.grantedPermissions.get(pluginName)
    if (perms) {
      perms.delete(permission)
    }
  }

  hasPermission(pluginName: string, permission: string): boolean {
    const perms = this.grantedPermissions.get(pluginName)
    return perms?.has(permission) ?? false
  }

  hasAllPermissions(pluginName: string, permissions: string[]): boolean {
    return permissions.every((p) => this.hasPermission(pluginName, p))
  }

  getGrantedPermissions(pluginName: string): string[] {
    return [...(this.grantedPermissions.get(pluginName) ?? [])]
  }

  getRequestedPermissions(pluginName: string): string[] {
    return this.requestedPermissions.get(pluginName) ?? []
  }

  getAllPermissions(): Map<string, string[]> {
    const result = new Map<string, string[]>()
    for (const [name, perms] of this.grantedPermissions) {
      result.set(name, [...perms])
    }
    return result
  }

  revokeAll(pluginName: string): void {
    this.grantedPermissions.delete(pluginName)
    this.requestedPermissions.delete(pluginName)
  }

  validatePermissions(pluginName: string, required: string[]): PermissionCheck[] {
    return required.map((permission) => ({
      plugin: pluginName,
      permission,
      granted: this.hasPermission(pluginName, permission),
      reason: this.hasPermission(pluginName, permission) ? undefined : 'Permission not granted',
    }))
  }
}
