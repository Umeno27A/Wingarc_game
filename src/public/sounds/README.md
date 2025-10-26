# MASUMOTALE - Audio Files

このフォルダに音声ファイルとBGMファイルを配置してください。

## 必要なファイル

### キャラクター音声（効果音）

#### MASUMOTO.wav
- MASUMOTOのセリフに使用される音声
- 推奨: 短い効果音（0.05〜0.1秒程度）
- アンダーテール風の「ピッ」という音

#### その他（オプション）
- PLAYER.wav - プレイヤーのセリフ音
- NARRATOR.wav - ナレーション音

### BGM（背景音楽）

#### bgm_title.mp3
- タイトル画面のBGM
- ループ再生されます

#### bgm_battle.mp3
- 戦闘画面のBGM
- ループ再生されます

#### bgm_victory.mp3
- 勝利画面のBGM
- ループ再生されます

#### bgm_defeat.mp3
- 敗北画面のBGM
- 1回のみ再生されます

## 音声ファイルの設定方法

### キャラクター音声
`/utils/audio.ts` の `audioSettings` オブジェクトで設定を変更できます：

```typescript
export const audioSettings = {
  MASUMOTO: {
    audioFile: '/sounds/MASUMOTO.wav',  // ファイルパス
    useAudioFile: true,  // true = 音声ファイル使用、false = 合成音使用
    volume: 0.15  // 音量（0.0〜1.0）
  }
};
```

### BGM
`/utils/bgm.ts` の `bgmSettings` オブジェクトで設定を変更できます：

```typescript
export const bgmSettings = {
  title: {
    file: '/sounds/bgm_title.mp3',  // ファイルパス
    volume: 0.3,  // 音量（0.0〜1.0）
    loop: true,   // ループ再生するか
    enabled: true, // BGMを有効にするか（false で無効化）
  },
  battle: {
    file: '/sounds/bgm_battle.mp3',  // ファイルパス
    volume: 0.5,  // 音量（0.0〜1.0）
    loop: true,   // ループ再生するか
    enabled: true, // BGMを有効にするか（false で無効化）
  },
  victory: {
    file: '/sounds/bgm_victory.mp3',  // ファイルパス
    volume: 0.4,  // 音量（0.0〜1.0）
    loop: true,   // ループ再生するか
    enabled: true, // BGMを有効にするか（false で無効化）
  },
  defeat: {
    file: '/sounds/bgm_defeat.mp3',  // ファイルパス
    volume: 0.4,  // 音量（0.0〜1.0）
    loop: false,  // ループ再生するか
    enabled: true, // BGMを有効にするか（false で無効化）
  },
};
```

## 対応ファイル形式

### 効果音
- .wav（推奨）
- .mp3
- .ogg

### BGM
- .mp3（推奨）
- .ogg
- .wav

## 注意事項

- 音声ファイルが見つからない場合は、自動的に合成音にフォールバックします（効果音のみ）
- BGMファイルが見つからない場合は、エラーメッセージがコンソールに表示されますが、ゲームは続行できます
- ブラウザの自動再生ポリシーにより、最初のインタラクション後に音声/BGMが再生されます
- BGMは画面遷移時に自動的にフェードイン/フェードアウトします（約1秒）