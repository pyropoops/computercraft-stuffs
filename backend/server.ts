import WebSocket, { Server } from "ws";
import Turtle from "./turtle";
import express, { Express } from "express";

let turtle: Turtle | undefined = undefined;

function handleConnection(socket: WebSocket) {
  turtle = new Turtle(socket);
}

function createSocketServer(port: number): Server {
  let server = new Server({ port: port });
  server.on("connection", handleConnection);
  console.log(`Web-socket server listening on port ${port}`);
  return server;
}

function registerAPIFunction(app: Express, fn: string) {
  app.get(`/${fn}`, (req, res) => {
    console.log("Received..");
    if (turtle) {
      turtle.sendEval(`turtle.${fn}()`);
    }
    res.send(fn);
  });
}

function createExpressServer(port: number) {
  let app = express();
  app.get("/", (req, res) => {
    res.send("<h1>Hi</h1>");
  });
  registerAPIFunction(app, "turnLeft");
  app.listen(port, `Express application listening on port ${port}`);
}

createSocketServer(42069);
createExpressServer(6969);
