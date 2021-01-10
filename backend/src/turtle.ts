import { randomBytes } from "crypto";
import WebSocket from "ws";
import names from "../names.json";

export let turtles: Record<string, Turtle> = {};

export default class Turtle {
  socket: WebSocket;
  id: string;

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.id = this.generateID();

    turtles[this.id] = this;

    this.socket.on("close", () => {
      delete turtles[this.id];
    });
  }

  generateID(): string {
    let i = Math.round(Math.random() * (names.length - 1));
    let name = names[i];
    this.setName(name);
    return name;
  }

  getNonce(): string {
    return randomBytes(16).toString("base64");
  }

  async setName(name: string): Promise<void> {
    return this.exec<void>(`os.setComputerLabel("${name}")`);
  }

  async turnLeft(): Promise<boolean> {
    return this.exec<boolean>("turtle.turnLeft()");
  }

  async runCodeFromURL(url: string): Promise<boolean> {
    return this.exec<boolean>(`runCode("${url}")`);
  }

  async exec<T>(data: string): Promise<T> {
    return new Promise((r) => {
      let nonce = this.getNonce();
      let packet = JSON.stringify({
        type: "eval",
        data: `return ${data}`,
        nonce: nonce,
      });
      this.socket.send(packet);

      const listener = (response: string) => {
        try {
          let res = JSON.parse(response);
          if (res.nonce === nonce) {
            r(res.data);
            this.socket.off("message", listener);
          }
        } catch (_) {}
      };
      this.socket.on("message", listener);
    });
  }
}
