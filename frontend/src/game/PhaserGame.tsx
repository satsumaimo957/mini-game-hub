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
      private state: "ready" | "playing" | "ended" = "ready";
      private scoreText!: Phaser.GameObjects.Text;
      private timeText!: Phaser.GameObjects.Text;
      private startOverlay!: Phaser.GameObjects.Container;
      private resultOverlay!: Phaser.GameObjects.Container;

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
        this.showStartScreen();
        this.input.on("pointerdown", () => {
          if (this.state === "ready") {
            this.startGame();
          }
        });
        this.input.keyboard!.on("keydown-SPACE", () => this.startGame());
        this.input.keyboard!.on("keydown-ENTER", () => this.startGame());
      }

      update(_time: number, delta: number) {
        if (this.finished || this.state !== "playing") {
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

      private showStartScreen() {
        this.startOverlay = this.add.container(360, 210);
        const shade = this.add.rectangle(0, 0, 720, 420, 0x020617, 0.78);
        const title = this.add.text(0, -72, "ドッジランナー", {
          align: "center",
          color: "#f8fafc",
          fontFamily: "Arial",
          fontSize: "32px",
          fontStyle: "bold"
        }).setOrigin(0.5);
        const body = this.add.text(0, -16, "落ちてくるブロックを避け続けよう。\n矢印キーまたは WASD で移動できます。", {
          align: "center",
          color: "#dbeafe",
          fontFamily: "Arial",
          fontSize: "18px",
          lineSpacing: 8
        }).setOrigin(0.5);
        const action = this.add.text(0, 82, "クリック / Space / Enter で開始", {
          align: "center",
          color: "#86efac",
          fontFamily: "Arial",
          fontSize: "20px",
          fontStyle: "bold"
        }).setOrigin(0.5);
        this.startOverlay.add([shade, title, body, action]);
      }

      private startGame() {
        if (this.state !== "ready") {
          return;
        }
        this.state = "playing";
        this.startOverlay.destroy();
      }

      private endGame() {
        if (this.finished) {
          return;
        }
        this.finished = true;
        this.state = "ended";
        const finalScore = this.currentScore();
        const finalTime = Math.floor(this.elapsedSeconds);
        onGameOver({
          score: finalScore,
          playTimeSeconds: finalTime,
          dodged: this.dodged
        });
        this.showResultScreen(finalScore, finalTime);
        this.scene.pause();
      }

      private showResultScreen(finalScore: number, finalTime: number) {
        this.resultOverlay = this.add.container(360, 210);
        const shade = this.add.rectangle(0, 0, 720, 420, 0x020617, 0.82);
        const title = this.add.text(0, -92, "リザルト", {
          align: "center",
          color: "#f8fafc",
          fontFamily: "Arial",
          fontSize: "32px",
          fontStyle: "bold"
        }).setOrigin(0.5);
        const score = this.add.text(0, -30, `スコア ${finalScore}`, {
          align: "center",
          color: "#86efac",
          fontFamily: "Arial",
          fontSize: "28px",
          fontStyle: "bold"
        }).setOrigin(0.5);
        const detail = this.add.text(0, 24, `プレイ時間 ${finalTime}s / 回避 ${this.dodged}`, {
          align: "center",
          color: "#dbeafe",
          fontFamily: "Arial",
          fontSize: "18px"
        }).setOrigin(0.5);
        const action = this.add.text(0, 88, "右側のボタンからスコア登録や再プレイができます", {
          align: "center",
          color: "#cbd5e1",
          fontFamily: "Arial",
          fontSize: "16px"
        }).setOrigin(0.5);
        this.resultOverlay.add([shade, title, score, detail, action]);
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
