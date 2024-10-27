import { ConsoleLogger } from '@nestjs/common';

export class InternalLogFilter extends ConsoleLogger {
  static contextsToIgnore = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'WebSocketsController',
  ];

  private allowedLogLevels: string[];

  constructor() {
    super();
    this.allowedLogLevels =
      process.env.NODE_ENV === 'production'
        ? ['log', 'error', 'fatal']
        : ['log', 'debug', 'verbose', 'warn', 'error', 'fatal'];
  }

  private isLogLevelAllowed(level: string): boolean {
    return this.allowedLogLevels.includes(level);
  }

  private getLocation(): string {
    // Capture the current stack trace
    const stack = new Error().stack;
    let location = 'Location unknown';
    if (stack) {
      // Parse the stack to get the correct file location and line number
      const stackLines = stack.split('\n');
      const callerLine = stackLines[3]; // Adjust index if needed
      const matched = callerLine.match(/\(([^)]+)\)/);
      return matched ? matched[1] : location;
    }
    return location;
  }

  log(_: any, context?: string): void {
    if (
      this.isLogLevelAllowed('log') &&
      (process.env.NODE_ENV !== 'production' ||
        !InternalLogFilter.contextsToIgnore.includes(context))
    ) {
      /*       if (String(myArgument).startsWith('LOG')) {
        super.log.apply(this, `${arguments}, ${this.getLocation()}`);
      } else {
      } */
      super.log.apply(this, arguments);
    }
  }

  warn(_: any, context?: string): void {
    if (this.isLogLevelAllowed('warn')) {
      super.warn.apply(this, arguments);
    }
  }

  error(_: any, stack?: string, context?: string): void {
    if (this.isLogLevelAllowed('error')) {
      super.error.apply(this, arguments);
      // super.error.apply(this, `${stack} ${arguments}`);
    }
  }

  debug(_: any, context?: string): void {
    if (this.isLogLevelAllowed('debug')) {
      super.debug.apply(this, arguments);
    }
  }

  verbose(_: any, context?: string): void {
    if (this.isLogLevelAllowed('verbose')) {
      super.verbose.apply(this, arguments);
    }
  }
}
