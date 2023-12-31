import { Character } from "./Character";
import { animationKeys } from "./animations";
import { enemyMoveSpeed } from "./constants";
import { textureKeys } from "./textureData";
import { MovementType } from "../../platformer-creator-game-shared/typesGame";

export class Enemy extends Character {
  private _timer = 0;
  private _moveDirection: MovementType = "left";
  private _frozen = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      textureKeys.enemy,
      enemyMoveSpeed,
      animationKeys.enemyMove,
      animationKeys.enemyIdle,
      animationKeys.enemyDie
    );
  }

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this._frozen) {
      this.move("stop");
      return;
    }
    this._timer += delta;
    this.move(this._moveDirection);
    if (this._timer > 1000) {
      this._timer = 0;
      if (this._moveDirection === "left") this._moveDirection = "right";
      else this._moveDirection = "left";
    }
  }

  setFrozen(value: boolean) {
    this._frozen = value;
  }
}
