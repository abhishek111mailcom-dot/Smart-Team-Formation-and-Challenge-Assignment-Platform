import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Lock,
  Key,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { sfx } from './soundEffects';

const VALID_PASSCODES = [
  'kagaya_eternal_feeling',
  'hashira_admin',
  'admin123',
  'admin',
  'kokushibo_moon_1'
];

export default function AdminPasscodeModal({
  isOpen,
  onClose,
  onSuccess,
  showToast
}) {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError('');
      setIsShaking(false);
      setIsVerifying(false);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = (codeToTest) => {
    const candidate = (codeToTest !== undefined ? codeToTest : passcode).trim();
    if (!candidate) {
      setError('Please enter the clearance passcode.');
      setIsShaking(true);
      sfx.playDenied();
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsVerifying(true);

    const envPasscode = typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSCODE;
    const isValid = VALID_PASSCODES.includes(candidate) || (envPasscode && candidate === envPasscode);

    if (isValid) {
      setError('');
      sfx.playNakimeBiwa(1.2);
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c77dff', '#9d4edd', '#ffd166', '#e63946']
        });
      } catch (e) {
        // Ignore
      }

      if (showToast) {
        showToast('Clearance Verified: Kokushibo Moon Admin Console Unlocked!', '⛩️');
      }

      setTimeout(() => {
        setIsVerifying(false);
        onSuccess();
      }, 350);
    } else {
      setIsVerifying(false);
      setError('Access Denied: Incorrect Clearance Passcode. Wards Remain Sealed.');
      setIsShaking(true);
      sfx.playDenied();
      setTimeout(() => setIsShaking(false), 550);
      if (inputRef.current) inputRef.current.select();
    }
  };

  const handleFillCanon = () => {
    const canon = 'kagaya_eternal_feeling';
    setPasscode(canon);
    setError('');
    sfx.playSlash();
    handleVerify(canon);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 9999,
        background: 'rgba(6, 4, 12, 0.88)',
        backdropFilter: 'blur(14px)'
      }}
      onClick={onClose}
    >
      <div
        className={`modal-content ${isShaking ? 'shake-animation' : ''}`}
        style={{
          maxWidth: '460px',
          background: 'linear-gradient(145deg, rgba(22, 12, 32, 0.96) 0%, rgba(12, 8, 20, 0.98) 100%)',
          border: error ? '1px solid rgba(230, 57, 70, 0.7)' : '1px solid rgba(157, 78, 221, 0.55)',
          boxShadow: error
            ? '0 0 35px rgba(230, 57, 70, 0.4), 0 20px 60px rgba(0, 0, 0, 0.9)'
            : '0 0 35px rgba(157, 78, 221, 0.35), 0 20px 60px rgba(0, 0, 0, 0.9)',
          borderRadius: '18px',
          padding: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Crest Background Watermark */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-15px',
            fontSize: '110px',
            fontFamily: 'var(--font-jp)',
            color: 'rgba(157, 78, 221, 0.05)',
            pointerEvents: 'none',
            userSelect: 'none',
            lineHeight: 1
          }}
        >
          滅
        </div>

        {/* Modal Header */}
        <div className="modal-head" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: error
                  ? 'rgba(230, 57, 70, 0.2)'
                  : 'linear-gradient(135deg, rgba(157, 78, 221, 0.3) 0%, rgba(255, 183, 3, 0.2) 100%)',
                border: error ? '1px solid rgba(230, 57, 70, 0.5)' : '1px solid rgba(157, 78, 221, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: error ? '0 0 16px rgba(230, 57, 70, 0.3)' : '0 0 16px rgba(157, 78, 221, 0.3)'
              }}
            >
              {error ? (
                <AlertTriangle size={20} color="#ff6b6b" />
              ) : (
                <ShieldAlert size={20} color="#c77dff" />
              )}
            </div>
            <div>
              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Command Clearance Seal</span>
                <span style={{ fontSize: '12px', color: '#ffb703', fontWeight: 600 }}>産屋敷 封印</span>
              </h3>
              <div style={{ fontSize: '11.5px', color: '#9ba1b0' }}>
                Supreme Commander & Admin Access Only
              </div>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            style={{ color: '#9ba1b0' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Explanatory notice */}
        <p style={{ fontSize: '12.5px', color: '#cfd4df', lineHeight: 1.5, marginBottom: '18px' }}>
          The <strong style={{ color: '#e0aaff' }}>Kokushibo Moon Admin Console</strong> contains core corps controls, database sync triggers, and roster override abilities. Enter your secret clearance passcode to disengage the seal.
        </p>

        {/* Passcode Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
        >
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label
              className="form-label"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: '#ffd166',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Key size={12} color="#ffd166" />
              <span>SECRET CLEARANCE PASSCODE (暗号)</span>
            </label>

            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter admin passcode (e.g. kagaya_eternal_feeling)"
                className="form-input"
                style={{
                  width: '100%',
                  paddingRight: '42px',
                  paddingLeft: '14px',
                  borderColor: error ? '#ff4d6d' : 'rgba(157, 78, 221, 0.4)',
                  background: 'rgba(10, 6, 16, 0.75)',
                  fontSize: '14px',
                  boxShadow: error ? '0 0 12px rgba(255, 77, 109, 0.25)' : 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#9ba1b0',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Message if Denied */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(230, 57, 70, 0.15)',
                border: '1px solid rgba(230, 57, 70, 0.45)',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '14px',
                fontSize: '12px',
                color: '#ff758f',
                fontWeight: 600
              }}
            >
              <AlertTriangle size={14} color="#ff758f" />
              <span>{error}</span>
            </div>
          )}

          {/* Master Ubuyashiki Quick-Fill Helper / Hint */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(157, 78, 221, 0.12)',
              border: '1px dashed rgba(157, 78, 221, 0.35)',
              borderRadius: '8px',
              padding: '8px 12px',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '11px', color: '#e0aaff' }}>
              <span style={{ color: '#ffd166', fontWeight: 700 }}>Canon Passcode: </span>
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '4px' }}>
                kagaya_eternal_feeling
              </code>
            </div>
            <button
              type="button"
              onClick={handleFillCanon}
              style={{
                background: 'rgba(255, 183, 3, 0.18)',
                border: '1px solid rgba(255, 183, 3, 0.4)',
                color: '#ffd166',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Auto-fill and verify Master Ubuyashiki clearance"
            >
              <Sparkles size={11} color="#ffd166" />
              <span>Auto Fill</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #7b2cbf 0%, #9d4edd 50%, #c77dff 100%)',
                borderColor: '#c77dff',
                boxShadow: '0 0 20px rgba(157, 78, 221, 0.45)',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              {isVerifying ? (
                <>
                  <span className="pulse-dot"></span>
                  <span>Verifying Seal...</span>
                </>
              ) : (
                <>
                  <Key size={14} />
                  <span>Breach Seal & Enter Console</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes shakePasscode {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-9px); }
          40% { transform: translateX(9px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .shake-animation {
          animation: shakePasscode 0.45s ease-in-out;
        }
      `}</style>
    </div>
  );
}
