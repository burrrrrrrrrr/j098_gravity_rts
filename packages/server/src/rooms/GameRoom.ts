import { Client, Room } from "colyseus";
import { GameState, Draggables } from "../schemas/GameState";

export class GameRoom extends Room<GameState> {
  state = new GameState();
  maxClients = 25;

  onCreate(options: any): void | Promise<any> {

    this.onMessage("move", (client, message) => {
      // Update image position based on data received
      const image = this.state.draggables.get(message.imageId);
      if (image) {
        image.x = message.x;
        image.y = message.y;
        this.broadcast("move", this.state.draggables);
      }
    });
  }

  onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
    console.log(`Client joined: ${client.sessionId}`);
  }

  onLeave(client: Client, consented: boolean): void | Promise<any> {
    console.log(`Client left: ${client.sessionId}`);
  }
}
