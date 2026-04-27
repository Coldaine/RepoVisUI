# AI Audio Model Generation Prompts

These prompts are designed for state-of-the-art AI sound effect generators (like ElevenLabs SFX, Stable Audio, AudioLDM, or Suno) to replace the procedural data-sonification with bespoke, high-end audio textures.

## 1. Tactical / Cyberpunk (High-Tech, Crisp, Data-Driven)

**Vibe:** Near-future HUD, tight transients, highly digital, clean, non-intrusive.

*   **Hover (Healthy):** "Very short, dry digital click, high-frequency subtle data processing blip, clean interface sound, zero reverb, microscopic volume."
*   **Hover (Warning):** "Muted digital UI chirp, mid-frequency triangle wave flutter, short glitchy burst, tech warning notification, 0.2 seconds."
*   **Hover (Critical):** "Low-frequency digital stutter, subtle short electric buzz, heavy tech error UI pulse, ominous but very quick, no tail."
*   **Card Expand (Whoosh):** "Clean digital pneumatic air release mixed with high-tech data scatter, swift left to right pan, swift mechanical unfolding UI sound, 0.4 seconds."
*   **Card Flip (Blip):** "Crisp servo motor whir, fast mechanical shutter click, robotic macro lens focusing, digital UI confirmation chime, very short."
*   **Ambient Texture (Healthy):** "Continuous low-frequency dark atmospheric drone, very subtle rhythmic data transmission telemetry in the background, tense but quiet, looping, no drums, ambient synth."
*   **Ambient Texture (Critical):** "Dark rumbling drone, intermittent analog static, slow pulsing sub-bass, tense sci-fi reactor core room, subtle alarm rhythm in the distance, moody, highly atmospheric."

## 2. Organic / Glassmorphic (Tactile, Material, Warm)

**Vibe:** Physical objects, glass, wood, premium materials, soft impacts, ASMR-like.

*   **Hover (Healthy):** "Soft marimba mallet gently tapping a thick piece of glass, muted resonance, very subtle and warm, UI interaction sound."
*   **Hover (Warning):** "Wooden block struck softly, hollow percussive tap, muted acoustic UI notification, natural materials."
*   **Hover (Critical):** "Subtle cello string plucked tightly, slight dissonance, thick resonance, warning UI sound, acoustic."
*   **Card Expand (Whoosh):** "Whoosh of thick paper or playing cards fanning out, soft fabric sliding against wood, organic transition sweep, 0.4 seconds."
*   **Card Flip (Blip):** "Crystalline glass ping, softly struck, elegant luxury UI confirmation, quick decay, very pleasant."
*   **Ambient Texture:** "Deep ocean pressure wave, very soft acoustic singing bowl resonance blending with wind noise, calming meditation background, extremely subtle evolving texture."

## 3. Abstract / Ethereal (Airy, Minimalist, Synthwave)

**Vibe:** Smooth, airy, musical, analog synthesizers, dreamy.

*   **Hover (Healthy):** "A single soft sine wave ping from an analog synthesizer, high C note, short envelope, warm vintage UI sound."
*   **Hover (Critical):** "A detuned analog oscillator buzz, short metallic synth stab, minimal tech warning tone."
*   **Card Expand (Whoosh):** "White noise envelope fading beautifully, classic Roland Jupiter filter sweep, warm synth transition sound."
*   **Card Flip (Blip):** "A musical fifth interval played quickly on a bell synth, vintage video game menu select sound but modernized, short delay tail."

## Instructions for AI SFX Generation:
1. Always append "short, clean, zero reverb, isolated" for UI interaction sounds, unless you specifically want a messy effect. AI audio models love to add background noise.
2. For Ambient Textures, specify "seamless loop" if the generator supports it.
3. Keep hover durations under 0.2 seconds. Ensure transitions (like expands) are roughly 0.4s to match the CSS/Framer Motion timing.
