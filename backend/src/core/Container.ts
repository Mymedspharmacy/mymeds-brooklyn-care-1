// Dependency Injection Container
// Clean Architecture: Dependency Injection Layer

export type Constructor<T = {}> = new (...args: any[]) => T;
export type Factory<T> = () => T;

export interface ServiceDefinition<T = any> {
  factory: Factory<T>;
  singleton: boolean;
}

export class Container {
  private static instance: Container;
  private services = new Map<string, ServiceDefinition>();
  private instances = new Map<string, any>();

  private constructor() {}

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Register a service with the container
   */
  public register<T>(
    token: string | Constructor<T>,
    factory: Factory<T>,
    singleton: boolean = true
  ): void {
    const key = typeof token === 'string' ? token : token.name;
    this.services.set(key, { factory, singleton });
  }

  /**
   * Register a singleton service
   */
  public registerSingleton<T>(
    token: string | Constructor<T>,
    factory: Factory<T>
  ): void {
    this.register(token, factory, true);
  }

  /**
   * Register a transient service (new instance each time)
   */
  public registerTransient<T>(
    token: string | Constructor<T>,
    factory: Factory<T>
  ): void {
    this.register(token, factory, false);
  }

  /**
   * Resolve a service from the container
   */
  public resolve<T>(token: string | Constructor<T>): T {
    const key = typeof token === 'string' ? token : token.name;
    const definition = this.services.get(key);

    if (!definition) {
      throw new Error(`Service '${key}' is not registered`);
    }

    // Return existing instance if singleton
    if (definition.singleton && this.instances.has(key)) {
      return this.instances.get(key);
    }

    // Create new instance
    const instance = definition.factory();

    // Store instance if singleton
    if (definition.singleton) {
      this.instances.set(key, instance);
    }

    return instance;
  }

  /**
   * Check if a service is registered
   */
  public isRegistered(token: string | Constructor<any>): boolean {
    const key = typeof token === 'string' ? token : token.name;
    return this.services.has(key);
  }

  /**
   * Clear all registered services and instances
   */
  public clear(): void {
    this.services.clear();
    this.instances.clear();
  }

  /**
   * Get all registered service names
   */
  public getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }
}

// Export singleton instance
export const container = Container.getInstance();
