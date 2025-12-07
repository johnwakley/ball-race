export interface Employee {
  id: string;
  name: string;
  entries: number;
  color: string;
}

export interface PhysicsConfig {
  restitution: number; // 0.1 - 1.2
  gravity: number; // 0.1 - 3.0
  soundEnabled: boolean;
}

export type AppState = 'CONFIG' | 'RACE' | 'RESULTS';
