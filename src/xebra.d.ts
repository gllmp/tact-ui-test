declare module "xebra.js" {
  export interface StateOptions {
    hostname?: string;
    port?: number;
    supported_objects?: string[];
    auto_connect: boolean;
    secure: boolean;
    reconnect: boolean;
    reconnect_attempts: number;
    reconnect_timeout: number;
  }
  export class State<G = string, E = string> {
    constructor(options?: StateOptions);

    readonly isStateLoaded: boolean;

    connectionState: number;

    on(eventName: "channel_message_received", callback: (channel: E, message: string) => void): void;

    connect(): void;
    close(): void;

    sendMessageToChannel(channel: G, message: unknown): void;
  }
  export const SUPPORTED_OBJECTS: string[];
}
