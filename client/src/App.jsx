import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Swords,
  Shield,
  Scroll,
  Flame,
  Droplets,
  Zap,
  Wind,
  Sparkles,
  Users,
  Compass,
  RefreshCw,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  RotateCcw,
  Target,
  BarChart3,
  Search,
  Sliders,
  Layers,
  Award,
  Skull,
  Eye,
  Crosshair,
  LogOut
} from 'lucide-react';
import { sfx } from './soundEffects';
import LoginPage from './LoginPage';

const BREATHING_OPTIONS = [
  "Water", "Flame", "Thunder", "Wind", "Stone", "Mist", "Insect", "Flower", "Beast", "Love", "Sound", "Sun", "Moon", "Other"
];

const ROLES = ["Vanguard", "Recon", "Tactician", "Medical", "Trapper"];
const RANKS = ["Mizunoto", "Kanoto", "Kanoe", "Hinoto", "Hinoe", "Kinoto", "Kinoe", "Tsuguko", "Hashira"];
const DANGER_RANKS = ["Rank S", "Rank A", "Rank B", "Rank C", "Rank D"];

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('command'); // 'command' | 'slayers' | 'missions' | 'demons' | 'matrix'

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Data states
  const [slayers, setSlayers] = useState([]);
  const [missions, setMissions] = useState([]);
  const [demons, setDemons] = useState([]);
  const [squads, setSquads] = useState([]);
  const [reserveSlayers, setReserveSlayers] = useState([]);
  const [overview, setOverview] = useState({
    totalSlayers: 0,
    assignedSlayers: 0,
    unassignedSlayers: 0,
    totalMissions: 0,
    assignedMissions: 0,
    activeSquads: 0,
    readinessIndex: 0
  });

  // UI / Controls
  const [teamSize, setTeamSize] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState(null);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    showToast(`Authentication Approved! Welcome, ${user.name}.`, "⛩️");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    showToast("Terminal locked. Return safely to barracks.", "🔒");
  };

  // Filters & Search
  const [slayerSearch, setSlayerSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [breathingFilter, setBreathingFilter] = useState('All');
  const [missionDangerFilter, setMissionDangerFilter] = useState('All');
  const [demonRankFilter, setDemonRankFilter] = useState('All');

  // Modals
  const [isSlayerModalOpen, setIsSlayerModalOpen] = useState(false);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);

  // Form states
  const [newSlayer, setNewSlayer] = useState({
    name: '',
    japaneseName: '',
    breathingStyle: '',
    baseBreathing: 'Water',
    rank: 'Kanoe',
    preferredRole: 'Vanguard',
    skills: '',
    interests: '',
    combatPower: 80
  });

  const [newMission, setNewMission] = useState({
    title: '',
    japaneseTitle: '',
    dangerRank: 'Rank B',
    location: '',
    teamSize: 4,
    requiredRoles: ['Vanguard'],
    preferredBreathing: ['Water'],
    requiredSkills: '',
    minCombatPower: 250,
    demonEncounter: '',
    description: ''
  });

  // Toast helper
  const showToast = (message, icon = '⚔️') => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 3500);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const newState = sfx.toggleSound();
    setSoundEnabled(newState);
    showToast(newState ? "Audio Sound Effects Enabled" : "Sound Muted", newState ? "🔊" : "🔇");
  };

  // Trigger Zenitsu Thunder Strike
  const handleZenitsuThunderclap = () => {
    sfx.playSlash();
    showToast("雷の呼吸 壱ノ型 霹靂一閃！ (Thunderclap and Flash!)", "⚡");
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.5 },
      colors: ['#ffb703', '#fb8500', '#fff', '#ffd166']
    });
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resSlayers, resMissions, resDemons, resTeams, resOverview] = await Promise.all([
        fetch('/api/slayers').then(r => r.json()),
        fetch('/api/missions').then(r => r.json()),
        fetch('/api/demons').then(r => r.json()),
        fetch('/api/teams').then(r => r.json()),
        fetch('/api/overview').then(r => r.json())
      ]);

      setSlayers(resSlayers.slayers || []);
      setMissions(resMissions.missions || []);
      setDemons(resDemons.demons || []);
      setSquads(resTeams.squads || []);
      setReserveSlayers(resTeams.reserveSlayers || []);
      setOverview(resOverview || {});
    } catch (err) {
      console.error("Failed to fetch data:", err);
      showToast("Backend connection failed. Make sure server is running on port 5000.", "⚠️");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Form Squads
  const handleGenerateTeams = async () => {
    try {
      setIsLoading(true);
      sfx.playSlash();
      const res = await fetch('/api/teams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamSize })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSquads(data.squads);
      setReserveSlayers(data.reserveSlayers);
      showToast(data.message, "🦅");
      fetchData();
    } catch (err) {
      showToast(err.message, "⚠️");
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate Squads
  const handleRegenerateTeams = async () => {
    try {
      setIsLoading(true);
      sfx.playCrow();
      const res = await fetch('/api/teams/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamSize })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSquads(data.squads);
      setReserveSlayers(data.reserveSlayers);
      showToast(data.message, "🔄");
      fetchData();
    } catch (err) {
      showToast(err.message, "⚠️");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-Assign Missions to Squads
  const handleAssignMissions = async () => {
    try {
      setIsLoading(true);
      sfx.playChime();
      const res = await fetch('/api/assignments/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSquads(data.squads);
      setMissions(data.missions);
      showToast(data.message, "🎯");

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9d4edd', '#e63946', '#ffb703', '#00b4d8']
      });

      fetchData();
    } catch (err) {
      showToast(err.message, "⚠️");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear assignments
  const handleClearAssignments = async () => {
    try {
      await fetch('/api/assignments/reset', { method: 'POST' });
      showToast("Mission assignments reset to standby.", "🧹");
      fetchData();
    } catch (err) {
      showToast("Failed to reset assignments.", "⚠️");
    }
  };

  // Reset all to default Canon Lore data
  const handleRestoreCanon = async () => {
    if (window.confirm("Restore entire Demon Slayer Corps roster and active missions to canon default?")) {
      try {
        const res = await fetch('/api/reset', { method: 'POST' });
        const data = await res.json();
        showToast(data.message, "⛩️");
        fetchData();
      } catch (err) {
        showToast("Reset failed.", "⚠️");
      }
    }
  };

  // Create Slayer Submit
  const handleCreateSlayer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/slayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlayer)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`Enrolled ${data.slayer.name} into the Demon Slayer Corps!`, "🌸");
      setIsSlayerModalOpen(false);
      setNewSlayer({
        name: '',
        japaneseName: '',
        breathingStyle: '',
        baseBreathing: 'Water',
        rank: 'Kanoe',
        preferredRole: 'Vanguard',
        skills: '',
        interests: '',
        combatPower: 80
      });
      fetchData();
    } catch (err) {
      showToast(err.message, "⚠️");
    }
  };

  // Delete Slayer
  const handleDeleteSlayer = async (id, name) => {
    if (window.confirm(`Discharge slayer ${name} from the Corps?`)) {
      try {
        await fetch(`/api/slayers/${id}`, { method: 'DELETE' });
        showToast(`Discharged ${name}.`, "🗡️");
        fetchData();
      } catch (err) {
        showToast("Failed to delete slayer.", "⚠️");
      }
    }
  };

  // Create Mission Submit
  const handleCreateMission = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMission)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`Mission order "${data.mission.title}" dispatched!`, "📜");
      setIsMissionModalOpen(false);
      setNewMission({
        title: '',
        japaneseTitle: '',
        dangerRank: 'Rank B',
        location: '',
        teamSize: 4,
        requiredRoles: ['Vanguard'],
        preferredBreathing: ['Water'],
        requiredSkills: '',
        minCombatPower: 250,
        demonEncounter: '',
        description: ''
      });
      fetchData();
    } catch (err) {
      showToast(err.message, "⚠️");
    }
  };

  // Delete Mission
  const handleDeleteMission = async (id, title) => {
    if (window.confirm(`Archive mission order "${title}"?`)) {
      try {
        await fetch(`/api/missions/${id}`, { method: 'DELETE' });
        showToast(`Archived mission: ${title}`, "📜");
        fetchData();
      } catch (err) {
        showToast("Failed to delete mission.", "⚠️");
      }
    }
  };

  // Filtered Slayers
  const filteredSlayers = slayers.filter(slayer => {
    const matchSearch = slayer.name.toLowerCase().includes(slayerSearch.toLowerCase()) ||
      slayer.breathingStyle.toLowerCase().includes(slayerSearch.toLowerCase()) ||
      (slayer.skills && slayer.skills.some(s => s.toLowerCase().includes(slayerSearch.toLowerCase())));

    const matchRole = roleFilter === 'All' || slayer.preferredRole === roleFilter;
    const matchBreathing = breathingFilter === 'All' || slayer.baseBreathing === breathingFilter;

    return matchSearch && matchRole && matchBreathing;
  });

  // Filtered Missions
  const filteredMissions = missions.filter(m => {
    return missionDangerFilter === 'All' || m.dangerRank === missionDangerFilter;
  });

  // Filtered Demons
  const filteredDemons = demons.filter(d => {
    return demonRankFilter === 'All' || d.dangerRank === demonRankFilter;
  });

  if (!isAuthenticated) {
    return (
      <>
        {toast && (
          <div className="toast-notice">
            <span style={{ fontSize: '20px' }}>{toast.icon}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{toast.message}</span>
          </div>
        )}
        <LoginPage
          onLogin={handleLogin}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Notice */}
      {toast && (
        <div className="toast-notice">
          <span style={{ fontSize: '20px' }}>{toast.icon}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{toast.message}</span>
        </div>
      )}

      {/* Demon Slayer Corps Master Banner */}
      <header className="corps-header">
        <div className="header-kanji-bg">鬼殺隊</div>
        <div className="header-top">
          <div className="brand-section">
            <div className="corps-crest">滅</div>
            <div className="brand-text">
              <h1>
                DEMON SLAYER CORPS <span style={{ fontSize: '16px', color: 'var(--wisteria-light)' }}>鬼殺隊司令部</span>
              </h1>
              <div className="brand-subtitle">
                <span className="status-live-indicator">
                  <span className="pulse-dot"></span> Kasugai Crow Fleet Online
                </span>
                <span>•</span>
                <span>Smart Squad Formation & Demon Incursion Dispatch Platform</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            {currentUser && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 183, 3, 0.12)',
                border: '1px solid rgba(255, 183, 3, 0.35)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <span style={{ color: '#ffb703', fontWeight: 800 }}>⚡ {currentUser.name}</span>
                <span style={{ color: '#ffd166', opacity: 0.85 }}>({currentUser.role})</span>
              </div>
            )}

            <button
              onClick={handleToggleSound}
              className="btn-secondary"
              title="Toggle Web Audio Sound Effects"
            >
              {soundEnabled ? <Volume2 size={16} color="#c77dff" /> : <VolumeX size={16} color="#9ba1b0" />}
              <span>{soundEnabled ? "Audio On" : "Muted"}</span>
            </button>

            <button
              onClick={handleRestoreCanon}
              className="btn-secondary"
              title="Reset slayers and challenges to canon Demon Slayer dataset"
            >
              <RotateCcw size={16} />
              <span>Restore Canon Data</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ borderColor: 'rgba(255, 183, 3, 0.4)' }}
              title="Lock dispatch desk and return to Zenitsu Thunder Breathing Login"
            >
              <LogOut size={16} color="#ffb703" />
              <span>Seal Portal (Logout)</span>
            </button>
          </div>
        </div>

        {/* Global Statistics Ribbon */}
        <div className="stats-ribbon">
          <div className="stat-item">
            <div className="stat-icon" style={{ background: 'rgba(0, 180, 216, 0.15)', color: '#00b4d8' }}>
              <Users size={20} />
            </div>
            <div>
              <div className="stat-val">{overview.totalSlayers || slayers.length}</div>
              <div className="stat-lbl">Enrolled Slayers</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon" style={{ background: 'rgba(157, 78, 221, 0.15)', color: '#c77dff' }}>
              <Swords size={20} />
            </div>
            <div>
              <div className="stat-val">{squads.length}</div>
              <div className="stat-lbl">Active Squads</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon" style={{ background: 'rgba(230, 57, 70, 0.15)', color: '#ff6b6b' }}>
              <Target size={20} />
            </div>
            <div>
              <div className="stat-val">{overview.assignedMissions || 0} / {missions.length}</div>
              <div className="stat-lbl">Missions Assigned</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon" style={{ background: 'rgba(255, 183, 3, 0.15)', color: '#ffb703' }}>
              <Skull size={20} />
            </div>
            <div>
              <div className="stat-val">{demons.length}</div>
              <div className="stat-lbl">Tracked Kizuki & Demons</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="nav-tabs-bar">
        <div className="tabs-group">
          <button
            className={`tab-btn ${activeTab === 'command' ? 'active' : ''}`}
            onClick={() => { setActiveTab('command'); sfx.playSlash(); }}
          >
            <Compass size={16} />
            <span>Kasugai Dispatch Command</span>
            {squads.length > 0 && <span className="tab-count-badge">{squads.length} Squads</span>}
          </button>

          <button
            className={`tab-btn ${activeTab === 'slayers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('slayers'); sfx.playSlash(); }}
          >
            <Users size={16} />
            <span>Slayers Roster</span>
            <span className="tab-count-badge">{slayers.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'missions' ? 'active' : ''}`}
            onClick={() => { setActiveTab('missions'); sfx.playSlash(); }}
          >
            <Scroll size={16} />
            <span>Demon Missions</span>
            <span className="tab-count-badge">{missions.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'demons' ? 'active' : ''}`}
            onClick={() => { setActiveTab('demons'); sfx.playSlash(); }}
          >
            <Skull size={16} color="#ff4d6d" />
            <span>Twelve Kizuki & Demon Hierarchy</span>
            <span className="tab-count-badge" style={{ background: 'rgba(230, 57, 70, 0.25)', color: '#ff758f' }}>
              {demons.length}
            </span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
            onClick={() => { setActiveTab('matrix'); sfx.playSlash(); }}
          >
            <BarChart3 size={16} />
            <span>Synergy & Algorithm Matrix</span>
          </button>
        </div>

        <div>
          {activeTab === 'slayers' && (
            <button className="btn-primary" onClick={() => setIsSlayerModalOpen(true)}>
              <PlusCircle size={16} /> Enroll New Slayer
            </button>
          )}
          {activeTab === 'missions' && (
            <button className="btn-primary" onClick={() => setIsMissionModalOpen(true)}>
              <PlusCircle size={16} /> Issue Mission Order
            </button>
          )}
        </div>
      </nav>

      {/* =================================================================== */}
      {/* TAB 1: KASUGAI DISPATCH COMMAND (MAIN SQUADS & ASSIGNMENT HUB)      */}
      {/* =================================================================== */}
      {activeTab === 'command' && (
        <section>
          {/* =============================================================== */}
          {/* ZENITSU AGATSUMA FRONT-PAGE HERO SHOWCASE                       */}
          {/* =============================================================== */}
          <div className="zenitsu-hero-banner">
            <div className="zenitsu-pattern-bg"></div>

            <div className="zenitsu-content-left">
              <div className="zenitsu-avatar-frame">
                <img
                  src="/images/zenitsu.png"
                  alt="Zenitsu Agatsuma"
                  onError={(e) => { e.target.src = 'https://static.wikia.nocookie.net/kimetsu-no-yaiba/images/4/46/Zenitsu_Anime_Profile.png'; }}
                />
              </div>

              <div className="zenitsu-text-area">
                <div className="zenitsu-badge-row">
                  <span className="thunder-badge">
                    <Zap size={13} fill="#0d0f17" /> Thunder Breathing • 雷の呼吸
                  </span>
                  <span style={{ fontSize: '11px', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px', color: '#ffb703', border: '1px solid rgba(255,183,3,0.4)' }}>
                    Rank: Kanoe • Combat Power: 86
                  </span>
                  <span style={{ fontSize: '11px', color: '#ffd166', fontWeight: 700 }}>
                    ⚡ Godspeed Master
                  </span>
                </div>

                <div className="zenitsu-title">
                  <span>Zenitsu Agatsuma</span>
                  <span className="zenitsu-jp">我妻 善逸</span>
                </div>

                <div className="zenitsu-quote">
                  "If you can only do one thing, hone it to the ultimate limit. Bleed for it, master it, and become the lightning itself!" — <em>雷の呼吸 壱ノ型 霹靂一閃 (Thunderclap and Flash)</em>
                </div>
              </div>
            </div>

            <div className="zenitsu-actions-right">
              <button
                className="btn-gold"
                onClick={handleZenitsuThunderclap}
                title="Trigger Thunderclap and Flash sound effect!"
              >
                <Zap size={16} fill="#0b0d13" />
                <span>Thunderclap & Flash (霹靂一閃)</span>
              </button>
              <span style={{ fontSize: '11px', color: '#ffecd1', opacity: 0.85 }}>
                Frontline Recon Specialist • Homing Crow Handler
              </span>
            </div>
          </div>

          {/* Algorithm Hub Controls */}
          <div className="control-hub-card">
            <div className="hub-controls-left">
              <div className="team-size-selector">
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  SQUAD SIZE:
                </span>
                {[2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    className={`size-pill ${teamSize === num ? 'active' : ''}`}
                    onClick={() => setTeamSize(num)}
                    title={`Form squads of ${num} slayers`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Targeting: <strong style={{ color: '#fff' }}>{Math.floor(slayers.length / teamSize)} Squads</strong> from {slayers.length} available Slayers
              </div>
            </div>

            <div className="hub-actions-right">
              <button
                className="btn-primary"
                onClick={handleGenerateTeams}
                disabled={isLoading}
              >
                <Swords size={16} />
                <span>Form Synergistic Squads</span>
              </button>

              <button
                className="btn-wisteria"
                onClick={handleRegenerateTeams}
                disabled={isLoading || squads.length === 0}
                title="Shuffle seed and generate an alternative balanced team permutation"
              >
                <RefreshCw size={16} />
                <span>Re-dispatch Crows (Regenerate)</span>
              </button>

              <button
                className="btn-gold"
                onClick={handleAssignMissions}
                disabled={isLoading || squads.length === 0}
                title="Smart match formed squads to active demon incursion missions"
              >
                <Target size={16} />
                <span>Assign Demon Missions</span>
              </button>

              {squads.some(s => s.assignedMissionId) && (
                <button
                  className="btn-secondary"
                  onClick={handleClearAssignments}
                  title="Clear current mission assignments"
                >
                  Clear Assignments
                </button>
              )}
            </div>
          </div>

          {/* Formed Squads Grid */}
          {squads.length > 0 ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🦅 Dispatched Demon Slayer Squads</span>
                  <span style={{ fontSize: '12px', color: 'var(--wisteria-light)', fontWeight: 600 }}>({squads.length} Formed)</span>
                </h2>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Zero duplicate assignments • Role balanced • Breathing synergies active
                </span>
              </div>

              <div className="grid-squads">
                {squads.map((squad, index) => {
                  const assignedMission = missions.find(m => m.id === squad.assignedMissionId);

                  return (
                    <div key={squad.id} className="squad-card">
                      <div className="squad-header">
                        <div className="squad-title-area">
                          <h3>
                            <span>{squad.name}</span>
                          </h3>
                          <div className="squad-id-tag">Squad #{index + 1} • {squad.members.length} Slayers</div>
                        </div>

                        <div className="synergy-badge" title="Algorithmic synergy score based on role diversity, breathing harmony, and rank balance">
                          <Sparkles size={14} />
                          <span>{squad.synergyScore}% Synergy</span>
                        </div>
                      </div>

                      {/* Mission Assignment Card if Assigned */}
                      {assignedMission ? (
                        <div className="squad-mission-banner">
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {assignedMission.demonImage && (
                              <img
                                src={assignedMission.demonImage}
                                alt={assignedMission.demonEncounter}
                                style={{
                                  width: '54px',
                                  height: '54px',
                                  borderRadius: '8px',
                                  objectFit: 'cover',
                                  border: '1px solid rgba(230, 57, 70, 0.5)'
                                }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <div className="mission-banner-head">
                                <span>ASSIGNED DEMON INCURSION</span>
                                <span className="mission-match-badge">
                                  {squad.assignmentMetrics?.compatibilityScore || 90}% Match Fit
                                </span>
                              </div>
                              <div className="mission-banner-title">
                                {assignedMission.title} ({assignedMission.dangerRank})
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                📍 {assignedMission.location} • Target: <strong style={{ color: '#ffb703' }}>{assignedMission.demonEncounter}</strong>
                              </div>
                            </div>
                          </div>

                          {/* Matching Reasons */}
                          {squad.assignmentMetrics?.reasons && squad.assignmentMetrics.reasons.length > 0 && (
                            <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px' }}>
                              {squad.assignmentMetrics.reasons.slice(0, 2).map((reason, rIdx) => (
                                <div key={rIdx} style={{ fontSize: '11px', color: '#80ed99', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <CheckCircle2 size={12} /> {reason}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mission-unassigned-banner">
                          <span>Awaiting Kasugai Crow Mission Orders...</span>
                          <span style={{ fontSize: '11px', color: '#ffb703' }}>Click "Assign Demon Missions"</span>
                        </div>
                      )}

                      {/* Squad Members List */}
                      <div className="squad-members-list">
                        {squad.members.map(member => (
                          <div key={member.id} className="squad-member-row">
                            <div className="member-info-left">
                              <div className="member-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                                {member.avatarImage ? (
                                  <img
                                    src={member.avatarImage}
                                    alt={member.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  member.avatar || "⚔️"
                                )}
                              </div>
                              <div>
                                <div className="member-name">
                                  {member.name}
                                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '6px' }}>
                                    {member.japaneseName}
                                  </span>
                                </div>
                                <div className="member-style">
                                  {member.breathingStyle}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className={`role-badge ${member.preferredRole}`}>
                                {member.preferredRole}
                              </span>
                              <span className={`rank-badge ${member.rank}`}>
                                {member.rank}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Breathing Synergies Tag if triggered */}
                      {squad.detectedSynergies && squad.detectedSynergies.length > 0 && (
                        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' }}>
                            Breathing Style Resonance:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {squad.detectedSynergies.map((syn, synIdx) => (
                              <span key={synIdx} style={{
                                background: 'rgba(157, 78, 221, 0.15)',
                                border: '1px solid rgba(157, 78, 221, 0.35)',
                                color: '#e0aaff',
                                fontSize: '11px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                ⚡ {syn}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Reserve Slayers Barracks (Butterfly Mansion / Standby) */}
              {reserveSlayers.length > 0 && (
                <div style={{ marginTop: '36px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Shield size={18} color="#2ec4b6" />
                    <h3 style={{ fontSize: '16px', color: '#fff' }}>
                      Butterfly Mansion Reserve Barracks ({reserveSlayers.length} Slayers on Standby)
                    </h3>
                  </div>
                  <div style={{
                    background: 'rgba(14, 18, 29, 0.5)',
                    border: '1px solid rgba(46, 196, 182, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    {reserveSlayers.map(res => (
                      <div key={res.id} style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        {res.avatarImage ? (
                          <img
                            src={res.avatarImage}
                            alt={res.name}
                            style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                        ) : (
                          <span>{res.avatar || "🗡️"}</span>
                        )}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{res.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{res.breathingStyle} • {res.preferredRole}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⛩️</div>
              <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>
                No Squads Currently Formed
              </h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '14px' }}>
                Master Ubuyashiki is waiting for squad deployment orders. Configure your target squad size and click "Form Synergistic Squads" to initiate algorithmic recruitment!
              </p>
              <button className="btn-primary" onClick={handleGenerateTeams}>
                <Swords size={16} /> Assemble Demon Slayer Squads
              </button>
            </div>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* TAB 2: SLAYERS ROSTER (PARTICIPANT PROFILES)                        */}
      {/* =================================================================== */}
      {activeTab === 'slayers' && (
        <section>
          {/* Filter and Search Bar */}
          <div className="control-hub-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search slayers by name, breathing style, or skills..."
                  value={slayerSearch}
                  onChange={(e) => setSlayerSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="All">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>

              <select
                className="form-select"
                value={breathingFilter}
                onChange={(e) => setBreathingFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="All">All Breathing Styles</option>
                {BREATHING_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <button className="btn-primary" onClick={() => setIsSlayerModalOpen(true)}>
                <PlusCircle size={16} /> Enroll Slayer
              </button>
            </div>
          </div>

          {/* Slayers Profiles Grid */}
          <div className="grid-slayers">
            {filteredSlayers.map(slayer => {
              const assignedSquad = squads.find(sq => sq.id === slayer.assignedTeamId);

              return (
                <div key={slayer.id} className="slayer-card">
                  <div>
                    <div className="slayer-card-top">
                      <div className="slayer-avatar-box" style={{ overflow: 'hidden', padding: 0 }}>
                        {slayer.avatarImage ? (
                          <img
                            src={slayer.avatarImage}
                            alt={slayer.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          slayer.avatar || "⚔️"
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span className={`rank-badge ${slayer.rank}`}>
                          {slayer.rank}
                        </span>
                        <span className={`role-badge ${slayer.preferredRole}`}>
                          {slayer.preferredRole}
                        </span>
                      </div>
                    </div>

                    <div className="slayer-card-title">
                      <h4>{slayer.name}</h4>
                      <div className="jp-name">{slayer.japaneseName}</div>
                    </div>

                    <div style={{ margin: '10px 0', fontSize: '13px', color: '#e0aaff', fontWeight: 600 }}>
                      🗡️ {slayer.breathingStyle}
                    </div>

                    {/* Combat Power Bar */}
                    <div className="power-bar-wrapper">
                      <div className="power-bar-head">
                        <span>Combat Power Index</span>
                        <strong style={{ color: '#fff' }}>{slayer.combatPower || 80}/100</strong>
                      </div>
                      <div className="power-bar-track">
                        <div className="power-bar-fill" style={{ width: `${slayer.combatPower || 80}%` }}></div>
                      </div>
                    </div>

                    {/* Skills Chips */}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Mastered Techniques:
                    </div>
                    <div className="skills-chip-list">
                      {(slayer.skills || []).map((skill, sIdx) => (
                        <span key={sIdx} className="skill-chip">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Interests */}
                    {slayer.interests && slayer.interests.length > 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        🎯 <span style={{ color: '#d1d5db' }}>Interests:</span> {slayer.interests.join(", ")}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {assignedSquad ? (
                      <span style={{ fontSize: '11px', color: '#2ec4b6', fontWeight: 600 }}>
                        ✓ Assigned: {assignedSquad.name.slice(0, 22)}...
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#ffb703', fontWeight: 600 }}>
                        • Standby in Barracks
                      </span>
                    )}

                    <button
                      className="btn-danger-outline"
                      onClick={() => handleDeleteSlayer(slayer.id, slayer.name)}
                      title="Discharge slayer from Corps"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TAB 3: DEMON MISSIONS (CHALLENGES / EXPEDITIONS)                    */}
      {/* =================================================================== */}
      {activeTab === 'missions' && (
        <section>
          {/* Mission Filter Bar */}
          <div className="control-hub-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                DANGER RATING FILTER:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['All', ...DANGER_RANKS].map(rank => (
                  <button
                    key={rank}
                    className={`size-pill ${missionDangerFilter === rank ? 'active' : ''}`}
                    onClick={() => setMissionDangerFilter(rank)}
                    style={{ width: 'auto', padding: '0 12px' }}
                  >
                    {rank}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={() => setIsMissionModalOpen(true)}>
              <PlusCircle size={16} /> Issue New Mission Order
            </button>
          </div>

          {/* Missions Grid */}
          <div className="grid-missions">
            {filteredMissions.map(mission => {
              const assignedSquad = squads.find(sq => sq.id === mission.assignedTeamId);

              return (
                <div key={mission.id} className="mission-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span className={`danger-tag ${mission.dangerRank.replace(' ', '-')}`}>
                        <AlertTriangle size={13} /> {mission.dangerRank}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        📍 {mission.location}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
                      {mission.demonImage && (
                        <div style={{
                          width: '70px',
                          height: '70px',
                          minWidth: '70px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '2px solid rgba(230, 57, 70, 0.5)',
                          background: '#0a0d18'
                        }}>
                          <img
                            src={mission.demonImage}
                            alt={mission.demonEncounter}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div>
                        <h3 style={{ fontSize: '17px', color: '#fff', marginBottom: '3px' }}>
                          {mission.title}
                        </h3>
                        <div style={{ fontFamily: 'var(--font-jp)', fontSize: '12px', color: 'var(--wisteria-light)' }}>
                          {mission.japaneseTitle}
                        </div>
                        {mission.demonRankTitle && (
                          <span style={{ fontSize: '11px', color: '#ff758f', fontWeight: 700 }}>
                            {mission.demonRankTitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                      {mission.description}
                    </p>

                    <div style={{
                      background: 'rgba(230, 57, 70, 0.08)',
                      border: '1px solid rgba(230, 57, 70, 0.2)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      marginBottom: '14px',
                      fontSize: '12px'
                    }}>
                      <span style={{ color: '#ff6b6b', fontWeight: 700 }}>Target Demon:</span>{' '}
                      <span style={{ color: '#fff' }}>{mission.demonEncounter}</span>
                    </div>

                    {/* Requirements checklist */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', marginBottom: '14px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Required Squad Size:</span>{' '}
                        <strong style={{ color: '#fff' }}>{mission.teamSize || 4} Slayers</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Required Roles:</span>{' '}
                        {(mission.requiredRoles || []).map((r, idx) => (
                          <span key={idx} className={`role-badge ${r}`} style={{ marginLeft: '4px' }}>
                            {r}
                          </span>
                        ))}
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Counter Breathing Elements:</span>{' '}
                        {(mission.preferredBreathing || []).map((b, idx) => (
                          <span key={idx} className="breathing-badge" style={{ marginLeft: '4px' }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mission Card Footer */}
                  <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {assignedSquad ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} color="#2ec4b6" />
                        <span style={{ fontSize: '12px', color: '#2ec4b6', fontWeight: 700 }}>
                          Dispatched: {assignedSquad.name.slice(0, 18)}...
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#ffb703', fontWeight: 600 }}>
                        ⚠️ Standby for Dispatch
                      </span>
                    )}

                    <button
                      className="btn-danger-outline"
                      onClick={() => handleDeleteMission(mission.id, mission.title)}
                      title="Archive mission"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TAB 4: DEMON HIERARCHY (TWELVE KIZUKI RANKINGS & ALL DEMON IMAGES)  */}
      {/* =================================================================== */}
      {activeTab === 'demons' && (
        <section>
          {/* Header Banner */}
          <div className="corps-header" style={{
            background: 'linear-gradient(135deg, rgba(35, 12, 22, 0.9) 0%, rgba(14, 15, 25, 0.95) 100%)',
            borderColor: 'rgba(230, 57, 70, 0.4)'
          }}>
            <div className="header-kanji-bg" style={{ color: 'rgba(230, 57, 70, 0.05)' }}>十二鬼月</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="danger-tag Rank-S">Twelve Kizuki Intelligence</span>
                <span style={{ fontSize: '12px', color: '#ff758f' }}>鬼舞辻無惨 直属配下 (Under Lord Muzan Kibutsuji)</span>
              </div>
              <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '6px' }}>
                Demon Threat Hierarchy: Upper Moons, Lower Moons & Blood Art Covens
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '780px' }}>
                Cataloged by the Ubuyashiki estate according to ocular ranking (瞳の刻印). Slayers must reference these threat profiles before engaging in mission dispatches.
              </p>
            </div>
          </div>

          {/* Demon Ranking Filter */}
          <div className="control-hub-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                FILTER BY THREAT RANK:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['All', 'Rank S', 'Rank A', 'Rank B', 'Rank C', 'Rank D'].map(rank => (
                  <button
                    key={rank}
                    className={`size-pill ${demonRankFilter === rank ? 'active' : ''}`}
                    onClick={() => setDemonRankFilter(rank)}
                    style={{ width: 'auto', padding: '0 14px' }}
                  >
                    {rank}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Showing: <strong style={{ color: '#fff' }}>{filteredDemons.length} Ranked Demon Threats</strong>
            </div>
          </div>

          {/* Demon Cards Grid */}
          <div className="grid-demons">
            {filteredDemons.map(demon => (
              <div key={demon.id} className="demon-ranking-card">
                <div>
                  <div className="demon-card-header">
                    <div className="demon-img-container">
                      <img src={demon.image} alt={demon.name} />
                      <div className="demon-rank-category-pill">{demon.dangerRank}</div>
                    </div>

                    <div className="demon-title-box">
                      <div className="demon-name">
                        <span>{demon.name}</span>
                        <span className={`danger-tag ${demon.dangerRank.replace(' ', '-')}`}>
                          {demon.dangerRank}
                        </span>
                      </div>
                      <div className="demon-jp-rank">{demon.rankTitle}</div>
                      <div style={{ fontSize: '11px', color: '#ffb703', fontWeight: 600 }}>
                        {demon.japaneseName}
                      </div>
                    </div>
                  </div>

                  <div className="blood-art-tag">
                    🩸 <strong>Blood Demon Art:</strong> {demon.bloodDemonArt}
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {demon.description}
                  </p>

                  {/* Threat Power Bar */}
                  <div className="threat-meter">
                    <div className="threat-meter-head">
                      <span>Demonic Threat Index</span>
                      <strong style={{ color: '#ff6b6b' }}>{demon.threatPower}/100</strong>
                    </div>
                    <div className="threat-meter-track">
                      <div className="threat-meter-fill" style={{ width: `${demon.threatPower}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Counter Hint */}
                <div style={{
                  marginTop: '14px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '11px',
                  color: '#a0e426'
                }}>
                  🛡️ <strong>Hashira Tactical Advice:</strong> {demon.counterHint}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* TAB 5: SYNERGY & ALGORITHM MATRIX (EXPLAINABILITY & TRANSPARENCY)   */}
      {/* =================================================================== */}
      {activeTab === 'matrix' && (
        <section>
          <div className="corps-header" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>
              🧠 Kasugai Crow Dispatch Algorithm Blueprint
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '780px' }}>
              The Demon Slayer Corps platform uses a multi-objective constraint optimization engine to assemble balanced squads and match them to optimal demon threat tiers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Rule 1: Role Balancing */}
            <div className="squad-card">
              <h3 style={{ fontSize: '16px', color: '#ffb703', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} /> Tactical Role Stratification
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
                The engine ensures squads do not suffer from role blindness (such as all medics or all vanguard berserkers).
              </p>
              <ul style={{ fontSize: '12px', color: '#d1d5db', paddingLeft: '18px', lineHeight: 1.8 }}>
                <li><strong>Vanguard:</strong> Direct frontline melee and demon decapitation (Tanjiro, Rengoku, Giyu).</li>
                <li><strong>Medical (Kakushi):</strong> Poison detoxification and rapid tourniquet triage (Shinobu, Aoi, Gotou).</li>
                <li><strong>Recon:</strong> Auditory/scent detection and early stealth tracking (Zenitsu, Tengen).</li>
                <li><strong>Tactician:</strong> Battlefield command, transparent world analysis (Muichiro, Kanao).</li>
                <li><strong>Trapper:</strong> Wisteria barriers and demonic assimilation (Genya, Murata).</li>
              </ul>
            </div>

            {/* Rule 2: Breathing Style Synergies */}
            <div className="squad-card">
              <h3 style={{ fontSize: '16px', color: '#c77dff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> Breathing Style Harmonics
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
                Elemental combinations provide bonus synergy ratings when paired together:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                  ⚡ <strong>Water + Thunder:</strong> Flowing Lightning Convergence (+8% Synergy)
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                  🔥 <strong>Flame + Love:</strong> Blazing Passion Torrent (+7% Synergy)
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                  🦋 <strong>Water + Insect:</strong> Dead Calm Venom Weave (+9% Synergy)
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                  🌫️ <strong>Wind + Mist:</strong> Gale Obscurity Mirage (+7% Synergy)
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                  ☀️ <strong>Water + Sun:</strong> Dance of the Dragon Tide (+10% Synergy)
                </div>
              </div>
            </div>

            {/* Rule 3: Challenge Compatibility Formula */}
            <div className="squad-card">
              <h3 style={{ fontSize: '16px', color: '#ff6b6b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} /> Mission Suitability Scoring
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '12px' }}>
                When matching a squad to a demon incursion, the suitability score is computed via:
              </p>
              <div style={{
                background: 'rgba(10, 14, 25, 0.7)',
                padding: '12px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#e0aaff',
                marginBottom: '10px'
              }}>
                MatchScore = 40 (Base) + (30% × RoleCoverage) + (20% × CounterBreathing) + (25% × CombatPowerAdequacy) + (15% × RequiredSkills)
              </div>
              <p style={{ fontSize: '12px', color: '#9ba1b0' }}>
                Zero duplicate assignments are strictly guaranteed: once a slayer is placed in a squad, they are excluded from all other candidates.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* MODAL: ENROLL NEW SLAYER                                            */}
      {/* =================================================================== */}
      {isSlayerModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSlayerModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 style={{ fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⛩️</span> Enroll New Demon Slayer into Corps
              </h3>
              <button className="modal-close-btn" onClick={() => setIsSlayerModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSlayer}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Slayer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Obanai Iguro"
                    className="form-input"
                    value={newSlayer.name}
                    onChange={(e) => setNewSlayer({ ...newSlayer, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Japanese Name</label>
                  <input
                    type="text"
                    placeholder="e.g. 伊黒 小芭内"
                    className="form-input"
                    value={newSlayer.japaneseName}
                    onChange={(e) => setNewSlayer({ ...newSlayer, japaneseName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Breathing Style Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Serpent Breathing"
                    className="form-input"
                    value={newSlayer.breathingStyle}
                    onChange={(e) => setNewSlayer({ ...newSlayer, breathingStyle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Base Elemental Category</label>
                  <select
                    className="form-select"
                    value={newSlayer.baseBreathing}
                    onChange={(e) => setNewSlayer({ ...newSlayer, baseBreathing: e.target.value })}
                  >
                    {BREATHING_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Preferred Tactical Role</label>
                  <select
                    className="form-select"
                    value={newSlayer.preferredRole}
                    onChange={(e) => setNewSlayer({ ...newSlayer, preferredRole: e.target.value })}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Corps Rank</label>
                  <select
                    className="form-select"
                    value={newSlayer.rank}
                    onChange={(e) => setNewSlayer({ ...newSlayer, rank: e.target.value })}
                  >
                    {RANKS.map(rk => <option key={rk} value={rk}>{rk}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Special Skills / Forms (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Slithering Serpent Slice, Total Concentration Constant, Twin Snake Strike"
                  className="form-input"
                  value={newSlayer.skills}
                  onChange={(e) => setNewSlayer({ ...newSlayer, skills: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interests & Hobbies (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Kaburamaru Care, Mitsuri's Cooking, Senbei Crackers"
                  className="form-input"
                  value={newSlayer.interests}
                  onChange={(e) => setNewSlayer({ ...newSlayer, interests: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Combat Power Index (40 - 100): {newSlayer.combatPower}</label>
                <input
                  type="range"
                  min="40"
                  max="100"
                  className="form-input"
                  value={newSlayer.combatPower}
                  onChange={(e) => setNewSlayer({ ...newSlayer, combatPower: Number(e.target.value) })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsSlayerModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Swords size={16} /> Enroll Slayer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: ISSUE NEW MISSION ORDER                                      */}
      {/* =================================================================== */}
      {isMissionModalOpen && (
        <div className="modal-overlay" onClick={() => setIsMissionModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 style={{ fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📜</span> Issue Kasugai Crow Mission Order
              </h3>
              <button className="modal-close-btn" onClick={() => setIsMissionModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateMission}>
              <div className="form-group">
                <label className="form-label">Mission Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infinity Castle Dimensional Assault"
                  className="form-input"
                  value={newMission.title}
                  onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Japanese Inscription</label>
                  <input
                    type="text"
                    placeholder="e.g. 無限城 決戦総突入"
                    className="form-input"
                    value={newMission.japaneseTitle}
                    onChange={(e) => setNewMission({ ...newMission, japaneseTitle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Danger Threat Rank</label>
                  <select
                    className="form-select"
                    value={newMission.dangerRank}
                    onChange={(e) => setNewMission({ ...newMission, dangerRank: e.target.value })}
                  >
                    {DANGER_RANKS.map(dr => <option key={dr} value={dr}>{dr}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Incursion Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Biwa Castle Fortress, Underworld"
                    className="form-input"
                    value={newMission.location}
                    onChange={(e) => setNewMission({ ...newMission, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Demon Encounter</label>
                  <input
                    type="text"
                    placeholder="e.g. Nakime & Kokushibo (Upper Moon 1)"
                    className="form-input"
                    value={newMission.demonEncounter}
                    onChange={(e) => setNewMission({ ...newMission, demonEncounter: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Required Team Size</label>
                  <input
                    type="number"
                    min="2"
                    max="6"
                    className="form-input"
                    value={newMission.teamSize}
                    onChange={(e) => setNewMission({ ...newMission, teamSize: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Combat Power Required</label>
                  <input
                    type="number"
                    min="100"
                    max="400"
                    className="form-input"
                    value={newMission.minCombatPower}
                    onChange={(e) => setNewMission({ ...newMission, minCombatPower: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Tactical Roles (Check all needed)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ROLES.map(r => {
                    const isChecked = newMission.requiredRoles.includes(r);
                    return (
                      <button
                        type="button"
                        key={r}
                        className={`size-pill ${isChecked ? 'active' : ''}`}
                        style={{ width: 'auto', padding: '0 12px' }}
                        onClick={() => {
                          const updated = isChecked
                            ? newMission.requiredRoles.filter(role => role !== r)
                            : [...newMission.requiredRoles, r];
                          setNewMission({ ...newMission, requiredRoles: updated });
                        }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Counter Breathing Elements (Check needed)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {["Water", "Flame", "Thunder", "Wind", "Stone", "Mist", "Insect", "Sun"].map(b => {
                    const isChecked = newMission.preferredBreathing.includes(b);
                    return (
                      <button
                        type="button"
                        key={b}
                        className={`size-pill ${isChecked ? 'active' : ''}`}
                        style={{ width: 'auto', padding: '0 10px' }}
                        onClick={() => {
                          const updated = isChecked
                            ? newMission.preferredBreathing.filter(style => style !== b)
                            : [...newMission.preferredBreathing, b];
                          setNewMission({ ...newMission, preferredBreathing: updated });
                        }}
                      >
                        {b}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mission Intelligence Briefing</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Detail the demon abilities, environmental hazards, and tactical precautions..."
                  value={newMission.description}
                  onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsMissionModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Scroll size={16} /> Issue Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
