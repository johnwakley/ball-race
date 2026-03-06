import { useState, useCallback, useEffect } from 'react';
import { Configuration } from './components/Configuration';
import { RaceCanvas } from './components/RaceCanvas';
import { Podium } from './components/Podium';
import type { Employee, AppState, PhysicsConfig } from './types';
import { generateId, getColorByIndex } from './utils';
import confetti from 'canvas-confetti';

function App() {
  const [appState, setAppState] = useState<AppState>('CONFIG');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [winningPlaces, setWinningPlaces] = useState(1);
  // const [winners, setWinners] = useState<string[]>([]); // Removed in favor of locked+active
  const [physicsConfig, setPhysicsConfig] = useState<PhysicsConfig>({
    restitution: 0.5,
    gravity: 1.0,
    soundEnabled: true
  });

  // Effect to sync sound manager
  useEffect(() => {
    import('./audio/SoundManager').then(({ soundManager }) => {
      soundManager.setMute(!physicsConfig.soundEnabled);
    });
  }, [physicsConfig.soundEnabled]);

  const [raceId, setRaceId] = useState(0);
  const [lockedWinners, setLockedWinners] = useState<string[]>([]);
  const [activeWinners, setActiveWinners] = useState<string[]>([]);
  const [showPodium, setShowPodium] = useState(false);

  // Derived state for all winners
  const allWinners = [...lockedWinners, ...activeWinners];

  const handleAddEmployee = (name: string, entries: number) => {
    setEmployees(prev => [
      ...prev, 
      { 
        id: generateId(), 
        name, 
        entries, 
        color: getColorByIndex(prev.length)
      }
    ]);
  };

  const handleRemoveEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateEntries = (id: string, entries: number) => {
    setEmployees(prev => prev.map(e => 
      e.id === id ? { ...e, entries } : e
    ));
  };

  const handleStartRace = () => {
    setLockedWinners([]);
    setActiveWinners([]);
    setShowPodium(false);
    setRaceId(prev => prev + 1);
    setAppState('RACE');
  };

  const handleRestartRace = () => {
    // Lock current winners, clear active
    setLockedWinners(prev => [...prev, ...activeWinners]);
    setActiveWinners([]);
    setShowPodium(false);
    setRaceId(prev => prev + 1);
  };

  const handleRaceFinish = useCallback((newWinnerIds: string[]) => {
    setActiveWinners(newWinnerIds);
    
    // Check total count
    const totalCount = lockedWinners.length + newWinnerIds.length;
    
    if (totalCount >= winningPlaces || totalCount === employees.length) {
      // Trigger confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Delay slightly to let the last winning ball settle visually
      setTimeout(() => {
        setShowPodium(true);
      }, 3000);
    }
  }, [lockedWinners.length, employees.length]);

  const handleReset = () => {
    setAppState('CONFIG');
    setLockedWinners([]);
    setActiveWinners([]);
  };

  return (
    <div className="app-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      background: 'radial-gradient(circle at center, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
      position: 'relative'
    }}>
      {/* Header */}
      {appState === 'CONFIG' && (
        <h1 style={{ 
          fontSize: '3rem',  
          textTransform: 'uppercase', 
          letterSpacing: '0.2em',
          background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-purple))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
          filter: 'drop-shadow(0 0 15px rgba(191,0,255,0.3))',
          zIndex: 10
        }}>
          Ball Race
        </h1>
      )}

      {appState === 'CONFIG' && (
        <Configuration 
          employees={employees}
          physicsConfig={physicsConfig}
          winningPlaces={winningPlaces}
          onAdd={handleAddEmployee}
          onRemove={handleRemoveEmployee}
          onUpdateEntries={handleUpdateEntries}
          onUpdatePhysics={setPhysicsConfig}
          onUpdateWinningPlaces={setWinningPlaces}
          onStart={handleStartRace}
        />
      )}

      {appState === 'RACE' && (
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '50px 0' }}>
          <RaceCanvas 
            key={raceId}
            employees={employees}
            physicsConfig={physicsConfig}
            winningPlaces={winningPlaces}
            existingWinners={lockedWinners}
            onFinish={handleRaceFinish}
          />
          {/* Live Winner Ticker could go here */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '-250px',
            background: 'rgba(0,0,0,0.5)',
            padding: '1rem',
            borderRadius: '8px',
            width: '200px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid white' }}>Current Leaders</h3>
            {allWinners.map((id, index) => {
              const emp = employees.find(e => e.id === id);
              return (
                <div key={`${id}-${index}`} style={{ color: emp?.color, fontWeight: 'bold' }}>
                  {index + 1}. {emp?.name}
                </div>
              );
            })}
            
            {/* Show Restart button if we haven't found target winners yet */}
            {allWinners.length < winningPlaces && allWinners.length < employees.length && (
              <button 
                onClick={handleRestartRace}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid white',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                ⟳ Restart Race
              </button>
            )}
            
            {/* Show Reset button when race is fully complete and we closed the podium */}
            {allWinners.length >= winningPlaces && (
              <button 
                onClick={handleReset}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid white',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              >
                ← Back to Config
              </button>
            )}
            
            {/* Show Podium button if it's hidden but race is complete */}
            {allWinners.length >= winningPlaces && !showPodium && (
              <button 
                onClick={() => setShowPodium(true)}
                style={{
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(255, 215, 0, 0.2)',
                  border: '1px solid #ffd700',
                  borderRadius: '4px',
                  color: '#ffd700',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 215, 0, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)'}
              >
                ★ Show Winners
              </button>
            )}
            
          </div>
        </div>
      )}

      {appState === 'RACE' && showPodium && (
        <Podium 
          winners={allWinners}
          employees={employees}
          onReset={handleReset}
          onClose={() => setShowPodium(false)}
        />
      )}
    </div>
  );
}

export default App;
