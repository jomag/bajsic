declare module 'bajsic' {
  declare class Program {}

  declare class Stream extends EventEmitter {
    write(data: string): void;
    read(): void;
    on(eventName: string, listener: (data: string) => void): void;
  }

  declare class Context {
    inputStream: Stream;
    outputStream: Stream;
    errorStream: Stream;
  }

  declare function setupEnvironment(
    source: string
  ): {
    program: Program;
    context: Context;
  };

  declare function shell(program: Program, context: Context): Promise<void>;
}
