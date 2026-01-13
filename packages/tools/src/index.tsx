
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PulseRegistry, type PulseUnit } from '@pulse-js/core';
import { usePulse } from '@pulse-js/react';

// --- Premium Dark Theme Constants ---
const COLORS = {
  bg: 'rgba(13, 13, 18, 0.85)',
  border: 'rgba(255, 255, 255, 0.1)',
  accent: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
  error: '#ff4b2b',
  success: '#00f260',
  pending: '#fdbb2d',
  text: '#ffffff',
  secondaryText: '#a0a0a0',
  cardBg: 'rgba(255, 255, 255, 0.05)',
};

// --- Custom Scrollbar Styles ---
const SCROLLBAR_CSS = `
  .pulse-devtools-list::-webkit-scrollbar {
    width: 6px;
  }
  .pulse-devtools-list::-webkit-scrollbar-track {
    background: transparent;
  }
  .pulse-devtools-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .pulse-devtools-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const HeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'rgba(0,0,0,0.3)',
  borderBottom: `1px solid ${COLORS.border}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'grab',
  userSelect: 'none',
};

const ListStyle: React.CSSProperties = {
  padding: '12px',
  overflowY: 'auto',
  maxHeight: '320px', // Limits height after ~4-5 items
  flex: '0 1 auto',
};

const UnitStyle = (status: string, isError: boolean): React.CSSProperties => ({
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '10px',
  backgroundColor: COLORS.cardBg,
  border: `1px solid ${isError ? COLORS.error : COLORS.border}`,
  fontSize: '13px',
  transition: 'all 0.2s ease',
  boxShadow: isError ? `0 0 10px ${COLORS.error}44` : 'none',
});

const StatusDot = (status: string): React.CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  display: 'inline-block',
  marginRight: '8px',
  backgroundColor: status === 'ok' ? COLORS.success : status === 'fail' ? COLORS.error : COLORS.pending,
  boxShadow: `0 0 8px ${status === 'ok' ? COLORS.success : status === 'fail' ? COLORS.error : COLORS.pending}`,
});

// --- Global Utilities & Constants ---
const STORAGE_KEY = 'pulse-devtools-pos';
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

// --- Draggable Logic Hook ---
function useDraggable() {
  const [position, setPositionState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { x: window.innerWidth - 140, y: window.innerHeight - 65 };
  });

  const isDragging = useRef(false);
  const startMousePos = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const totalMovement = useRef(0);

  const updatePosition = useCallback((newPos: { x: number, y: number }) => {
    setPositionState(newPos);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPos));
    } catch (e) {}
  }, []);

  const onMouseMove = useCallback((e: MouseEvent, currentW: number, currentH: number) => {
    if (!isDragging.current) return;
    
    totalMovement.current += Math.abs(e.clientX - startMousePos.current.x) + Math.abs(e.clientY - startMousePos.current.y);
    startMousePos.current = { x: e.clientX, y: e.clientY };

    updatePosition({
      x: clamp(e.clientX - offset.current.x, 0, Math.max(0, window.innerWidth - currentW)),
      y: clamp(e.clientY - offset.current.y, 0, Math.max(0, window.innerHeight - currentH))
    });
  }, [updatePosition]);

  const startDragging = useCallback((e: React.MouseEvent, w: number, h: number) => {
    isDragging.current = true;
    totalMovement.current = 0;
    startMousePos.current = { x: e.clientX, y: e.clientY };
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };

    const handleMove = (moveEv: MouseEvent) => onMouseMove(moveEv, w, h);
    const handleUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [position, onMouseMove]);

  return { position, updatePosition, startDragging, totalMovement };
}

// --- Components ---

