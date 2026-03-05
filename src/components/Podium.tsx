import React from 'react';
import type { Employee } from '../types';

interface Props {
  winners: string[]; // IDs
  employees: Employee[];
  onReset: () => void;
  onClose: () => void;
}

export const Podium: React.FC<Props> = ({ winners, employees, onReset, onClose }) => {
  const getEmployee = (id: string) => employees.find(e => e.id === id);

  const renderStep = (empId: string, place: number) => {
    const emp = getEmployee(empId);
    if (!emp) return null;
    
    const height = Math.max(80, 200 - (place - 1) * 40) + 'px';
    const color = place === 1 ? '#ffd700' : place === 2 ? '#c0c0c0' : place === 3 ? '#cd7f32' : '#555';
    
    return (
      <div key={empId + place} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        margin: '0 0.5rem'
      }}>
        <div style={{
          marginBottom: '1rem',
          textAlign: 'center',
          animation: 'fadeInUp 0.5s ease-out'
        }}>
          <div style={{ 
            fontSize: '1.2rem', 
            fontWeight: 800, 
            color: emp.color,
            textShadow: `0 0 10px ${emp.color}`
          }}>
            {emp.name}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {place === 1 ? '1st' : place === 2 ? '2nd' : place === 3 ? '3rd' : `${place}th`} Place
          </div>
        </div>
        
        <div style={{
          width: '100px',
          height: height,
          background: `linear-gradient(to bottom, ${color} 0%, rgba(255,255,255,0.1) 100%)`,
          borderTop: `4px solid ${color}`,
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          fontWeight: 900,
          color: 'rgba(0,0,0,0.3)',
          boxShadow: `0 0 20px ${color}40`
        }}>
          {place}
        </div>
      </div>
    );
  };

  const orderedPlaces: number[] = [];
  for (let i = 0; i < winners.length; i++) {
     if (i % 2 !== 0) {
        orderedPlaces.unshift(i);
     } else {
        orderedPlaces.push(i);
     }
  }

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
        justifyContent: 'center',
        marginBottom: '4rem',
        flexWrap: 'wrap'
      }}>
        {orderedPlaces.map(index => renderStep(winners[index], index + 1))}
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
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

        <button 
          onClick={onClose}
          style={{
            padding: '1rem 3rem',
            background: 'transparent',
            color: 'white',
            border: '2px solid white',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '1.2rem',
            fontWeight: 800,
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          View Board
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
