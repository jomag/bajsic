declare module 'bajsic' {
  declare class Program { }

  declare class Stream extends EventEmitter {
    write(data: string): void;
    read(): void;
    on(eventName: string, listener: (data: string) => void): void;
  }

  declare class Context { }

  declare class BaseSupport {
    finalize(): void;
    async open(filename: string, mode: string, channel: number);
    async clearInputBuffer();
    async close(channel: number);
    async print(channel: number, value: string);
    async printError(value: string);
    async readLine(channel: number);
    async waitForInput(timeout: number);
  }

  declare function setupEnvironment(
    source: string | undefined,
    support: BaseSupport
  ): {
    program: Program;
    context: Context;
  };

  declare function parse(source: string): Program;
  declare function shell(program: Program, context: Context): Promise<void>;
  declare function run(program: Program, context: Context): Promise<void>;
}
