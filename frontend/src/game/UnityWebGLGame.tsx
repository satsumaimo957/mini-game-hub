import { useEffect } from "react";
import type { GameOverResult } from "../types";

interface UnityWebGLGameProps {
  gameSlug: string;
  launchPath: string;
  resetKey: number;
  onGameFinished: (result: GameOverResult) => void;
}

interface UnityScoreMessage {
  type: "UNITY_GAME_FINISHED";
  gameSlug: string;
  score: number;
  playTimeSeconds: number;
}

function isUnityScoreMessage(value: unknown): value is UnityScoreMessage {
  if (!value || typeof value !== "object") {
    return false;
  }
  const data = value as Partial<UnityScoreMessage>;
  return (
    data.type === "UNITY_GAME_FINISHED"
    && typeof data.gameSlug === "string"
    && typeof data.score === "number"
    && typeof data.playTimeSeconds === "number"
  );
}

export function UnityWebGLGame({ gameSlug, launchPath, resetKey, onGameFinished }: UnityWebGLGameProps) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || !isUnityScoreMessage(event.data)) {
        return;
      }
      if (event.data.gameSlug !== gameSlug) {
        return;
      }

      onGameFinished({
        score: Math.max(0, Math.floor(event.data.score)),
        playTimeSeconds: Math.max(0, Math.floor(event.data.playTimeSeconds)),
        dodged: 0
      });
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [gameSlug, onGameFinished]);

  return (
    <iframe
      key={`${gameSlug}-${resetKey}`}
      className="unity-frame"
      title={gameSlug}
      src={launchPath}
      allow="fullscreen; gamepad; autoplay"
    />
  );
}
