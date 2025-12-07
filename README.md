# Employee Ball Race 🎱 🏆

A premium, physics-based "Race" to determine winners for employee prize draws. 

Instead of a boring random number generator, visualize the draw as an exciting, high-stakes Pachinko-style ball race!

## ✨ Features

- **Weighted Draw**: Employees with more "entries" get more balls, increasing their chances without guaranteeing a win.
- **Physics-Based**: Built with [matter.js](https://brm.io/matter-js/) for realistic 2D rigid body physics.
- **Fairness First**: 
    - **Gate Release**: All balls start simultaneously from a holding pen.
    - **Slot Shuffling**: Starting positions are randomized on the grid to prevent positional bias.
    - **True Randomness**: Fisher-Yates shuffle ensures unpredictable drop orders.
- **Premium Aesthetics**: Dark mode interface with vibrant neon colors (Golden Angle generated for distinctiveness).
- **Immersive Audio**: Real-time synthesized sound effects (Web Audio API) for collisions and wins.
- **Persistent Winners**: Restarting a race keeps existing winners (e.g. 1st place) and only races for the remaining podium spots.
- **Physics Tuning**: Customize the simulation with controls for **Gravity** (0.1x to 3.0x) and **Bounciness**.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/employee-ball-race.git
   cd employee-ball-race
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`.

## 🎮 How to Play

1. **Configuration**: 
   - Enter employee names.
   - Assign "Entries" (Tickets) to each. 
   - *Tip: More entries = More balls = Higher chance to win.*
2. **Tune It**:
   - Adjust Gravity for slow-mo drama or high-speed chaos.
   - Toggle Sound Effects on/off.
3. **The Race**:
   - Click **START RACE**.
   - Watch the "READY... SET... GO!" countdown.
   - Cheer on your color as balls navigate the pegboard.
4. **The Podium**:
   - The first 3 balls to cross the finish line take the podium.
   - *Note: One employee can win multiple spots if their balls finish 1st and 2nd!*

## 🛠️ Built With

- **React** - UI Framework
- **Vite** - Build Tool
- **TypeScript** - Type Safety
- **Matter.js** - 2D Physics Engine
- **Canvas Confetti** - Celebratory Effects

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