const UnitItem = ({ unit }: { unit: PulseUnit }) => {
  const isGuard = 'state' in unit;
  const name = (unit as any)._name || (isGuard ? 'Unnamed Guard' : 'Unnamed Source');
  const hasWarning = !(unit as any)._name;

  if (isGuard) {
    const state = usePulse(unit as any) as any;
    return (
      <div style={UnitStyle(state.status, state.status === 'fail')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span>
             <span style={StatusDot(state.status)} />
             <strong style={{ color: COLORS.text }}>{name}</strong>
          </span>
          <span style={{ fontSize: '10px', color: COLORS.secondaryText }}>GUARD</span>
        </div>
        
        {state.status === 'ok' && (
          <div style={{ wordBreak: 'break-all', color: COLORS.secondaryText }}>
            Value: <code style={{ color: COLORS.success }}>{JSON.stringify(state.value)}</code>
          </div>
        )}
        
        {state.status === 'fail' && (
          <div style={{ color: COLORS.error, fontSize: '11px', marginTop: '4px', background: `${COLORS.error}11`, padding: '4px', borderRadius: '4px' }}>
            Error: {state.reason}
          </div>
        )}

        {hasWarning && (
          <div style={{ fontSize: '10px', color: COLORS.pending, marginTop: '5px', opacity: 0.8 }}>
            ⚠️ Best practice: Give guards a name for better debugging.
          </div>
        )}
      </div>
    );
  } else {
    const value = usePulse(unit as any);
    return (
      <div style={UnitStyle('ok', false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span>
             <span style={StatusDot('ok')} />
             <strong style={{ color: COLORS.text }}>{name}</strong>
          </span>
          <span style={{ fontSize: '10px', color: COLORS.secondaryText }}>SOURCE</span>
        </div>
        <div style={{ wordBreak: 'break-all', color: COLORS.secondaryText }}>
          Value: <code style={{ color: '#00d2ff' }}>{JSON.stringify(value)}</code>
        </div>
        {hasWarning && (
           <div style={{ fontSize: '10px', color: COLORS.pending, marginTop: '5px', opacity: 0.8 }}>
             ⚠️ Tip: Name this source in `source(val, {"{ name: '...' }"})`
           </div>
        )}
      </div>
    );
  }
};

export const PulseDevTools = ({ shortcut = 'Ctrl+D' }: { shortcut?: string }): any => {
  const [units, setUnits] = useState<PulseUnit[]>(() => PulseRegistry.getAll());
  const [isOpen, setIsOpen] = useState(false);
  
  // Widget dimensions
  const W = 350;
  const H = 450;
  const BTN_W = 120;
  const BTN_H = 45;

  const { position, updatePosition, startDragging, totalMovement } = useDraggable();

  const handleToggle = useCallback(() => {
    if (totalMovement.current < 5) {
      setIsOpen(prev => {
        const next = !prev;
        const isLeft = position.x < (window.innerWidth / 2);
        const isTop = position.y < (window.innerHeight / 2);

        if (next) {
          // Opening: Expand relative to quadrant
          updatePosition({
            x: clamp(isLeft ? position.x : position.x + BTN_W - W, 0, window.innerWidth - W),
            y: clamp(isTop ? position.y : position.y + BTN_H - H, 0, window.innerHeight - H)
          });
        } else {
          // Closing: Shrink relative to quadrant
          updatePosition({
            x: clamp(isLeft ? position.x : position.x + W - BTN_W, 0, window.innerWidth - BTN_W),
            y: clamp(isTop ? position.y : position.y + H - BTN_H, 0, window.innerHeight - BTN_H)
          });
        }
        return next;
      });
    }
  }, [totalMovement, updatePosition, position.x, position.y]);

  // Inject Custom Scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = SCROLLBAR_CSS;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Registry Update Listener
  useEffect(() => {
    const unsubscribe = PulseRegistry.onRegister((newUnit) => {
      setUnits(prev => {
        const name = (newUnit as any)._name;
        if (name) {
          const index = prev.findIndex(u => (u as any)._name === name);
          if (index !== -1) {
            const next = [...prev];
            next[index] = newUnit;
            return next;
          }
        }
        return [...prev, newUnit];
      });
    });
    return () => { unsubscribe(); };
  }, []);

  // Shortcut Listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const parts = shortcut.toLowerCase().split('+');
      const needsCtrl = parts.includes('ctrl');
      const key = parts[parts.length - 1];
      
      if (needsCtrl && e.ctrlKey && e.key.toLowerCase() === key) {
        e.preventDefault();
        handleToggle();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [shortcut, handleToggle]);

  if (!isOpen) {
    return (
      <button 
        onMouseDown={(e) => startDragging(e, BTN_W, BTN_H)}
        onClick={handleToggle}
        title={`Toggle Pulse DevTools (${shortcut})`}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${BTN_W}px`,
          height: `${BTN_H}px`,
          padding: 0,
          borderRadius: '30px',
          border: `1px solid ${COLORS.border}`,
          background: COLORS.bg,
          backdropFilter: 'blur(15px)',
          color: 'white',
          fontWeight: 600,
          cursor: 'grab',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 9999,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS.accent, marginRight: '10px', boxShadow: `0 0 10px #00d2ff` }} />
        Pulse ({units.length})
      </button>
    );
  }

  return (
    <div 
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${W}px`,
        maxHeight: `${H}px`,
        backgroundColor: COLORS.bg,
        backdropFilter: 'blur(15px)',
        border: `1px solid ${COLORS.border}`,
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      <div style={HeaderStyle} onMouseDown={(e) => startDragging(e, W, H)}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
           <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: COLORS.accent, marginRight: '10px', boxShadow: `0 0 8px #00d2ff` }} />
           <span style={{ color: 'white', fontWeight: 600 }}>Pulse Inspector</span>
        </div>
        <button 
          onClick={handleToggle}
          style={{ background: 'transparent', border: 'none', color: COLORS.secondaryText, cursor: 'pointer', fontSize: '20px', padding: '0 5px' }}
        >
          ×
        </button>
      </div>

      <div style={ListStyle} className="pulse-devtools-list">
        {units.length === 0 ? (
          <div style={{ textAlign: 'center', color: COLORS.secondaryText, marginTop: '40px', fontSize: '14px' }}>
            No reactive units detected.<br/>
            <span style={{ fontSize: '11px', opacity: 0.6 }}>Use source() or guard() to begin.</span>
          </div>
        ) : (
          units.map((u, i) => <UnitItem key={(u as any)._name || i} unit={u} />)
        )}
      </div>

      <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: COLORS.secondaryText }}>
        <span>v0.1.0</span>
        <span>Drag header to move • {shortcut} to toggle</span>
      </div>
    </div>
  );
};
