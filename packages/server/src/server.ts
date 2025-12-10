import { MonitorOptions, monitor } from "@colyseus/monitor";
import { LobbyRoom, Server } from "colyseus";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import { createServer } from "http";
import { WebSocketTransport } from "@colyseus/ws-transport";
import path from "path";
import { GameRoom } from "./rooms/GameRoom";

dotenv.config({ path: "../../.env" });

const app: Application = express();
const router = express.Router();
const port: number = Number(process.env.PORT) || 3001;

const server = new Server({
  transport: new WebSocketTransport({
    server: createServer(app),
  }),
});

// Game Rooms
server
  .define("game", GameRoom)
  // filterBy allows us to call joinOrCreate and then hold one game per channel
  // https://discuss.colyseus.io/topic/345/is-it-possible-to-run-joinorcreatebyid/3
  .filterBy(["channelId"]);
server.define("lobby", LobbyRoom);
server
  .define("my_room", GameRoom)
  .enableRealtimeListing();

app.use(express.json());
app.use(router);

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientBuildPath));
}

// If you don't want people accessing your server stats, comment this line.
router.use("/colyseus", monitor(server as Partial<MonitorOptions>));

// Using a flat route in dev to match the vite server proxy config
app.use(process.env.NODE_ENV === "production" ? "/.proxy/api" : "/", router);

server.listen(port).then(() => {
  console.log(`App is listening on port ${port} !`);
});
