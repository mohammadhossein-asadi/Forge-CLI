type Factory<T> = (container: Container) => T

interface Registration {
  factory: Factory<unknown>
  scope: 'transient' | 'singleton'
}

export class Container {
  private registrations = new Map<string, Registration>()
  private singletons = new Map<string, unknown>()
  private parent?: Container

  constructor(parent?: Container) {
    this.parent = parent
  }

  register<T>(token: string, factory: Factory<T>, options?: { scope?: 'transient' | 'singleton' }): void {
    this.registrations.set(token, {
      factory: factory as Factory<unknown>,
      scope: options?.scope ?? 'transient',
    })
  }

  registerSingleton<T>(token: string, factory: Factory<T>): void {
    this.register(token, factory, { scope: 'singleton' })
  }

  registerInstance<T>(token: string, instance: T): void {
    this.singletons.set(token, instance)
  }

  resolve<T>(token: string): T {
    // Check singletons first
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T
    }

    // Check own registrations
    const reg = this.registrations.get(token)
    if (reg) {
      if (reg.scope === 'singleton') {
        const instance = reg.factory(this) as T
        this.singletons.set(token, instance)
        return instance
      }
      return reg.factory(this) as T
    }

    // Delegate to parent
    if (this.parent) {
      return this.parent.resolve<T>(token)
    }

    throw new Error(`No registration found for token: ${token}`)
  }

  has(token: string): boolean {
    return (
      this.registrations.has(token) ||
      this.singletons.has(token) ||
      (this.parent?.has(token) ?? false)
    )
  }

  createChild(): Container {
    return new Container(this)
  }

  tokens(): string[] {
    const parentTokens = this.parent?.tokens() ?? []
    return [...new Set([...this.registrations.keys(), ...this.singletons.keys(), ...parentTokens])]
  }

  async dispose(): Promise<void> {
    for (const [, instance] of this.singletons) {
      // Skip self-reference to avoid infinite recursion
      if (instance === this) continue
      if (typeof instance === 'object' && instance !== null && 'dispose' in instance) {
        await (instance as { dispose: () => Promise<void> }).dispose()
      }
    }
    this.singletons.clear()
    this.registrations.clear()
  }
}
