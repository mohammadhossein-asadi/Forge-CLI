import { describe, it, expect } from 'vitest'
import { PluginPermissionManager } from './permissions.js'

describe('PluginPermissionManager', () => {
  it('should grant permissions', () => {
    const mgr = new PluginPermissionManager()
    mgr.grantPermission('plugin-a', 'filesystem.read')

    expect(mgr.hasPermission('plugin-a', 'filesystem.read')).toBe(true)
  })

  it('should revoke permissions', () => {
    const mgr = new PluginPermissionManager()
    mgr.grantPermission('plugin-a', 'filesystem.read')
    mgr.revokePermission('plugin-a', 'filesystem.read')

    expect(mgr.hasPermission('plugin-a', 'filesystem.read')).toBe(false)
  })

  it('should check multiple permissions', () => {
    const mgr = new PluginPermissionManager()
    mgr.grantPermission('plugin-a', 'filesystem.read')
    mgr.grantPermission('plugin-a', 'network.read')

    expect(mgr.hasAllPermissions('plugin-a', ['filesystem.read', 'network.read'])).toBe(true)
    expect(mgr.hasAllPermissions('plugin-a', ['filesystem.read', 'filesystem.write'])).toBe(false)
  })

  it('should get granted permissions', () => {
    const mgr = new PluginPermissionManager()
    mgr.grantPermission('plugin-a', 'filesystem.read')
    mgr.grantPermission('plugin-a', 'network.read')

    const perms = mgr.getGrantedPermissions('plugin-a')
    expect(perms).toContain('filesystem.read')
    expect(perms).toContain('network.read')
  })

  it('should get all permissions', () => {
    const mgr = new PluginPermissionManager()
    mgr.grantPermission('plugin-a', 'filesystem.read')
    mgr.grantPermission('plugin-b', 'network.write')

    const all = mgr.getAllPermissions()
    expect(all.get('plugin-a')).toContain('filesystem.read')
    expect(all.get('plugin-b')).toContain('network.write')
  })

  it('should revoke all permissions', () => {
    const mgr = new PluginPermissionManager()
    mgr.grantPermission('plugin-a', 'filesystem.read')
    mgr.grantPermission('plugin-a', 'network.read')
    mgr.revokeAll('plugin-a')

    expect(mgr.hasPermission('plugin-a', 'filesystem.read')).toBe(false)
    expect(mgr.hasPermission('plugin-a', 'network.read')).toBe(false)
  })

  it('should validate permissions', () => {
    const mgr = new PluginPermissionManager()
    mgr.grantPermission('plugin-a', 'filesystem.read')

    const checks = mgr.validatePermissions('plugin-a', ['filesystem.read', 'filesystem.write'])
    expect(checks).toHaveLength(2)
    expect(checks[0]!.granted).toBe(true)
    expect(checks[1]!.granted).toBe(false)
  })

  it('should auto-approve when enabled', () => {
    const mgr = new PluginPermissionManager()
    mgr.setAutoApprove(true)

    const result = mgr.requestPermission('plugin-a', 'filesystem.read')
    expect(result).toBe(true)
    expect(mgr.hasPermission('plugin-a', 'filesystem.read')).toBe(true)
  })

  it('should track requested permissions', () => {
    const mgr = new PluginPermissionManager()
    mgr.requestPermission('plugin-a', 'filesystem.read')
    mgr.requestPermission('plugin-a', 'network.write')

    const requested = mgr.getRequestedPermissions('plugin-a')
    expect(requested).toContain('filesystem.read')
    expect(requested).toContain('network.write')
  })
})
