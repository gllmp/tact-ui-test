import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import * as Xebra from "xebra.js";
import { Effect } from "../effects/typings";

export enum EFFECTS_ENUM {
  spread = "spread",
  zoom = "zoom",
  unveil = "unveil",
  drip = "drip",
}
export enum GESTURE_ENUM {
  pointerdown = "pointerdown",
  pointermove = "pointermove",
  pointerup = "pointerup",
  pinch = "pinch",
  auto = "auto",
  scene = "scene",
}
export type MessageData = {
  id: number;
  t: number;
  touches: number[];
  x?: number;
  y?: number;
  moveX?: number;
  moveY?: number;
  vx?: number;
  vy?: number;
  d?: number;
};
export enum RECORD_ENUM {
  recordstart = "recordstart",
  recordend = "recordend",
}
type XEBRA_CHANNEL = GESTURE_ENUM | RECORD_ENUM;
type XebraMessageHandler = (channel: XEBRA_CHANNEL, msg: MessageData) => void;
type XebraListeners = Record<EFFECTS_ENUM, (message: Parameters<ReturnType<Effect>>[0]) => void>;

const CONNECTION_STATES = Object.freeze({
  INIT: 1,
  CONNECTING: 2,
  CONNECTED: 4,
  CONNECTION_FAIL: 8,
  RECONNECTING: 16,
  DISCONNECTED: 32,
});

type XebraContext = {
  sendMessage: (channel: string, msg: unknown) => void;
  sendTouch: (channel: GESTURE_ENUM, msg: MessageData) => void;
};
export const xebraContext = createContext<XebraContext>({} as XebraContext);

export const XebraProvider: React.FC<{
  listeners?: XebraListeners;
  options?: Xebra.StateOptions;
}> = ({
  listeners,
  options = {
    hostname: process.env.REACT_APP_WEBSOCKET_IP || "127.0.0.1",
    port: 8086,
    supported_objects: [],
    auto_connect: false,
    secure: false,
    reconnect: false,
    reconnect_attempts: 2,
    reconnect_timeout: 10000,
  },
  children,
}) => {
  const xebra = useMemo(() => new Xebra.State<XEBRA_CHANNEL, EFFECTS_ENUM>(options), [options]);

  const checkStatus = useCallback(
    (status: number | number[]) => {
      if (!Array.isArray(status)) status = [status];
      return status.some((state) => xebra.connectionState === state);
    },
    [xebra.connectionState]
  );

  const sendMessage = useCallback<(channel: string, msg: unknown) => void>(
    (channel, msg) => {
      if (checkStatus(CONNECTION_STATES.CONNECTED)) {
        try {
          xebra.sendMessageToChannel(channel as XEBRA_CHANNEL, JSON.stringify(msg));
        } catch (err) {
          console.error(err);
        }
      }
    },
    [checkStatus, xebra]
  );

  const sendTouch = useCallback<XebraMessageHandler>(
    (channel, msg) => {
      const payload = Object.fromEntries(
        Object.entries(msg).filter(([, value]) => {
          if (Array.isArray(value)) return value.every((v) => !isNaN(v));
          if (typeof value === "number") return !isNaN(value);
          return Boolean(value);
        })
      );
      sendMessage(channel, payload);
    },
    [sendMessage]
  );

  useEffect(() => {
    if (checkStatus([CONNECTION_STATES.CONNECTED, CONNECTION_STATES.CONNECTING, CONNECTION_STATES.RECONNECTING]))
      return undefined;
    xebra.on("channel_message_received", (channel, message) => {
      if (typeof listeners?.[channel] !== "undefined")
        listeners[channel](typeof message === "string" ? JSON.parse(message) : message);
    });
    xebra.connect();

    return () => {
      xebra.close();
    };
  }, [xebra, listeners, checkStatus]);

  return <xebraContext.Provider value={{ sendTouch, sendMessage }}>{children}</xebraContext.Provider>;
};

export const useXebra = (): XebraContext => {
  const value = useContext(xebraContext);
  return value;
};
