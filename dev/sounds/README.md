# Sound Assets

Place your audio files here:

## Required Files

1. **`loading.mp3`** (or `.ogg`, `.wav`)
   - Plays while the scene is loading (during LoadingScreen)
   - Recommended: 10-30 seconds, loops seamlessly
   - Volume: ~0.25 (set in Scene.tsx)

2. **`ambient.mp3`** (or `.ogg`, `.wav`)
   - Plays after scene is fully loaded and interactive
   - Recommended: 30-120 seconds, loops seamlessly
   - Volume: ~0.35 (set in Scene.tsx)

## Recommended Specifications

- **Format**: MP3 (widest browser support) or OGG (better compression)
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Bitrate**: 128-192 kbps (balance quality/size)
- **Duration**: Loop-friendly (seamless loop points)
- **File Size**: < 2 MB each for fast loading

## Free Sound Resources

- [Freesound.org](https://freesound.org/) - Creative Commons sounds
- [Pixabay Music](https://pixabay.com/music/) - Free for commercial use
- [OpenGameArt](https://opengameart.org/content/music) - Game-focused assets
- [Zapsplat](https://www.zapsplat.com/) - Free with attribution

## Example Search Terms

- **Loading**: "ambient sci-fi hum", "digital atmosphere", "tech background loop"
- **Ambient**: "room tone", "atmospheric drone", "calm ambient loop", "space ambience"

## Testing

After adding files, run `npm run dev` and:
1. Click anywhere on the page to initialize audio (browser autoplay policy)
2. Loading sound should play during loading screen
3. Should crossfade to ambient sound when scene becomes interactive