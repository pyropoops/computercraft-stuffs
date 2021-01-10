import WebSocket from "ws";

export default class Turtle {
  socket: WebSocket;

  constructor(socket: WebSocket) {
    this.socket = socket;
  }

  sendEval(msg: string) {
    let packet = JSON.stringify({
      type: "eval",
      msg: msg,
    });
    this.socket.emit(packet);
  }
}
