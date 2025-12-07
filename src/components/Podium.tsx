import React from 'react';
import type { Employee } from '../types';

interface Props {
  winners: string[]; // IDs
  employees: Employee[];
  onReset: () => void;
}

export const Podium: React.FC<Props> = ({ winners, employees, onReset }) => {
  const getEmployee = (id: string) => employees.find(e => e.id === id);

  const first = getEmployee(winners[0]);
  const second = getEmployee(winners[1]);
  const third = getEmployee(winners[2]);

  const renderStep = (emp: Employee | undefined, place: number) => {
    if (!emp) return null;
    
    const height = place === 1 ? '200px' : place === 2 ? '150px' : '120px';
    const color = place === 1 ? '#ffd700' : place === 2 ? '#c0c0c0' : '#cd7f32';
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        margin: '0 1rem'
      }}>
        <div style={{
          marginBottom: '1rem',
          textAlign: 'center',
          animation: 'fadeInUp 0.5s ease-out'
        }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 800, 
            color: emp.color,
            textShadow: `0 0 10px ${emp.color}`
          }}>
            {emp.name}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            {place === 1 ? '1st Place' : place === 2 ? '2nd Place' : '3rd Place'}
          </div>
        </div>
        
        <div style={{
          width: '120px',
          height: height,
          background: `linear-gradient(to bottom, ${color} 0%, rgba(255,255,255,0.1) 100%)`,
          borderTop: `4px solid ${color}`,
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          fontWeight: 900,
          color: 'rgba(0,0,0,0.3)',
          boxShadow: `0 0 20px ${color}40`
        }}>
          {place}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      backdropFilter: 'blur(5px)'
    }}>
      <h2 style={{
        fontSize: '4rem',
        textTransform: 'uppercase',
        background: 'linear-gradient(to right, #ffd700, #ffaa00)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '4rem',
        filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))'
      }}>
        Winners
      </h2>

      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        marginBottom: '4rem'
      }}>
        {renderStep(second, 2)}
        {renderStep(first, 1)}
        {renderStep(third, 3)}
      </div>

      <button 
        onClick={onReset}
        style={{
          padding: '1rem 3rem',
          background: 'white',
          color: 'black',
          border: 'none',
          borderRadius: 'var(--border-radius-md)',
          fontSize: '1.2rem',
          fontWeight: 800,
          cursor: 'pointer',
          textTransform: 'uppercase'
        }}
      >
        New Race
      </button>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
