import { Character } from "./Character";
import { GameScene } from "./scenes/GameScene";
import { animationKeys } from "./animations";
import { playerJumpForce, playerMoveSpeed, tileSize } from "./constants";
import { textureKeys } from "./textureData";

export class Player extends Character {
  private _cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private _gameScene: GameScene;
  private _jumpButtonLastFrame = false;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys
  ) {
    super(
      scene,
      x,
      y,
      textureKeys.player,
      playerMoveSpeed,
      animationKeys.playerMove,
      animationKeys.playerIdle,
      animationKeys.playerDie
    );
    this._cursors = cursorKeys;
    this._gameScene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this).setSize(16, 16).refreshBody();
  }

  jump() {
    if (!this.body?.blocked.down && !this.dead) return;
    this.setVelocityY(-1 * playerJumpForce);
    const animationKey = this.dead
      ? animationKeys.playerDie
      : animationKeys.playerJumping;
    this.anims.play(animationKey, true);
  }

  protected preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.dead) return;

    if (!this._gameScene.victory) this.checkWin();

    this.processInput();
  }

  processInput() {
    const cursors = this._cursors;
    if (!cursors) return;
    if (cursors.left.isDown) {
      this.move("left");
    } else if (cursors.right.isDown) {
      this.move("right");
    } else {
      this.move("stop");
    }

    const curJump = cursors.up.isDown;
    const jumpPressed = !this._jumpButtonLastFrame && curJump;
    if (jumpPressed) {
      this.jump();
    }
    this._jumpButtonLastFrame = curJump;

    const anyInput = cursors.left.isDown || cursors.right.isDown || jumpPressed;
    if (anyInput) this._gameScene.setStartedPlaying(true); //allows the game timer to start only after first input
  }

  checkWin() {
    const tileX = Math.floor(this.x / tileSize);
    const tileY = Math.floor(this.y / tileSize);
    const goal = this._gameScene.goalPosition;
    if (tileX === goal.x && (tileY === goal.y - 1 || tileY === goal.y)) {
      this._gameScene.doGameWin();
    }
  }

  playerDeath(worldCollider: Phaser.Physics.Arcade.Collider) {
    this.move("stop");
    this.setDead(true);
    this.body!.enable = false;
    setTimeout(() => {
      this.body!.enable = true;
      this.jump();
      worldCollider.destroy();
    }, 1000);
  }
}
