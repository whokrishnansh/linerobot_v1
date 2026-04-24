// Wire connection mappings for Section 3 circuit diagram
export const CONNECTIONS = [
  // Sensor subsystem
  { id: 's1', from: 'leftIR-VCC', to: 'arduino-5V', subsystem: 'sensor', color: '#22C55E', label: 'VCC → 5V' },
  { id: 's2', from: 'leftIR-GND', to: 'arduino-GND', subsystem: 'sensor', color: '#0A0A0A', label: 'GND → GND' },
  { id: 's3', from: 'leftIR-OUT', to: 'arduino-D2', subsystem: 'sensor', color: '#FBBF24', label: 'OUT → D2' },
  { id: 's4', from: 'rightIR-VCC', to: 'arduino-5V', subsystem: 'sensor', color: '#22C55E', label: 'VCC → 5V' },
  { id: 's5', from: 'rightIR-GND', to: 'arduino-GND', subsystem: 'sensor', color: '#0A0A0A', label: 'GND → GND' },
  { id: 's6', from: 'rightIR-OUT', to: 'arduino-D3', subsystem: 'sensor', color: '#FBBF24', label: 'OUT → D3' },
  // Motor control subsystem (Arduino ↔ L298N)
  { id: 'm1', from: 'arduino-D5',  to: 'l298n-ENA', subsystem: 'motor', color: '#A855F7', label: 'D5 → ENA (PWM)' },
  { id: 'm2', from: 'arduino-D6',  to: 'l298n-ENB', subsystem: 'motor', color: '#22C55E', label: 'D6 → ENB (PWM)' },
  { id: 'm3', from: 'arduino-D8',  to: 'l298n-IN1', subsystem: 'motor', color: '#3B82F6', label: 'D8 → IN1' },
  { id: 'm4', from: 'arduino-D9',  to: 'l298n-IN2', subsystem: 'motor', color: '#F97316', label: 'D9 → IN2' },
  { id: 'm5', from: 'arduino-D10', to: 'l298n-IN3', subsystem: 'motor', color: '#EC4899', label: 'D10 → IN3' },
  { id: 'm6', from: 'arduino-D11', to: 'l298n-IN4', subsystem: 'motor', color: '#14B8A6', label: 'D11 → IN4' },
  // Motor outputs (L298N ↔ BO motors)
  { id: 'm7', from: 'l298n-OUT1', to: 'leftMotor',  subsystem: 'motor', color: '#0A0A0A', label: 'OUT1/2 → Left motor' },
  { id: 'm8', from: 'l298n-OUT3', to: 'rightMotor', subsystem: 'motor', color: '#0A0A0A', label: 'OUT3/4 → Right motor' },
  // Power subsystem
  { id: 'p1', from: 'battery-plus',  to: 'l298n-12V',   subsystem: 'power', color: '#EF4444', label: 'Battery + → L298N +12V' },
  { id: 'p2', from: 'battery-minus', to: 'l298n-GND',   subsystem: 'power', color: '#0A0A0A', label: 'Battery − → L298N GND' },
  { id: 'p3', from: 'battery-plus',  to: 'arduino-VIN', subsystem: 'power', color: '#EF4444', label: 'Battery + → Arduino VIN (7–12V)' },
  { id: 'p4', from: 'arduino-GND',   to: 'l298n-GND',   subsystem: 'power', color: '#0A0A0A', label: 'Arduino GND → L298N GND (common)' },
];
