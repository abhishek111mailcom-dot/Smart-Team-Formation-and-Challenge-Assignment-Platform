import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Zap, Lock, Mail, Swords, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { sfx } from './soundEffects';
import LiveBackgroundEffect from './LiveBackgroundEffect';
import SwordSlashTransition from './SwordSlashTransition';
import AdminPasscodeModal from './AdminPasscodeModal';

export default function LoginPage({
  onLogin,
  soundEnabled,
  onToggleSound,
  onOpenAdmin,
  activeSoundtrack = 'none',
  onSelectSoundtrack,
  dbStatus
}) {
  const presets = [
    {
      id: 'zenitsu',
      name: 'Zenitsu Agatsuma',
      jp: '我妻 善逸',
      email: 'zenitsu.agatsuma@corps.hq',
      password: 'thunderclap_godspeed_7',
      style: 'Thunder Breathing (雷の呼吸)',
      role: 'Recon Vanguard',
      icon: '⚡',
      color: '#ffb703',
      isAdmin: false
    },
    {
      id: 'tanjiro',
      name: 'Tanjiro Kamado',
      jp: '竈門 炭治郎',
      email: 'tanjiro.kamado@corps.hq',
      password: 'sun_water_dance_12',
      style: 'Sun & Water Breathing (日の呼吸 / 水の呼吸)',
      role: 'Vanguard Leader',
      icon: '☀️',
      color: '#06d6a0',
      isAdmin: false
    },
    {
      id: 'ubuyashiki',
      name: 'Master Ubuyashiki',
      jp: '産屋敷 耀哉',
      email: 'oyakata.sama@corps.hq',
      password: 'kagaya_eternal_feeling',
      style: 'Supreme Commander (総司令官)',
      role: 'Head of Corps (Admin)',
      icon: '⛩️',
      color: '#ffd166',
      isAdmin: true
    }
  ];

  const [activePreset, setActivePreset] = useState('zenitsu');
  const activePresetObj = presets.find(p => p.id === activePreset) || presets[0];

  const [email, setEmail] = useState(presets[0].email);
  const [password, setPassword] = useState(presets[0].password);
  const [isSlashing, setIsSlashing] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);

  const handleSelectPreset = (p) => {
    setActivePreset(p.id);
    setEmail(p.email);
    setPassword(p.password);
    sfx.playSlash();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const chosen = {
      id: activePresetObj.id,
      name: activePresetObj.id === activePreset ? activePresetObj.name : email.split('@')[0],
      jp: activePresetObj.jp,
      email,
      style: activePresetObj.style,
      role: activePresetObj.role,
      icon: activePresetObj.icon,
      color: activePresetObj.color,
      isAdmin: activePresetObj.isAdmin || email.toLowerCase().includes('oyakata') || email.toLowerCase().includes('admin')
    };

    setPendingUser(chosen);
    setIsSlashing(true);
  };

  const handleSlashComplete = () => {
    if (pendingUser && onLogin) {
      onLogin(pendingUser);
    }
  };

  return (
    <div className={`login-page-container ${isSlashing ? 'slashing-mode' : ''}`}>
      {/* Cinematic Nichirin Katana Sword Slash Animation on Login */}
      {isSlashing && (
        <SwordSlashTransition
          characterName={pendingUser?.name || 'Zenitsu'}
          onComplete={handleSlashComplete}
        />
      )}

      {/* Live Procedural Lightning & Thunder Particle Canvas */}
      <LiveBackgroundEffect mode="thunder" />

      {/* Animated subtle electrical thunder ambient overlay */}
      <div className="login-thunder-ambient"></div>

      {/* Floating Header with Audio Controls & Direct Admin Entry */}
      <div className="login-top-bar">
        <div className="login-gate-badge">
          <span style={{ color: '#ffb703', fontWeight: 900 }}>⚡ 雷の呼吸</span>
          <span>Thunderclap & Flash Dispatch Gate</span>
          {dbStatus && (
            <span
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10.5px',
                fontWeight: 700,
                background: dbStatus.connected ? 'rgba(6, 214, 160, 0.2)' : 'rgba(255, 183, 3, 0.2)',
                color: dbStatus.connected ? '#06d6a0' : '#ffd166',
                border: `1px solid ${dbStatus.connected ? '#06d6a0' : '#ffb703'}`
              }}
              title={dbStatus.connected ? 'Connected to Supabase PostgreSQL' : 'Operating on in-memory Demon Slayer canon lore'}
            >
              {dbStatus.connected ? '● Supabase DB' : '○ In-Memory DB'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Track 1: Nakime Biwa Infinity Castle */}
          <button
            type="button"
            onClick={() => onSelectSoundtrack && onSelectSoundtrack('nakime')}
            className="btn-secondary"
            style={{
              background: activeSoundtrack === 'nakime' ? 'rgba(255, 183, 3, 0.22)' : 'rgba(10, 14, 25, 0.85)',
              borderColor: activeSoundtrack === 'nakime' ? '#ffb703' : 'rgba(157, 78, 221, 0.4)',
              boxShadow: activeSoundtrack === 'nakime' ? '0 0 14px rgba(255, 183, 3, 0.4)' : 'none',
              padding: '5px 11px',
              fontSize: '11px',
              backdropFilter: 'blur(8px)'
            }}
            title="Listen to Nakime's Biwa (Infinity Castle Guitar Soundtrack)"
          >
            <span>🪕</span>
            <span style={{ color: activeSoundtrack === 'nakime' ? '#ffd166' : '#ffecd1' }}>
              {activeSoundtrack === 'nakime' ? "Biwa: Playing" : "Nakime Biwa"}
            </span>
          </button>

          {/* Track 2: Kamado Tanjiro no Uta / Hinokami Kagura Theme */}
          <button
            type="button"
            onClick={() => onSelectSoundtrack && onSelectSoundtrack('tanjiro')}
            className="btn-secondary"
            style={{
              background: activeSoundtrack === 'tanjiro' ? 'rgba(6, 214, 160, 0.22)' : 'rgba(10, 14, 25, 0.85)',
              borderColor: activeSoundtrack === 'tanjiro' ? '#06d6a0' : 'rgba(6, 214, 160, 0.4)',
              boxShadow: activeSoundtrack === 'tanjiro' ? '0 0 14px rgba(6, 214, 160, 0.4)' : 'none',
              padding: '5px 11px',
              fontSize: '11px',
              backdropFilter: 'blur(8px)'
            }}
            title="Listen to Kamado Tanjiro no Uta (Hinokami Kagura Flute & Taiko Soundtrack)"
          >
            <span>☀️</span>
            <span style={{ color: activeSoundtrack === 'tanjiro' ? '#06d6a0' : '#ffecd1' }}>
              {activeSoundtrack === 'tanjiro' ? "Tanjiro: Playing" : "Tanjiro OST"}
            </span>
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="btn-secondary"
            style={{
              background: 'rgba(10, 14, 25, 0.85)',
              backdropFilter: 'blur(8px)',
              borderColor: 'rgba(255, 183, 3, 0.35)',
              padding: '5px 10px',
              fontSize: '11px'
            }}
            title="Toggle Procedural Audio Effects"
          >
            {soundEnabled ? <Volume2 size={13} color="#ffb703" /> : <VolumeX size={13} color="#9ba1b0" />}
          </button>

          {/* Direct Admin Console Access Button in Top Bar */}
          <button
            type="button"
            onClick={() => {
              sfx.playNakimeShift();
              setIsPasscodeModalOpen(true);
            }}
            className="btn-secondary"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 12, 38, 0.88) 0%, rgba(14, 8, 22, 0.95) 100%)',
              borderColor: 'rgba(157, 78, 221, 0.65)',
              boxShadow: '0 0 16px rgba(157, 78, 221, 0.35)',
              color: '#e0aaff',
              padding: '5px 12px',
              fontSize: '11.5px',
              fontWeight: 800,
              backdropFilter: 'blur(8px)'
            }}
            title="Access Kokushibo Moon Admin Console (Requires Passcode Clearance)"
          >
            <ShieldAlert size={13} color="#c77dff" />
            <span>🌙 Kokushibo Admin Console</span>
          </button>
        </div>
      </div>

      {/* Compact & Adjustable Glassmorphic Login Card */}
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

        {/* 3 Quick Concise Preset Pills */}
        <div className="login-presets-compact">
          {presets.map(p => (
            <button
              key={p.id}
              type="button"
              className={`preset-pill-compact ${activePreset === p.id ? 'active' : ''}`}
              onClick={() => handleSelectPreset(p)}
              title={`${p.name} - ${p.style}`}
            >
              <span style={{ fontSize: '15px' }}>{p.icon}</span>
              <span>{p.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Clean Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginBottom: '4px' }}>
              <Mail size={13} color="#ffb703" /> Corps Identifier / Raven Mail
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. zenitsu.agatsuma@corps.hq"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginBottom: '4px' }}>
              <Lock size={13} color="#ffb703" /> Nichirin Passphrase
            </label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode"
            />
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '13px',
              justifyContent: 'center',
              boxShadow: '0 0 22px rgba(255, 183, 3, 0.45)'
            }}
          >
            <Zap size={16} fill="#0b0d13" />
            <span>Draw Blade & Enter Corps (全集中 抜刀)</span>
          </button>
        </form>

        {/* Direct Admin Panel Option in Login Card */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 183, 3, 0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#ffd166', letterSpacing: '0.06em', marginBottom: '6px', fontWeight: 800 }}>
            COMMAND OVERRIDE CLEARANCE
          </div>
          <button
            type="button"
            onClick={() => {
              sfx.playNakimeShift();
              setIsPasscodeModalOpen(true);
            }}
            className="btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 800,
              borderColor: 'rgba(157, 78, 221, 0.6)',
              background: 'linear-gradient(135deg, rgba(30, 12, 38, 0.8) 0%, rgba(14, 8, 22, 0.9) 100%)',
              color: '#e0aaff',
              boxShadow: '0 0 16px rgba(157, 78, 221, 0.3)',
              borderRadius: '8px'
            }}
          >
            <ShieldAlert size={14} color="#c77dff" />
            <span>Open Kokushibo Moon Admin Console (上弦の壱 司令盤)</span>
          </button>
        </div>

        <div className="login-quote-strip">
          "Hone that single sword technique until it becomes supreme. Become the lightning itself."
          <div style={{ marginTop: '3px', color: '#ffb703', fontWeight: 700, fontSize: '10px' }}>
            雷の呼吸 壱ノ型 霹靂一閃 (Thunderclap and Flash)
          </div>
        </div>
      </div>

      {/* Admin Passcode Clearance Gate Modal */}
      <AdminPasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onSuccess={() => {
          setIsPasscodeModalOpen(false);
          if (onOpenAdmin) onOpenAdmin();
        }}
      />
    </div>
  );
}
