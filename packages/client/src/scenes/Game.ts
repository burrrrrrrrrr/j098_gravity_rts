import { Scene } from "phaser";
import { Room, RoomAvailable, Client, getStateCallbacks } from "colyseus.js";

export class Game extends Scene {
  room: Room;

  constructor() {
    super("Game");
  }

  async create() {
    this.scene.launch("background");


    await this.connect();

    const $ = getStateCallbacks(this.room);

    this.add
      .text(this.cameras.main.width * 0.5, this.cameras.main.height * 0.95, `Connected`, {
        font: "14px Arial",
        color: "#000000",
      })
      .setOrigin(0.5);

      const config = {
          shape: {
              type: 'circle',
              radius: 20
          },
          attractors: [
              (bodyA, bodyB) => ({
                  x: (bodyA.position.x - bodyB.position.x) * 0.0000001,
                  y: (bodyA.position.y - bodyB.position.y) * 0.0000001
            })
          ]
        }

      this.objA = this.matter.add.image(200, 200, 'smile', 0, config).setVelocity(4, 0);
      this.objB = this.matter.add.image(305, 300, 'smile', 0, config).setVelocity(2, 2);
      this.objC = this.matter.add.image(505, 500, 'smile', 0, config).setVelocity(1, 1);
      // this.objA.setMass(10);   // arbitrary mass values
      // this.objB.setMass(20);

      // this.objA.setDamping(true).setDrag(0.99);
      // this.objB.setDamping(true).setDrag(0.99);
  }

  update () {
    // if(!this?.objA?.x) return;
    // const A = this.objA;
    // const B = this.objB;

    // // Vector from A to B
    // const dx = B.x - A.x;
    // const dy = B.y - A.y;
    // const distanceSq = dx * dx + dy * dy;

    // // Add a small minimum distance to avoid infinite force
    // const minDistSq = 50 * 50;
    // const safeDistanceSq = Math.max(distanceSq, minDistSq);

    // // Gravitational constant (tune this)
    // const G = 0.001;

    // // Force magnitude
    // const force = G * A.body.mass * B.body.mass / safeDistanceSq;

    // // Normalize direction
    // const dist = Math.sqrt(dx * dx + dy * dy);
    // const fx = (dx / dist) * force;
    // const fy = (dy / dist) * force;

    // // Apply force to A (toward B)
    // A.body.velocity.x += fx / A.body.mass;
    // A.body.velocity.y += fy / A.body.mass;

    // // Apply opposite force to B (toward A)
    // B.body.velocity.x -= fx / B.body.mass;
    // B.body.velocity.y -= fy / B.body.mass;
  }

  async connect() {
    const url =
      location.host === "localhost:3000" ? `ws://localhost:3001` : `wss://${location.host}/.proxy/api/colyseus`;

    const client = new Client(`${url}`);
    let allRooms: RoomAvailable[] = [];
    const lobby = await client.joinOrCreate("lobby");
    lobby.onMessage("rooms", (rooms) => {
      allRooms = rooms;
      console.log('allRooms 1')
      console.log(allRooms)
    });
    
    lobby.onMessage("+", ([roomId, room]) => {
      const roomIndex = allRooms.findIndex((room) => room.roomId === roomId);
      if (roomIndex !== -1) {
        allRooms[roomIndex] = room;
    
      } else {
        allRooms.push(room);
      }
      console.log('roomIndex')
      console.log(roomIndex)
    });
    
    lobby.onMessage("-", (roomId) => {
      allRooms = allRooms.filter((room) => room.roomId !== roomId);
      console.log('allRooms 2')
      console.log(allRooms)
    });

    try {
      this.room = await client.joinOrCreate("game", {
        // Let's send our client screen dimensions to the server for initial positioning
        screenWidth: this.game.config.width,
        screenHeight: this.game.config.height,
      });

      this.room.onMessage("move", (message) => {
        //console.log("Move message received:", message);
      });

      console.log("Successfully connected!");
    } catch (e) {
      console.log(`Could not connect with the server: ${e}`);
    }
  }
}
