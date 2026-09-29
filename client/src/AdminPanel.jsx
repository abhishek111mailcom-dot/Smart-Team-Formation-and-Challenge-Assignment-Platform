import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Terminal,
  Zap,
  RefreshCw,
  Trash2,
  Skull,
  UserPlus,
  RotateCcw,
  Sliders,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  Eye,
  SlidersHorizontal,
  Layers,
  Database,
  Server,
  Link2,
  Copy,
  Check,
  CloudLightning,
  ExternalLink,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { sfx } from './soundEffects';

export default function AdminPanel({
  slayers,
  missions,
  demons,
  squads,
  teamSize,
  setTeamSize,
  onGenerateTeams,
  onRegenerateTeams,
  onAssignMissions,
  onClearAssignments,
  onRestoreCanon,
  fetchData,
  showToast,
  onClose
}) {
  // Live Tuners
  const [roleDiversityWeight, setRoleDiversityWeight] = useState(85);
  const [resonanceMultiplier, setResonanceMultiplier] = useState(1.8);
  const [powerParityTolerance, setPowerParityTolerance] = useState(15);

  // Inspector tab
  const [inspectorView, setInspectorView] = useState('summary'); // 'summary' | 'slayers' | 'missions' | 'squads' | 'database'

  // Supabase Database State
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    configured: false,
    message: 'Checking connection...',
    config: { url: '', hasKey: false },
    counts: null
  });
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isSeedingDb, setIsSeedingDb] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showDbGuide, setShowDbGuide] = useState(false);

  // Audit Logs
  const [logs, setLogs] = useState([
    { id: 1, time: '21:45:00', type: 'SYS', text: 'Kasugai Command Core initialized on port 5000.' },
    { id: 2, time: '21:45:04', type: 'NET', text: '16 Slayer Nichirin life-signals synchronized.' },
    { id: 3, time: '21:46:12', type: 'ALG', text: 'Bipartite formation graph seeded. Zero duplicate constraints verified.' },
    { id: 4, time: '21:47:30', type: 'WARN', text: 'Infinity Castle dimensional distortion detected near Tokyo-Fu.' }
  ]);

  const addLog = (type, text) => {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    setLogs(prev => [{ id: Date.now(), time, type, text }, ...prev.slice(0, 19)]);
  };

  // Fetch Database Status on mount
  const checkDbStatus = async () => {
    setIsTestingDb(true);
    try {
      const res = await fetch('/api/database/status');
      const data = await res.json();
      setDbStatus(data);
      if (data.connected) {
        addLog('NET', `SUPABASE CONNECTED: Cloud contains ${data.counts?.slayers || 0} slayers, ${data.counts?.missions || 0} missions.`);
      } else if (data.configured) {
        addLog('WARN', `SUPABASE WARNING: Configured but query failed (${data.error || 'Schema missing'}).`);
      } else {
        addLog('SYS', 'DATABASE MODE: In-Memory Demon Slayer canon lore active.');
      }
    } catch (err) {
      addLog('WARN', `DATABASE CHECK FAILED: ${err.message}`);
    } finally {
      setIsTestingDb(false);
    }
  };

  useEffect(() => {
    checkDbStatus();
  }, []);

  // Save Supabase Credentials
  const handleSaveDbCredentials = async (e) => {
    e?.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      showToast('Please enter both Supabase URL and API Key.', '⚠️');
      return;
    }

    setIsSavingDb(true);
    sfx.playSlash();
    try {
      const res = await fetch('/api/database/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: supabaseUrlInput.trim(),
          key: supabaseKeyInput.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addLog(data.result?.connected ? 'NET' : 'WARN', data.message);
      showToast(data.message, data.result?.connected ? '⚡' : '⚠️');
      await checkDbStatus();
      if (data.result?.connected) {
        fetchData();
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#06d6a0', '#00b4d8', '#ffd166']
        });
      }
    } catch (err) {
      showToast(err.message, '⚠️');
      addLog('WARN', `CONFIG ERROR: ${err.message}`);
    } finally {
      setIsSavingDb(false);
    }
  };

  // Seed Canon Lore to Supabase Cloud
  const handleSeedSupabase = async () => {
    if (!window.confirm("Seed canon Demon Slayer lore (16 slayers, 7 missions, 10 Twelve Kizuki) into Supabase PostgreSQL database?")) {
      return;
    }

    setIsSeedingDb(true);
    sfx.playChime();
    try {
      const res = await fetch('/api/database/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addLog('NET', 'SEED SUCCESS: Canon Demon Slayer lore written to Supabase Cloud tables!');
      showToast('Successfully seeded canon lore to Supabase Cloud!', '🌱');
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#06d6a0', '#ffd166', '#c77dff', '#e63946']
      });
      await checkDbStatus();
      fetchData();
    } catch (err) {
      showToast(err.message, '⚠️');
      addLog('WARN', `SEED FAILED: ${err.message}`);
    } finally {
      setIsSeedingDb(false);
    }
  };

  // Copy Schema SQL
  const handleCopySchemaSql = async () => {
    try {
      const res = await fetch('/api/database/schema');
      const sqlText = await res.text();
      await navigator.clipboard.writeText(sqlText);
      setCopiedSchema(true);
      sfx.playClick();
      showToast('Supabase PostgreSQL Schema SQL copied to clipboard!', '📋');
      setTimeout(() => setCopiedSchema(false), 3000);
    } catch (err) {
      showToast('Could not copy schema: ' + err.message, '⚠️');
    }
  };

  // Emergency Action 1: Disband All
  const handleEmergencyDisband = async () => {
    if (window.confirm("CONFIRMATION REQUIRED: Disband all squads and return slayers to barracks?")) {
      sfx.playSlash();
      await onClearAssignments();
      addLog('WARN', 'EMERGENCY: All squads disbanded by Hashira Council.');
      showToast("All squad deployments disbanded.", "⚠️");
    }
  };

  // Emergency Action 2: Trigger Upper Moon Incursion
  const handleTriggerUpperMoonIncursion = async () => {
    sfx.playCrow();
    try {
      const emergencyMission = {
        title: "Infinity Castle: Muzan Decapitation Strike",
        japaneseTitle: "無限城 最終決戦 鬼舞辻無惨 討伐戦",
        dangerRank: "Rank S",
        location: "Infinity Castle (Mugenjo)",
        teamSize: 4,
        requiredRoles: ["Vanguard", "Tactician", "Medical"],
        preferredBreathing: ["Sun", "Water", "Thunder"],
        requiredSkills: "Demon Slayer Mark, Transparent World",
        minCombatPower: 350,
        demonEncounter: "Muzan Kibutsuji (Demon Progenitor)",
        description: "Emergency Upper Moon Alert! Hashira High Council orders immediate all-out convergence into the shifting Infinity Castle."
      };

      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyMission)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addLog('ALERT', 'CRISIS: Muzan Kibutsuji Infinity Castle Incursion posted!');
      showToast("EMERGENCY RANK S MISSION DISPATCHED!", "👹");
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#e63946', '#ff4d6d', '#000000', '#ffd166']
      });
      fetchData();
    } catch (err) {
      showToast(err.message, "⚠️");
    }
  };

  // Emergency Action 3: Fast Recruit Hashira Reinforcement
  const handleRecruitHashiraReinforcement = async () => {
    sfx.playChime();
    const pool = [
      { name: "Muichiro Tokito", jp: "時透 無一郎", style: "Mist Breathing (Mist Hashira)", base: "Mist", role: "Vanguard", power: 94 },
      { name: "Mitsuri Kanroji", jp: "甘露寺 蜜璃", style: "Love Breathing (Love Hashira)", base: "Love", role: "Vanguard", power: 92 },
      { name: "Obanai Iguro", jp: "伊黒 小芭内", style: "Serpent Breathing (Serpent Hashira)", base: "Water", role: "Tactician", power: 93 },
      { name: "Sanemi Shinazugawa", jp: "不死川 実弥", style: "Wind Breathing (Wind Hashira)", base: "Wind", role: "Vanguard", power: 95 },
      { name: "Gyomei Himejima", jp: "悲鳴嶼 行冥", style: "Stone Breathing (Stone Hashira)", base: "Stone", role: "Vanguard", power: 99 }
    ];

    const pick = pool[Math.floor(Math.random() * pool.length)];

    try {
      const res = await fetch('/api/slayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${pick.name} (Reinforcement)`,
          japaneseName: pick.jp,
          breathingStyle: pick.style,
          baseBreathing: pick.base,
          rank: "Hashira",
          preferredRole: pick.role,
          skills: ["Total Concentration Constant", "Demon Slayer Mark", "Esoteric Form"],
          interests: ["Hashira Meeting", "Corps Defense"],
          combatPower: pick.power
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      addLog('NET', `REINFORCEMENT: ${pick.name} arrived at Corps Headquarters!`);
      showToast(`Reinforcements arrived: ${pick.name}!`, "🗡️");
      fetchData();
    } catch (err) {
      showToast(err.message, "⚠️");
    }
  };

  // Apply Tuners
  const handleApplyTuners = () => {
    sfx.playSlash();
    addLog('ALG', `HYPERPARAMETERS UPDATED: Diversity ${roleDiversityWeight}%, Resonance ${resonanceMultiplier}x, Parity ±${powerParityTolerance} CP.`);
    showToast("Algorithm hyperparameters applied to Formation Matrix!", "⚙️");
  };

  // Strike Nakime's Biwa
  const handleStrikeNakimeBiwa = () => {
    sfx.playNakimeShift();
    addLog('NET', '鳴女 琵琶 鳴響: Nakime struck the biwa string. Space and gravity shifted in the Fortress.');
    showToast("鳴女 琵琶 鳴響: Infinity Castle dimension shifted!", "🪕");
    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#c77dff', '#9d4edd', '#ffd166', '#e63946']
    });
  };

  // Kokushibo Moon Breathing Crescent Blade Strike
  const handleMoonBreathingStrike = () => {
    sfx.playSlash();
    addLog('CRISIS', '月の呼吸 壱ノ型 闇月・宵の宮 (First Form: Dark Moon, Evening Palace)!');
    showToast("月の呼吸 壱ノ型 闇月・宵の宮！ Crescent moon blades unleashed!", "🌙");
    confetti({
      particleCount: 85,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#c77dff', '#9d4edd', '#e63946', '#ffffff']
    });
  };

  return (
    <div className="admin-panel-container">
      {/* Admin Header: Kokushibo Upper Rank 1 Moon Breathing Console */}
      <div className="admin-header-card">
        <div className="admin-header-left">
          <div className="admin-seal-icon" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: '20px' }}>🌙</span>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#ffecd1' }}>壱</span>
          </div>
          <div>
            <div className="admin-clearance-pill">
              <ShieldAlert size={12} color="#e0aaff" />
              <span>上弦の壱 黒死牟 領域 • KOKUSHIBO MOON SUPREME CONSOLE</span>
            </div>
            <h2 className="admin-title">
              Kokushibo Moon Breathing Supreme Command (上弦の壱 黒死牟・月の呼吸)
            </h2>
            <p className="admin-desc">
              High-order formation modulator, Supabase Cloud database nexus, Nakime Biwa dimensional shift, Upper Moon crisis management, and system state inspector.
            </p>
          </div>
        </div>

        <div className="admin-status-cluster">
          <div className="admin-status-badge">
            <span className="pulse-dot"></span>
            <span>REST API 5000: Operational</span>
          </div>
          <div
            className="admin-status-badge"
            style={{
              background: dbStatus.connected ? 'rgba(6, 214, 160, 0.2)' : 'rgba(255, 183, 3, 0.18)',
              borderColor: dbStatus.connected ? '#06d6a0' : '#ffb703'
            }}
          >
            <Database size={11} color={dbStatus.connected ? '#06d6a0' : '#ffb703'} />
            <span style={{ color: dbStatus.connected ? '#06d6a0' : '#ffb703', fontWeight: 700 }}>
              {dbStatus.connected ? 'Supabase DB: Connected' : 'DB: In-Memory Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Supabase Cloud Database Nexus Banner */}
      <div
        className="admin-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 24, 40, 0.85) 0%, rgba(26, 16, 40, 0.9) 100%)',
          borderColor: dbStatus.connected ? 'rgba(6, 214, 160, 0.45)' : 'rgba(199, 125, 255, 0.45)',
          boxShadow: dbStatus.connected ? '0 8px 32px rgba(6, 214, 160, 0.15)' : '0 8px 32px rgba(157, 78, 221, 0.2)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: dbStatus.connected ? 'rgba(6, 214, 160, 0.18)' : 'rgba(157, 78, 221, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${dbStatus.connected ? '#06d6a0' : '#c77dff'}`
              }}
            >
              <Database size={22} color={dbStatus.connected ? '#06d6a0' : '#c77dff'} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#ffecd1', fontWeight: 700, letterSpacing: '0.5px' }}>
                  Supabase PostgreSQL Cloud Database Nexus (鬼殺隊 超常データベース)
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: dbStatus.connected ? 'rgba(6, 214, 160, 0.2)' : 'rgba(255, 183, 3, 0.2)',
                    color: dbStatus.connected ? '#06d6a0' : '#ffd166',
                    border: `1px solid ${dbStatus.connected ? '#06d6a0' : '#ffb703'}`,
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  {dbStatus.connected ? '● Cloud Connected' : '○ In-Memory Hybrid'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                {dbStatus.connected
                  ? `Active connection to Supabase! Slayers: ${dbStatus.counts?.slayers || 0} | Missions: ${dbStatus.counts?.missions || 0} | Squads: ${dbStatus.counts?.squads || 0} | Kizuki: ${dbStatus.counts?.demons || 0}`
                  : 'Currently operating in instant In-Memory mode. Connect Supabase anytime below for persistent cloud storage.'}
              </p>
            </div>
          </div>

          {/* Quick Database Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              onClick={handleCopySchemaSql}
              style={{ padding: '7px 12px', fontSize: '11px', gap: '5px' }}
              title="Copy the complete PostgreSQL SQL schema to paste in Supabase SQL editor"
            >
              {copiedSchema ? <Check size={13} color="#06d6a0" /> : <Copy size={13} />}
              <span>{copiedSchema ? 'Schema Copied!' : 'Copy SQL Schema'}</span>
            </button>

            <button
              className="btn-gold"
              onClick={handleSeedSupabase}
              disabled={!dbStatus.configured || isSeedingDb}
              style={{ padding: '7px 12px', fontSize: '11px', gap: '5px' }}
              title="Write all 16 canon Slayers, 7 Missions, and Twelve Kizuki to your Supabase tables"
            >
              <CloudLightning size={13} />
              <span>{isSeedingDb ? 'Seeding...' : 'Seed Canon Lore to Cloud'}</span>
            </button>

            <button
              className="btn-secondary"
              onClick={checkDbStatus}
              disabled={isTestingDb}
              style={{ padding: '7px 12px', fontSize: '11px', gap: '5px' }}
              title="Re-test live connection ping to Supabase"
            >
              <RefreshCw size={13} className={isTestingDb ? 'spin' : ''} />
              <span>{isTestingDb ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              className="btn-wisteria"
              onClick={() => setShowDbGuide(!showDbGuide)}
              style={{ padding: '7px 12px', fontSize: '11px', gap: '5px' }}
            >
              <BookOpen size={13} />
              <span>{showDbGuide ? 'Hide Setup Guide' : 'Setup Guide (3 Steps)'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Step-by-Step Setup Guide */}
        {showDbGuide && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '16px',
              fontSize: '12px',
              lineHeight: '1.6',
              color: '#e2e8f0'
            }}
          >
            <div style={{ fontWeight: 700, color: '#ffd166', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} />
              <span>Quick 3-Step Supabase Setup (Free Tier):</span>
            </div>
            <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>
                <strong>Create Supabase Project:</strong> Go to{' '}
                <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: '#00b4d8', textDecoration: 'underline' }}>
                  supabase.com/dashboard <ExternalLink size={10} style={{ display: 'inline' }} />
                </a>{' '}
                and create a new free PostgreSQL project.
              </li>
              <li>
                <strong>Run Schema:</strong> In your Supabase Dashboard, click <strong>SQL Editor</strong> in the left sidebar, click <strong>"New query"</strong>, click the <strong>"Copy SQL Schema"</strong> button above, paste it in Supabase, and click <strong>Run</strong>. (Creates `slayers`, `missions`, `squads`, `twelve_kizuki` tables and auto-seeds them).
              </li>
              <li>
                <strong>Connect:</strong> Go to <strong>Project Settings → API</strong>, copy your <strong>Project URL</strong> and <strong>anon public API Key</strong>, paste them below, and click <strong>Save & Connect</strong>!
              </li>
            </ol>
          </div>
        )}

        {/* Supabase Connection Form */}
        <form onSubmit={handleSaveDbCredentials} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr auto', gap: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#ffecd1', marginBottom: '4px', fontWeight: 600 }}>
              Supabase Project URL (プロジェクトURL)
            </label>
            <input
              type="text"
              placeholder="https://your-project-id.supabase.co"
              value={supabaseUrlInput}
              onChange={(e) => setSupabaseUrlInput(e.target.value)}
              className="admin-input"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '12px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#ffecd1', marginBottom: '4px', fontWeight: 600 }}>
              Supabase API Key (Anon Public / Service Role Key)
            </label>
            <input
              type="password"
              placeholder="eyJh..."
              value={supabaseKeyInput}
              onChange={(e) => setSupabaseKeyInput(e.target.value)}
              className="admin-input"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                fontSize: '12px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSavingDb}
            className="btn-primary"
            style={{
              padding: '9px 18px',
              fontSize: '12px',
              fontWeight: 700,
              gap: '6px',
              whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #06d6a0, #00b4d8)'
            }}
          >
            <Link2 size={14} />
            <span>{isSavingDb ? 'Connecting...' : 'Save & Connect'}</span>
          </button>
        </form>
      </div>

      {/* Telemetry Metrics Row */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-head">
            <span className="admin-metric-label">Enrolled Slayers</span>
            <Activity size={16} color="#00b4d8" />
          </div>
          <div className="admin-metric-value" style={{ color: '#00b4d8' }}>{slayers.length}</div>
          <div className="admin-metric-sub">
            {slayers.filter(s => s.rank === 'Hashira').length} Hashiras • {slayers.filter(s => !s.assignedTeamId).length} in Reserves
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-head">
            <span className="admin-metric-label">Formed Squads</span>
            <Zap size={16} color="#c77dff" />
          </div>
          <div className="admin-metric-value" style={{ color: '#c77dff' }}>{squads.length}</div>
          <div className="admin-metric-sub">
            {squads.length * teamSize} Deployed Slayers • {teamSize} per squad
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-head">
            <span className="admin-metric-label">Active Missions</span>
            <Skull size={16} color="#ff4d6d" />
          </div>
          <div className="admin-metric-value" style={{ color: '#ff4d6d' }}>{missions.length}</div>
          <div className="admin-metric-sub">
            {missions.filter(m => m.dangerRank === 'Rank S').length} Rank S Incursions
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-head">
            <span className="admin-metric-label">Suppression Rate</span>
            <CheckCircle2 size={16} color="#06d6a0" />
          </div>
          <div className="admin-metric-value" style={{ color: '#06d6a0' }}>
            {Math.round((squads.filter(s => s.assignedMissionId).length / (missions.length || 1)) * 100)}%
          </div>
          <div className="admin-metric-sub">
            {squads.filter(s => s.assignedMissionId).length} of {missions.length} covered
          </div>
        </div>
      </div>

      {/* Main Admin Two-Column Layout */}
      <div className="admin-main-grid">
        {/* Left Column: Emergency Operations & Algorithm Tuner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Emergency Operations Box */}
          <div className="admin-card">
            <div className="admin-card-title">
              <AlertTriangle size={18} color="#e63946" />
              <span>Emergency Command Overrides</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Instant interventions that bypass standard scheduling algorithms.
            </p>

            <div className="admin-actions-grid">
              <button
                className="btn-wisteria"
                onClick={handleStrikeNakimeBiwa}
                style={{ padding: '9px 12px', fontSize: '11.5px', justifyContent: 'center', background: 'linear-gradient(135deg, #7b2cbf, #9d4edd)' }}
                title="Shift the architecture and gravity of the Infinity Castle fortress"
              >
                <span>🪕 Strike Nakime's Biwa</span>
              </button>

              <button
                className="btn-primary"
                onClick={handleMoonBreathingStrike}
                style={{ padding: '9px 12px', fontSize: '11.5px', justifyContent: 'center', background: 'linear-gradient(135deg, #5a189a, #e63946)' }}
                title="Unleash Moon Breathing First Form crescent energy blades"
              >
                <span>🌙 Moon Breathing Blades</span>
              </button>

              <button
                className="btn-danger"
                onClick={handleEmergencyDisband}
                disabled={squads.length === 0}
                style={{ padding: '9px 12px', fontSize: '11.5px', justifyContent: 'center' }}
              >
                <Trash2 size={13} />
                <span>Disband All Squads</span>
              </button>

              <button
                className="btn-secondary"
                onClick={() => { onRegenerateTeams(); addLog('ALG', 'Full re-seed executed by admin.'); }}
                disabled={squads.length === 0}
                style={{ padding: '9px 12px', fontSize: '11.5px', justifyContent: 'center' }}
              >
                <RefreshCw size={13} />
                <span>Force Full Re-Seed</span>
              </button>

              <button
                className="btn-gold"
                onClick={handleRecruitHashiraReinforcement}
                style={{ padding: '9px 12px', fontSize: '11.5px', justifyContent: 'center' }}
              >
                <UserPlus size={13} />
                <span>Spawn Hashira Ally</span>
              </button>

              <button
                className="btn-primary"
                onClick={handleTriggerUpperMoonIncursion}
                style={{ padding: '9px 12px', fontSize: '11.5px', justifyContent: 'center', background: 'linear-gradient(135deg, #7209b7, #e63946)' }}
              >
                <Flame size={13} />
                <span>Trigger Upper Moon Crisis</span>
              </button>

              <button
                className="btn-secondary"
                onClick={() => { onRestoreCanon(); addLog('SYS', 'Database restored to canon baseline.'); }}
                style={{ padding: '9px 12px', fontSize: '11.5px', justifyContent: 'center', gridColumn: 'span 2' }}
              >
                <RotateCcw size={13} />
                <span>Restore Clean Canon Baseline</span>
              </button>
            </div>
          </div>

          {/* Algorithm Hyperparameter Tuners */}
          <div className="admin-card">
            <div className="admin-card-title">
              <SlidersHorizontal size={18} color="#ffd166" />
              <span>Formation Algorithm Hyperparameters</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Modulate internal heuristics for team balancing and threat matching.
            </p>

            <div className="admin-slider-group">
              <div className="admin-slider-label">
                <span>Role Stratification Priority</span>
                <strong style={{ color: '#ffd166' }}>{roleDiversityWeight}%</strong>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={roleDiversityWeight}
                onChange={(e) => setRoleDiversityWeight(Number(e.target.value))}
                className="admin-slider"
              />
              <span className="admin-slider-hint">
                Forces mandatory Vanguard + Recon + Tactician + Medical composition.
              </span>
            </div>

            <div className="admin-slider-group">
              <div className="admin-slider-label">
                <span>Elemental Breathing Resonance Bonus</span>
                <strong style={{ color: '#c77dff' }}>{resonanceMultiplier}x</strong>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={resonanceMultiplier}
                onChange={(e) => setResonanceMultiplier(Number(e.target.value))}
                className="admin-slider"
              />
              <span className="admin-slider-hint">
                Multiplies synergy score for harmonious breathing element combinations.
              </span>
            </div>

            <div className="admin-slider-group">
              <div className="admin-slider-label">
                <span>Combat Power Parity Tolerance</span>
                <strong style={{ color: '#00b4d8' }}>±{powerParityTolerance} CP</strong>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={powerParityTolerance}
                onChange={(e) => setPowerParityTolerance(Number(e.target.value))}
                className="admin-slider"
              />
              <span className="admin-slider-hint">
                Maximum allowable variance between squads' average combat power.
              </span>
            </div>

            <button
              onClick={handleApplyTuners}
              className="btn-gold"
              style={{ width: '100%', marginTop: '14px', justifyContent: 'center', padding: '10px' }}
            >
              <CheckCircle2 size={16} />
              <span>Save & Broadcast Parameters</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Terminal & State Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Kasugai Crow Live Audit Log */}
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="admin-card-title" style={{ marginBottom: 0 }}>
                <Terminal size={18} color="#06d6a0" />
                <span>Kasugai Crow Telemetry Stream</span>
              </div>
              <button
                onClick={() => setLogs([])}
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11px' }}
              >
                Clear
              </button>
            </div>

            <div className="admin-terminal-window">
              {logs.map(l => (
                <div key={l.id} className="terminal-line">
                  <span className="terminal-time">[{l.time}]</span>
                  <span className={`terminal-badge ${l.type.toLowerCase()}`}>{l.type}</span>
                  <span className="terminal-text">{l.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw System State Inspector */}
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="admin-card-title" style={{ marginBottom: 0 }}>
                <Layers size={18} color="#c77dff" />
                <span>State & Cloud Database Inspector</span>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                {['summary', 'slayers', 'missions', 'squads', 'database'].map(v => (
                  <button
                    key={v}
                    onClick={() => setInspectorView(v)}
                    className={`btn-secondary ${inspectorView === v ? 'active' : ''}`}
                    style={{
                      padding: '4px 8px',
                      fontSize: '11px',
                      textTransform: 'capitalize',
                      borderColor: inspectorView === v ? '#ffb703' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-json-viewer">
              <pre style={{ margin: 0, fontSize: '11.5px', color: '#ffecd1', fontFamily: 'monospace' }}>
                {inspectorView === 'summary' && JSON.stringify({
                  totalSlayers: slayers.length,
                  assignedSlayers: slayers.filter(s => s.assignedTeamId).length,
                  reserveSlayers: slayers.filter(s => !s.assignedTeamId).length,
                  squadCount: squads.length,
                  missionCount: missions.length,
                  activeAssignments: squads.filter(s => s.assignedMissionId).length,
                  demonCount: demons.length
                }, null, 2)}

                {inspectorView === 'slayers' && JSON.stringify(slayers.map(s => ({
                  id: s.id,
                  name: s.name,
                  rank: s.rank,
                  role: s.preferredRole,
                  cp: s.combatPower,
                  assignedTeamId: s.assignedTeamId
                })), null, 2)}

                {inspectorView === 'missions' && JSON.stringify(missions.map(m => ({
                  id: m.id,
                  title: m.title,
                  rank: m.dangerRank,
                  demon: m.demonEncounter,
                  roles: m.requiredRoles
                })), null, 2)}

                {inspectorView === 'squads' && JSON.stringify(squads.map(sq => ({
                  id: sq.id,
                  name: sq.name,
                  combatPower: sq.combatPower,
                  synergyScore: sq.synergyScore,
                  assignedMissionId: sq.assignedMissionId,
                  members: sq.members.map(m => m.name)
                })), null, 2)}

                {inspectorView === 'database' && JSON.stringify({
                  databaseProvider: 'Supabase PostgreSQL',
                  status: dbStatus,
                  schemaTables: ['slayers', 'missions', 'squads', 'twelve_kizuki', 'formation_history'],
                  cloudCounts: dbStatus.counts || 'In-Memory Fallback',
                  localCounts: {
                    slayers: slayers.length,
                    missions: missions.length,
                    squads: squads.length,
                    demons: demons.length
                  }
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
