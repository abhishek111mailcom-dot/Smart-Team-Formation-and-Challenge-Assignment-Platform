import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { sfx } from './soundEffects';

export default function SwordSlashTransition({ onComplete, characterName = 'Zenitsu' }) {
  const [phase, setPhase] = useState('charging'); // 'charging' | 'slashing' | 'splitting' | 'fading'

  const isThunder = characterName?.toLowerCase().includes('zenitsu') || true;
  const bladeAuraColor = isThunder ? '#ffb703' : '#e63946';
  const secondaryAuraColor = isThunder ? '#ffd166' : '#ff4d6d';

  useEffect(() => {
    // 1. Play Katana Draw and air displacement
    sfx.playSwordDrawAndSlash();

    // 2. Play Nakime's iconic Biwa strike on slash cut
    const tBiwa = setTimeout(() => {
      sfx.playNakimeShift();
    }, 220);

    // 3. Trigger Searing Slash Phase
    const tSlash = setTimeout(() => {
      setPhase('slashing');

      // Burst of elemental sparks
      confetti({
        particleCount: 90,
        spread: 110,
        origin: { x: 0.5, y: 0.5 },
        colors: isThunder
          ? ['#ffb703', '#ffd166', '#ffffff', '#fb8500', '#c77dff']
          : ['#e63946', '#ff4d6d', '#ffd166', '#ffffff', '#c77dff']
      });
    }, 220);

    // 4. Split and Slide the Screen Halves Apart
    const tSplit = setTimeout(() => {
      setPhase('splitting');
    }, 440);

    // 5. Smooth Dissolve / Cross-fade into Inner Headquarters
    const tFade = setTimeout(() => {
      setPhase('fading');
    }, 920);

    // 6. Complete Transition
    const tEnd = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1300);

    return () => {
      clearTimeout(tBiwa);
      clearTimeout(tSlash);
      clearTimeout(tSplit);
      clearTimeout(tFade);
      clearTimeout(tEnd);
    };
  }, []);

  return (
    <div className={`sword-slash-overlay ${phase}`}>
      {/* Background Split Halves (Sliding apart organically along the cut line) */}
      <div className={`split-half split-top ${phase === 'splitting' || phase === 'fading' ? 'slide-top' : ''}`}>
        <div className="split-ambient-glass" />
      </div>

      <div className={`split-half split-bottom ${phase === 'splitting' || phase === 'fading' ? 'slide-bottom' : ''}`}>
        <div className="split-ambient-glass" />
      </div>

      {/* Blinding Light Rays Erupting from the Seam */}
      {(phase === 'slashing' || phase === 'splitting' || phase === 'fading') && (
        <div className="sword-seam-burst">
          <div className="seam-core-line" style={{ '--aura': bladeAuraColor }} />
          <div className="seam-glow-rays" />
        </div>
      )}

      {/* Center Impact Kanji Flash: 滅 (Metsu / Slay) with Nakime Dimensional Seal */}
      {(phase === 'slashing' || phase === 'splitting') && (
        <div className="sword-impact-cluster">
          <div
            className="kanji-flash"
            style={{
              color: bladeAuraColor,
              textShadow: `0 0 35px ${bladeAuraColor}, 0 0 70px ${secondaryAuraColor}, 0 0 100px rgba(199, 125, 255, 0.8)`
            }}
          >
            滅
          </div>
          <div className="breathing-form-subtext">
            {isThunder ? '雷の呼吸 壱ノ型 霹靂一閃 神速 • 鳴女 琵琶 転移' : '日の呼吸 円舞 • 鳴女 琵琶 転移'}
          </div>
        </div>
      )}

      {/* The Nichirin Katana Blade Swooping Across the Screen */}
      <div className={`nichirin-sword-actor ${phase}`}>
        <svg
          viewBox="0 0 850 140"
          className="nichirin-katana-svg"
          style={{ filter: `drop-shadow(0 0 16px ${bladeAuraColor}) drop-shadow(0 0 32px ${secondaryAuraColor})` }}
        >
          <defs>
            <linearGradient id="bladeSteel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2b2d42" />
              <stop offset="60%" stopColor="#8d99ae" />
              <stop offset="90%" stopColor="#edf2f4" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            <linearGradient id="hamonWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffd166" />
              <stop offset="50%" stopColor="#ffb703" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            <linearGradient id="goldHilt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd166" />
              <stop offset="50%" stopColor="#e09f3e" />
              <stop offset="100%" stopColor="#9e2a2b" />
            </linearGradient>
          </defs>

          {/* Tsuka (Handle Hilt) */}
          <path
            d="M 20 70 L 160 70 L 160 52 L 20 52 Z"
            fill="#111"
            stroke="#ffb703"
            strokeWidth="1.5"
          />
          {/* Tsuka Diamond Wrap (Menuki Ito) */}
          {[35, 55, 75, 95, 115, 135].map((x, i) => (
            <polygon
              key={i}
              points={`${x},52 ${x + 10},61 ${x},70 ${x - 10},61`}
              fill="#ffb703"
              opacity="0.9"
            />
          ))}

          {/* Kashira (Pommel Cap) */}
          <rect x="15" y="50" width="8" height="22" rx="3" fill="url(#goldHilt)" />

          {/* Tsuba (Handguard - Ornate Circular Disc) */}
          <ellipse cx="165" cy="61" rx="9" ry="24" fill="url(#goldHilt)" stroke="#fff" strokeWidth="1" />
          <ellipse cx="165" cy="61" rx="5" ry="14" fill="#111" />

          {/* Habaki (Blade Collar) */}
          <polygon points="174,53 192,54 192,68 174,69" fill="url(#goldHilt)" />

          {/* Nichirin Curved Steel Katana Blade */}
          <path
            d="M 192 54 Q 520 48 810 50 Q 840 54 845 61 Q 810 68 520 68 L 192 68 Z"
            fill="url(#bladeSteel)"
            stroke="#fff"
            strokeWidth="1"
          />

          {/* Hamon Wave (Wavy Edge of Total Concentration) */}
          <path
            d="M 192 65 Q 260 62 330 66 Q 400 62 470 66 Q 540 61 610 66 Q 680 62 750 65 Q 810 61 845 61"
            fill="none"
            stroke="url(#hamonWave)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Blade Spine (Mune) Highlight */}
          <path
            d="M 192 54 Q 520 48 810 50"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Electrical Sparks / Flame Arcs on Blade */}
          <path
            d="M 320 50 L 335 40 L 330 52 L 345 44"
            fill="none"
            stroke="#ffd166"
            strokeWidth="2"
            opacity="0.8"
          />
          <path
            d="M 580 48 L 595 38 L 590 51 L 605 42"
            fill="none"
            stroke="#ffd166"
            strokeWidth="2"
            opacity="0.8"
          />
          <path
            d="M 720 51 L 735 42 L 730 54 L 745 46"
            fill="none"
            stroke="#ffd166"
            strokeWidth="2"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Searing Diagonal Slash Trail Line */}
      <svg className="slash-trail-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <line
          x1="-100"
          y1="150"
          x2="1100"
          y2="850"
          className={`slash-laser-line ${phase !== 'charging' ? 'active' : ''}`}
          style={{ stroke: bladeAuraColor }}
        />
        <line
          x1="-100"
          y1="150"
          x2="1100"
          y2="850"
          className={`slash-laser-glow ${phase !== 'charging' ? 'active' : ''}`}
          style={{ stroke: '#ffffff' }}
        />
      </svg>
    </div>
  );
}
