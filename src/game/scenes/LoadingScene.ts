import { fetchedLevelDataSchema } from "../../types";
import { gameHeight, gameWidth } from "../constants";

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super("loading-scene");
  }

  create() {
    this.add.rectangle(0, 0, gameWidth, gameHeight, 0x000000);
    const text = this.add.text(200, 150, "Loading...", {
      font: "30px Arial",
      color: "#ffffff",
    });
    text.setOrigin(0.5, 0.5);

    const requestOptions = {
      method: "GET",
    };

    fetch("http://localhost:3000/levels/1", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        const parsedLevel = fetchedLevelDataSchema.parse(result);
        this.scene.start("game-scene", parsedLevel);
      })
      .catch((error) => console.log("error", error));
  }
}
