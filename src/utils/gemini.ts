export async function generateMasumotoLine(
  turnCount: number,
  phase: number,
  shootCount: number
): Promise<string> {
  return getDefaultLine(phase, shootCount);
}

function getDefaultLine(phase: number, shootCount: number): string {
  const lines = {
    phase1: [
      "いくぞ！",
      "まだまだ甘い！",
      "ゴールは渡さん！",
      "このボールを止めろ！",
      "まずはウォーミングアップだ！",
      "油断するなよ！",
      "こんなもんじゃない！",
      "キーパーの壁は厚いぞ！",
    ],
    phase2: [
      "本気でいくぞ！",
      "まだまだこれからだ！",
      "避けられるかな！",
      "ここからが本番だ！",
      "本気のセーブを見せる！",
      "スピードアップだ！",
      "これが真の力だ！",
      "もう容赦しない！",
    ],
    phase3: [
      "全力でいく！",
      "本気の本気だ！",
      "これが限界突破！",
      "全ての技を見せる！",
      "絶対に止める！",
      "究極の守備だ！",
      "これが最終形態！",
      "俺の本気を受けろ！",
      "避けられるものか！",
      "北九州の魂だ！",
    ],
  };

  const phaseKey = phase === 3 ? "phase3" : phase === 2 ? "phase2" : "phase1";
  const phaseLines = lines[phaseKey];
  return phaseLines[Math.floor(Math.random() * phaseLines.length)];
}