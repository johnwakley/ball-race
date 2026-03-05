import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import type { Employee, PhysicsConfig } from '../types';

interface Props {
  employees: Employee[];
  physicsConfig: PhysicsConfig;
  winningPlaces: number;
  existingWinners: string[];
  onFinish: (newWinnerIds: string[]) => void;
}

export const RaceCanvas: React.FC<Props> = ({ employees, physicsConfig, winningPlaces, existingWinners, onFinish }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const gateRef = useRef<Matter.Body | null>(null);
  const [isReleased, setIsReleased] = useState(false);
  
  // Configuration
  const BOARD_WIDTH = 800;
  const BOARD_HEIGHT = Math.max(600, window.innerHeight - 250); // Responsive height with padding
  
  useEffect(() => {
    if (!sceneRef.current) return;

    // 1. Setup Matter.js
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Runner = Matter.Runner;
    const Events = Matter.Events;

    const engine = Engine.create();
    engineRef.current = engine;

    // Apply Gravity from Config
    engine.gravity.scale = 0.001 * physicsConfig.gravity;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT,
        wireframes: false, // We want full color
        background: '#0a0a0f'
      }
    });
    renderRef.current = render;

    // 2. Build World (Walls & Pins)
    const wallOptions = { 
      isStatic: true,
      render: { fillStyle: '#1c1c2e' },
      restitution: physicsConfig.restitution
    };

    // Walls
    World.add(engine.world, [
      Bodies.rectangle(BOARD_WIDTH / 2, BOARD_HEIGHT + 50, BOARD_WIDTH, 100, wallOptions), // Ground
      Bodies.rectangle(-25, BOARD_HEIGHT / 2, 50, BOARD_HEIGHT, wallOptions), // Left
      Bodies.rectangle(BOARD_WIDTH + 25, BOARD_HEIGHT / 2, 50, BOARD_HEIGHT, wallOptions) // Right
    ]);

    // Pins (Pachinko Style)
    const pins: Matter.Body[] = [];
    const startY = 150;
    const spacing = 50;
    // We want at least 150px clearance from the bottom of the pins to the start of the funnel (BOARD_HEIGHT - 100)
    // So pins should not go lower than BOARD_HEIGHT - 250
    const rows = Math.floor((BOARD_HEIGHT - 350) / spacing);

    for (let row = 0; row < rows; row++) {
      const cols = row % 2 === 0 ? 15 : 16;
      const xOffset = row % 2 === 0 ? 50 : 25;
      
      for (let col = 0; col < cols; col++) {
        const x = xOffset + col * spacing;
        const y = startY + row * spacing;
        
        // Ensure at least 35px clearance from edges for the 14px radius balls (28px diameter)
        if (x > 35 && x < BOARD_WIDTH - 35) {
          pins.push(Bodies.circle(x, y, 4, {
            isStatic: true,
            render: { fillStyle: '#ffffff' },
            restitution: physicsConfig.restitution
          }));
        }
      }
    }
    World.add(engine.world, pins);

    // Funnel at bottom
    // We want a single exit point to determine the winner clearly
    const funnelLeft = Bodies.rectangle(BOARD_WIDTH/2 - 100, BOARD_HEIGHT - 100, 200, 20, { 
      isStatic: true, 
      angle: Math.PI / 4,
      render: { fillStyle: '#1c1c2e' },
      restitution: physicsConfig.restitution
    });
    const funnelRight = Bodies.rectangle(BOARD_WIDTH/2 + 100, BOARD_HEIGHT - 100, 200, 20, { 
      isStatic: true, 
      angle: -Math.PI / 4,
      render: { fillStyle: '#1c1c2e' },
      restitution: physicsConfig.restitution
    });
    World.add(engine.world, [funnelLeft, funnelRight]);
    
    // Finish Line Sensor
    const finishLine = Bodies.rectangle(BOARD_WIDTH/2, BOARD_HEIGHT - 30, 60, 10, {
      isSensor: true,
      isStatic: true,
      label: 'finish_line',
      render: { 
        fillStyle: '#00ff00',
        opacity: 0.5
      }
    });
    World.add(engine.world, finishLine);

    // 3. Spawn Balls logic
    // We need to mix the balls up so they aren't clumped by employee
    let allBalls: { employeeId: string, color: string, initials: string, textColor: string }[] = [];
    employees.forEach(emp => {
      const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      };
      const getContrastColor = (hex: string) => {
        const h = hex.replace('#', '');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
      };
      
      const initials = getInitials(emp.name);
      const textColor = getContrastColor(emp.color);
      
      for(let i=0; i<emp.entries; i++) {
        allBalls.push({ employeeId: emp.id, color: emp.color, initials, textColor });
      }
    });
    // Shuffle using Fisher-Yates for better randomness
    for (let i = allBalls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allBalls[i], allBalls[j]] = [allBalls[j], allBalls[i]];
    }

    // GATE MECHANISM
    // 1. Create the gate
    const gateY = 100;
    const gate = Bodies.rectangle(BOARD_WIDTH / 2, gateY, BOARD_WIDTH, 20, {
      isStatic: true,
      render: { fillStyle: '#ff003c' },
      label: 'gate'
    });
    gateRef.current = gate;
    World.add(engine.world, gate);

    // 2. Spawn all balls in a grid above the gate
    const balls: Matter.Body[] = [];
    const ballRadius = 14; 
    const cols = Math.floor((BOARD_WIDTH - 100) / (ballRadius * 2.5)); // Space them out
    const startX = 50;

    // Generate all possible slots first
    // We need enough slots for all balls (plus some extras doesn't hurt, but we just need enough)
    // Let's generate a generous grid of slots
    const slots: {col: number, row: number}[] = [];
    const maxRows = Math.ceil(allBalls.length / cols) + 5; // Add buffer rows
    
    for(let r=0; r<maxRows; r++) {
        for(let c=0; c<cols; c++) {
            slots.push({ col: c, row: r });
        }
    }

    // Shuffle slots using Fisher-Yates
    for (let i = slots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    allBalls.forEach((ballData, index) => {
      // Use the shuffled slots
      const slot = slots[index % slots.length]; // modulo just for safety, though we made enough
      
      // Add significant jitter to X and random offset to Y to break the grid look
      const jitterX = (Math.random() - 0.5) * 15; // Increased jitter +/- 7.5px
      const jitterY = (Math.random() - 0.5) * 15; // Random Y variation +/- 7.5px
      
      const x = startX + slot.col * (ballRadius * 2.5) + jitterX;
      const y = gateY - 40 - (slot.row * (ballRadius * 2.5)) + jitterY;

      const ball = Bodies.circle(x, y, ballRadius, {
        restitution: physicsConfig.restitution,
        friction: 0.001, // Low friction for slipping
        label: `ball_${ballData.employeeId}`,
        render: {
          fillStyle: ballData.color
        },
        plugin: {
          initials: ballData.initials,
          textColor: ballData.textColor
        }
      });
      balls.push(ball);
    });
    World.add(engine.world, balls);

    // 3. Release is now handled manually via the handleRelease function.
    // The automatic timeout was removed.

    // 4. Collision Detection
    const localWinners: string[] = [];
    
    // Import SoundManager dynamically or expect it to be available if singleton
    // But we can import at top level if not circular. It is singleton.
    
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        // Check if one is finish line and other is ball
        const finish = bodyA.label === 'finish_line' ? bodyA : (bodyB.label === 'finish_line' ? bodyB : null);
        const ball = bodyA.label.startsWith('ball_') ? bodyA : (bodyB.label.startsWith('ball_') ? bodyB : null);

        const isBallA = bodyA.label.startsWith('ball_');
        const isBallB = bodyB.label.startsWith('ball_');

        // Sound: Check for ball collision with pins or walls (for pings)
        if (physicsConfig.soundEnabled && (isBallA || isBallB)) {
             // Find the Y position of the ball(s) involved
             const yA = isBallA ? bodyA.position.y : 0;
             const yB = isBallB ? bodyB.position.y : 0;
             const ballY = Math.max(yA, yB);

             // To prevent perpetual noise, we stop playing the ping sound once 
             // the ball enters the catcher funnel area (below all the pins).
             // The lowest pin is around BOARD_HEIGHT - 250.
             if (ballY < BOARD_HEIGHT - 150) {
               import('../audio/SoundManager').then(({ soundManager }) => {
                  soundManager.playPing(); 
               });
             }
        }

        if (finish && ball) {
          const empId = ball.label.replace('ball_', '');

          // Allow multiples: DO NOT check existingWinners or localWinners for duplicates.
          // Just check if we have enough total winners.

          // Ignore if we already have enough winners total
          const totalWinners = existingWinners.length + localWinners.length;
          if (totalWinners >= winningPlaces) return;

          // It's a valid new winner!
          localWinners.push(empId);
          onFinish([...localWinners]); // Update parent with LOCAL winners only
          
          // Win Sound
          if ((existingWinners.length + localWinners.length) === winningPlaces && physicsConfig.soundEnabled) {
                import('../audio/SoundManager').then(({ soundManager }) => {
                  soundManager.playWin();
                });
          }
        }
      });
    });

    // 5. Custom render for initials
    Events.on(render, 'afterRender', () => {
      const context = render.context;
      if (!context) return;
      
      context.font = 'bold 10px sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      // Slight shadow to help text stand out against light colors
      context.shadowColor = 'rgba(0, 0, 0, 0.4)';
      context.shadowBlur = 2;

      balls.forEach(({ position, plugin, render: bodyRender }) => {
         if (plugin.initials && bodyRender.visible) {
             context.fillStyle = plugin.textColor || '#ffffff';
             context.fillText(plugin.initials, position.x, position.y);
         }
      });
      
      // Reset shadow for next tick
      context.shadowBlur = 0;
    });

    // Run
    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    // Cleanup
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
      if (render.canvas) {
        render.canvas.remove();
      }
      render.canvas = null!;
      render.context = null!;
      render.textures = {};
    };
  }, []); // Run once on mount (or when deps change, but we want stability)

  const handleRelease = () => {
    if (isReleased || !engineRef.current || !gateRef.current) return;
    
    Matter.World.remove(engineRef.current.world, gateRef.current);
    setIsReleased(true);
    
    if (physicsConfig.soundEnabled) {
      import('../audio/SoundManager').then(({ soundManager }) => {
        soundManager.playPing(2.0); 
      });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div 
        ref={sceneRef} 
        style={{
          border: '4px solid var(--bg-tertiary)', 
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 0 50px rgba(0,0,0,0.5)'
        }}
      />
      {!isReleased && (
        <button 
          onClick={handleRelease}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '1.5rem 3rem',
            fontSize: '2rem',
            fontWeight: 800,
            background: 'linear-gradient(45deg, var(--accent-magenta), var(--accent-purple))',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 0 30px rgba(191,0,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
        >
          Release Balls
        </button>
      )}
    </div>
  );
};
