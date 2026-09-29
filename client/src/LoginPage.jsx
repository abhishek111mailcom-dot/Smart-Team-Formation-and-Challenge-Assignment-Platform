import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Zap, Lock, Mail, Swords, Volume2, VolumeX, Shield, Sparkles } from 'lucide-react';
import { sfx } from './soundEffects';

export default function LoginPage({ onLogin, soundEnabled, onToggleSound }) {
  const [email, setEmail] = useState('zenitsu.agatsuma@corps.hq');
  const [password, setPassword] = useState('thunderclap_godspeed_7');
  const [breathingStyle, setBreathingStyle] = useState('Thunder Breathing (雷の呼吸)');
  const [activePreset, setActivePreset] = useState('zenitsu');

  const presets = [
    {
      id: 'zenitsu',
      name: 'Zenitsu Agatsuma',
      jp: '我妻 善逸',
      email: 'zenitsu.agatsuma@corps.hq',
      style: 'Thunder Breathing (雷の呼吸)',
      role: 'Recon Vanguard',
      icon: '⚡'
    },
    {
      id: 'ubuyashiki',
      name: 'Master Ubuyashiki',
      jp: '産屋敷 耀哉',
      email: 'oyakata.sama@corps.hq',
      style: 'Supreme Commander (総司令官)',
      role: 'Head of Corps',
      icon: '⛩️'
    },
    {
      id: 'tomioka',
      name: 'Giyu Tomioka',
      jp: '冨岡 義勇',
      email: 'giyu.tomioka@corps.hq',
      style: 'Water Breathing (水の呼吸)',
      role: 'Water Hashira',
      icon: '🌊'
    }
  ];

  const handleSelectPreset = (p) => {
    setActivePreset(p.id);
    setEmail(p.email);
    setPassword('••••••••••••');
    setBreathingStyle(p.style);
    sfx.playSlash();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sfx.playSlash();
    
    // Confetti thunder celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.55 },
      colors: ['#ffb703', '#fb8500', '#ffffff', '#ffd166']
    });

    const chosen = presets.find(p => p.id === activePreset) || {
      name: email.split('@')[0],
      jp: '隊士',
      email,
      style: breathingStyle,
      role: 'Demon Slayer'
    };

    onLogin(chosen);
  };

  return (
    <div className="login-page-container">
      {/* Animated subtle electrical thunder ambient overlay */}
      <div className="login-thunder-ambient"></div>

      {/* Top Bar inside Login Screen */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '28px',
        right: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 20
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(10, 14, 25, 0.75)',
          padding: '6px 14px',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 183, 3, 0.35)',
          backdropFilter: 'blur(8px)'
        }}>
          <span style={{ color: '#ffb703', fontWeight: 900 }}>⚡ 雷の呼吸</span>
          <span style={{ fontSize: '12px', color: '#ffecd1' }}>Thunder Breathing Dispatch Gate</span>
        </div>

        <button
          onClick={onToggleSound}
          className="btn-secondary"
          style={{ background: 'rgba(10, 14, 25, 0.75)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255, 183, 3, 0.4)' }}
          title="Toggle Procedural Audio Effects"
        >
          {soundEnabled ? <Volume2 size={16} color="#ffb703" /> : <VolumeX size={16} color="#9ba1b0" />}
          <span style={{ color: soundEnabled ? '#ffd166' : '#9ba1b0' }}>{soundEnabled ? "Audio On" : "Muted"}</span>
        </button>
      </div>

      {/* Floating Glassmorphic Login Card */}
      <div className="login-glass-card">
        <div className="login-card-head">
          <div className="login-crest-box">
            <span>雷</span>
          </div>

          <h2 className="login-title">
            DEMON SLAYER CORPS
          </h2>
          <div className="login-subtitle">
            鬼殺隊 司令部認証関門 • KASUGAI DISPATCH
          </div>
        </div>

        {/* Quick Access Presets for instant 1-click testing */}
        <div style={{ marginBottom: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select Slayer Identity Preset:
        </div>
        <div className="login-quick-presets">
          {presets.map(p => (
            <div
              key={p.id}
              className={`preset-chip ${activePreset === p.id ? 'active' : ''}`}
              onClick={() => handleSelectPreset(p)}
            >
              <span style={{ fontSize: '16px' }}>{p.icon}</span>
              <span>{p.name.split(' ')[0]}</span>
              <span style={{ fontSize: '9px', opacity: 0.8, fontFamily: 'var(--font-jp)' }}>{p.jp}</span>
            </div>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={13} color="#ffb703" /> Corps Identifier / Raven Mail
            </label>
            <input
              type="text"
              required
              className="form-input"
              style={{ borderColor: 'rgba(255, 183, 3, 0.35)' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. zenitsu.agatsuma@corps.hq"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} color="#ffb703" /> Nichirin Seal Passphrase
            </label>
            <input
              type="password"
              required
              className="form-input"
              style={{ borderColor: 'rgba(255, 183, 3, 0.35)' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={13} color="#ffb703" /> Breathing Discipline & Station
            </label>
            <input
              type="text"
              readOnly
              className="form-input"
              style={{ background: 'rgba(255, 183, 3, 0.08)', color: '#ffd166', borderColor: 'rgba(255, 183, 3, 0.35)' }}
              value={breathingStyle}
            />
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '14px',
              justifyContent: 'center',
              marginTop: '8px',
              boxShadow: '0 0 25px rgba(255, 183, 3, 0.45)'
            }}
          >
            <Zap size={18} fill="#0b0d13" />
            <span>Draw Blade & Enter Corps (抜刀・全集中 突入)</span>
          </button>
        </form>

        <div className="login-quote-strip">
          "Even if you feel weak, hone that single sword technique until it becomes supreme. Become the lightning itself."
          <div style={{ marginTop: '4px', color: '#ffb703', fontWeight: 700 }}>
            雷の呼吸 壱ノ型 霹靂一閃 (Thunderclap and Flash)
          </div>
        </div>
      </div>
    </div>
  );
}
