export const generateId = () => Math.random().toString(36).substr(2, 9);

export const PRESET_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Lime
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#00FFFF', // Cyan
  '#FF00FF', // Magenta
  '#FF8000', // Orange
  '#8000FF', // Purple
  '#00FF80', // Spring Green
  '#FF0080', // Rose
  '#FFD700', // Gold
  '#FF4500', // OrangeRed
  '#1E90FF', // DodgerBlue
  '#32CD32', // LimeGreen
  '#FF1493', // DeepPink
  '#9400D3', // DarkViolet
  '#00CED1', // DarkTurquoise
  '#FF6347', // Tomato
  '#7FFF00', // Chartreuse
  '#BA55D3', // MediumOrchid
];

export const getColorByIndex = (index: number) => {
  return PRESET_COLORS[index % PRESET_COLORS.length];
};

export const getRandomColor = () => {
  return PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
};
