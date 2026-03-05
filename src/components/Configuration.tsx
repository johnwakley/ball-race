import React, { useState } from 'react';
import type { Employee, PhysicsConfig } from '../types';

interface Props {
  employees: Employee[];
  physicsConfig: PhysicsConfig;
  winningPlaces: number;
  onAdd: (name: string, entries: number) => void;
  onRemove: (id: string) => void;
  onUpdateEntries: (id: string, entries: number) => void;
  onUpdatePhysics: (config: PhysicsConfig) => void;
  onUpdateWinningPlaces: (n: number) => void;
  onStart: () => void;
}

export const Configuration: React.FC<Props> = ({ 
  employees, 
  physicsConfig,
  winningPlaces,
  onAdd, 
  onRemove, 
  onUpdateEntries,
  onUpdatePhysics,
  onUpdateWinningPlaces,
  onStart 
}) => {
  const [newName, setNewName] = useState('');
  const [newEntries, setNewEntries] = useState(1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName, newEntries);
      setNewName('');
      setNewEntries(1);
    }
  };

  return (
    <div className="config-container" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      background: 'rgba(28, 28, 46, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--bg-tertiary)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      <h2 style={{
        marginTop: 0,
        marginBottom: '2rem',
        textAlign: 'center',
        background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-green))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '2rem'
      }}>
        Race Configuration
      </h2>

      {/* Physics Tuning */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid var(--bg-tertiary)'
      }}>
        <h3 style={{ marginTop: 0, color: 'var(--accent-cyan)' }}>Physics Tuning</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Bounciness (Restitution): {physicsConfig.restitution.toFixed(1)}
            </label>
            <input 
              type="range" 
              min="0.1" 
              max="1.2" 
              step="0.1"
              value={physicsConfig.restitution}
              onChange={(e) => onUpdatePhysics({ ...physicsConfig, restitution: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Gravity Scale: {physicsConfig.gravity.toFixed(1)}
            </label>
            <input 
              type="range" 
              min="0.1" 
              max="3.0" 
              step="0.1"
              value={physicsConfig.gravity}
              onChange={(e) => onUpdatePhysics({ ...physicsConfig, gravity: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--accent-green)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Winning Places: {winningPlaces}
            </label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              value={winningPlaces}
              onChange={(e) => onUpdateWinningPlaces(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--accent-magenta)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <input 
              type="checkbox"
              id="soundToggle"
              checked={physicsConfig.soundEnabled}
              onChange={(e) => onUpdatePhysics({ ...physicsConfig, soundEnabled: e.target.checked })}
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-cyan)' }}
            />
            <label htmlFor="soundToggle" style={{ color: 'var(--text-primary)', cursor: 'pointer' }}>
              Enable Sound Effects
            </label>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <h3 style={{ color: 'var(--accent-cyan)' }}>Employees</h3>
      <div style={{ marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto' }}>
        {employees.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No employees added yet. Add some below!
          </div>
        ) : (
          employees.map(emp => (
            <div key={emp.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              marginBottom: '0.5rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius-md)',
              borderLeft: `4px solid ${emp.color}`
            }}>
              <span style={{ 
                flex: 1, 
                fontWeight: 600,
                fontSize: '1.1rem' 
              }}>
                {emp.name}
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Entries:</label>
                  <input 
                    type="number" 
                    min="1"
                    value={emp.entries}
                    onChange={(e) => onUpdateEntries(emp.id, parseInt(e.target.value) || 1)}
                    style={{
                      width: '60px',
                      padding: '0.5rem',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--bg-tertiary)',
                      borderRadius: '4px',
                      color: 'white',
                      textAlign: 'center'
                    }}
                  />
                </div>
                
                <button 
                  onClick={() => onRemove(emp.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent-magenta)',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    fontSize: '1.2rem',
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                  }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} style={{
        display: 'grid',
        gridTemplateColumns: '1fr 100px auto',
        gap: '1rem',
        marginBottom: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--bg-tertiary)'
      }}>
        <input 
          type="text" 
          placeholder="Employee Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{
            padding: '1rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            color: 'white',
            fontSize: '1rem'
          }}
        />
        <input 
          type="number" 
          min="1"
          placeholder="Entries"
          value={newEntries}
          onChange={(e) => setNewEntries(parseInt(e.target.value) || 1)}
          style={{
            padding: '1rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-tertiary)',
            borderRadius: 'var(--border-radius-md)',
            color: 'white',
            fontSize: '1rem',
            textAlign: 'center'
          }}
        />
        <button 
          type="submit"
          style={{
            padding: '0 2rem',
            background: 'var(--accent-cyan)',
            color: 'black',
            border: 'none',
            borderRadius: 'var(--border-radius-md)',
            fontWeight: 800,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Add
        </button>
      </form>

      {/* Start Button */}
      {employees.length > 0 && (
        <button 
          onClick={onStart}
          style={{
            width: '100%',
            padding: '1.5rem',
            background: 'linear-gradient(45deg, var(--accent-magenta), var(--accent-purple))',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '1.5rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            cursor: 'pointer',
            boxShadow: 'var(--glow-magenta)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          START RACE
        </button>
      )}
    </div>
  );
};
