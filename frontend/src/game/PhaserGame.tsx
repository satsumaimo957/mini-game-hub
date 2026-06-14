import Phaser from "phaser";
import { useEffect, useRef } from "react";
import type { GameOverResult, GameSetting } from "../types";

interface PhaserGameProps {
  setting: GameSetting;
  resetKey: number;
  onGameOver: (result: GameOverResult) => void;
}

interface Obstacle {
  shape: Phaser.GameObjects.Rectangle;
  speed: number;
}

export function PhaserGame({ setting, resetKey, onGameOver }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    class DodgeScene extends Phaser.Scene {
      private player!: Phaser.GameObjects.Rectangle;
      private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
      private keys!: Record<string, Phaser.Input.Keyboard.Key>;
      private obstacles: Obstacle[] = [];
      private elapsedSeconds = 0;
      private spawnTimer = 0;
      private dodged = 0;
      private finished = false;
      private scoreText!: Phaser.GameObjects.Text;
      private timeText!: Phaser.GameObjects.Text;

      constructor() {
        super("dodge-runner");
      }

      create() {
        this.add.rectangle(360, 210, 720, 420, 0x0f172a);
        this.add.rectangle(360, 210, 704, 404, 0x111827).setStrokeStyle(2, 0x334155);
        this.player = this.add.rectangle(360, 350, 30, 30, 0x22c55e).setStrokeStyle(2, 0xbbf7d0);
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.keys = this.input.keyboard!.addKeys("W,A,S,D") as Record<string, Phaser.Input.Keyboard.Key>;
        this.scoreText = this.add.text(18, 16, "スコア 0", {
          color: "#e5e7eb",
          fontFamily: "Arial",
          fontSize: "18px"
        });
        this.timeText = this.add.text(620, 16, "0s", {
          color: "#bae6fd",
          fontFamily: "Arial",
          fontSize: "18px"
        });
      }

      update(_time: number, delta: number) {
        if (this.finished) {
          return;
        }

        this.elapsedSeconds += delta / 1000;
        this.spawnTimer += delta;
        this.updatePlayer(delta);

        if (this.spawnTimer >= setting.spawnRate) {
          this.spawnTimer = 0;
          this.spawnObstacle();
        }

        this.updateObstacles(delta);
        this.scoreText.setText(`スコア ${this.currentScore()}`);
        this.timeText.setText(`${Math.floor(this.elapsedSeconds)}s`);

        if (this.elapsedSeconds >= setting.timeLimitSeconds) {
          this.endGame();
        }
      }

      private updatePlayer(delta: number) {
        const playerSpeed = 300;
        const distance = (playerSpeed * delta) / 1000;
        let dx = 0;
        let dy = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown) {
          dx -= distance;
        }
        if (this.cursors.right.isDown || this.keys.D.isDown) {
          dx += distance;
        }
        if (this.cursors.up.isDown || this.keys.W.isDown) {
          dy -= distance;
        }
        if (this.cursors.down.isDown || this.keys.S.isDown) {
          dy += distance;
        }

        this.player.x = Phaser.Math.Clamp(this.player.x + dx, 28, 692);
        this.player.y = Phaser.Math.Clamp(this.player.y + dy, 44, 392);
      }

      private spawnObstacle() {
        const x = Phaser.Math.Between(35, 685);
        const width = Phaser.Math.Between(20, 46);
        const height = Phaser.Math.Between(18, 42);
        const shape = this.add
          .rectangle(x, -30, width, height, 0xf97316)
          .setStrokeStyle(2, 0xffedd5);
        this.obstacles.push({
          shape,
          speed: setting.enemySpeed + Phaser.Math.Between(-30, 80)
        });
      }

      private updateObstacles(delta: number) {
        for (const obstacle of [...this.obstacles]) {
          obstacle.shape.y += (obstacle.speed * delta) / 1000;

          if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), obstacle.shape.getBounds())) {
            this.endGame();
            return;
          }

          if (obstacle.shape.y > 450) {
            obstacle.shape.destroy();
            this.obstacles = this.obstacles.filter((item) => item !== obstacle);
            this.dodged += 1;
          }
        }
      }

      private currentScore() {
        return Math.floor(this.elapsedSeconds * setting.baseScorePerSecond + this.dodged * 25);
      }

      private endGame() {
        if (this.finished) {
          return;
        }
        this.finished = true;
        onGameOver({
          score: this.currentScore(),
          playTimeSeconds: Math.floor(this.elapsedSeconds),
          dodged: this.dodged
        });
        this.scene.pause();
      }
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 720,
      height: 420,
      backgroundColor: "#0f172a",
      scene: DodgeScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });

    return () => {
      game.destroy(true);
    };
  }, [setting, resetKey, onGameOver]);

  return <div className="game-canvas" ref={containerRef} />;
}
