import { atom, selector } from "recoil";

export const webSocketState = atom({
  key: "webSocketState",
  default: process.env.REACT_APP_WEBSOCKET_IP || "127.0.0.1",
});

export const connectToLocal = selector({
  key: "webSocket.Local",
  set: ({ set }) => set(webSocketState, "192.168.0.2"),
  get: () => "192.168.0.2",
});
export const connectToFred = selector({
  key: "webSocket.Fred",
  set: ({ set }) => set(webSocketState, "82.64.145.9"),
  get: () => "82.64.145.9",
});

export const connectToVigie = selector({
  key: "webSocket.Vigie",
  set: ({ set }) => set(webSocketState, "129.102.67.242"),
  get: () => "129.102.67.242",
});
