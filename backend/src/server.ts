import { Server } from "ws";
import Turtle, { turtles } from "./turtle";
import express, { Express } from "express";
import cors from "cors";

const CONTROL_PANEL_URL: string = "http://google.com/";
const API_WHITELISTED: string[] = ["::1", "127.0.0.1", "localhost"];

let turtleFunctions: Record<string, (turtle: Turtle) => Promise<any>> = {};

// Socket IO Shit
// Used for connecting: NodeJS Server <-> ComputerCraft Turtle
function createSocketServer(port: number): Server {
  let server = new Server({ port: port });
  server.on("connection", (socket) => {
    let turtle = new Turtle(socket);
    registerTurtle(app, turtle);
  });
  console.log(`Web-socket server listening on port ${port}`);
  return server;
}

// TODO: Change from GET to POST
// Express JS API
// Used for connecting: Front-end website <-> NodeJS Server
function registerTurtle(app: Express, turtle: Turtle) {
  app.post(`/turtles/${turtle.id}`, async (req, res) => {
    let addr = req.socket.remoteAddress;
    if (!addr || !API_WHITELISTED.includes(addr)) {
      res.status(403).send("Haha, nice try, but no. <3");
      return;
    }

    let exec: string = req.body["exec"];
    if (exec && exec in turtleFunctions) {
      let fn = turtleFunctions[exec];
      let response = await fn(turtle);
      res.status(200).send(response);
      return;
    }

    res.status(400).send('Please specify your "exec" parameter...');
  });
  console.log(`Registered turtle: ${turtle.id}`);
}

function createExpressServer(port: number) {
  console.log(`Express application listening on port ${port}`);
  let app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(__dirname + "/.."));
  app.use(cors());

  app.get("/", (_, res) => {
    res.redirect(CONTROL_PANEL_URL);
  });
  app.get("/turtles", (_, res) => {
    let keys: string[] = Object.keys(turtles);
    res.send(JSON.stringify(keys));
  });

  initTurtleFunctions(app);

  app.listen(port);
  return app;
}

function registerTurtleFunction(
  name: string,
  callback: (turtle: Turtle) => Promise<any>
) {
  turtleFunctions[name] = callback;
}

function initTurtleFunctions(app: Express) {
  // registerTurtleFunction("turnLeft", (turtle: Turtle) => turtle.turnLeft());
  registerTurtleFunction("turnLeft", (turtle: Turtle) => turtle.turnLeft());
  registerTurtleFunction("fuck", (turtle: Turtle) =>
    turtle.runCodeFromURL("http://localhost:6969/scripts/script.lua")
  );
}

// Call the initialize server functions and bind to ports
createSocketServer(42069);
let app = createExpressServer(6969);
