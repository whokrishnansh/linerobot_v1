// Wire connection mappings for Section 3 circuit diagram
export const CONNECTIONS = [
  // Sensor subsystem
  { id: 's1', from: 'leftIR-VCC', to: 'arduino-5V', subsystem: 'sensor', color: '#22C55E', label: 'VCC → 5V' },
  { id: 's2', from: 'leftIR-GND', to: 'arduino-GND', subsystem: 'sensor', color: '#0A0A0A', label: 'GND → GND' },
  { id: 's3', from: 'leftIR-OUT', to: 'arduino-D2', subsystem: 'sensor', color: '#FBBF24', label: 'OUT → D2' },
  { id: 's4', from: 'rightIR-VCC', to: 'arduino-5V', subsystem: 'sensor', color: '#22C55E', label: 'VCC → 5V' },
  { id: 's5', from: 'rightIR-GND', to: 'arduino-GND', subsystem: 'sensor', color: '#0A0A0A', label: 'GND → GND' },
  { id: 's6', from: 'rightIR-OUT', to: 'arduino-D3', subsystem: 'sensor', color: '#FBBF24', label: 'OUT → D3' },
  // Motor subsystem
  { id: 'm1', from: 'arduino-D5', to: 'l298n-IN1', subsystem: 'motor', color: '#4F46E5', label: 'D5 → IN1' },
  { id: 'm2', from: 'arduino-D6', to: 'l298n-IN2', subsystem: 'motor', color: '#4F46E5', label: 'D6 → IN2' },
  { id: 'm3', from: 'arduino-D7', to: 'l298n-IN3', subsystem: 'motor', color: '#4F46E5', label: 'D7 → IN3' },
  { id: 'm4', from: 'arduino-D8', to: 'l298n-IN4', subsystem: 'motor', color: '#4F46E5', label: 'D8 → IN4' },
  { id: 'm5', from: 'l298n-OUT1', to: 'rightMotor', subsystem: 'motor', color: '#0A0A0A', label: 'OUT1/2 → Right motor' },
  { id: 'm6', from: 'l298n-OUT3', to: 'leftMotor', subsystem: 'motor', color: '#0A0A0A', label: 'OUT3/4 → Left motor' },
  // Power subsystem
  { id: 'p1', from: 'battery-plus', to: 'l298n-12V', subsystem: 'power', color: '#EF4444', label: '9V+ → 12V' },
  { id: 'p2', from: 'battery-minus', to: 'l298n-GND', subsystem: 'power', color: '#0A0A0A', label: '9V- → GND' },
  { id: 'p3', from: 'l298n-5V', to: 'arduino-VIN', subsystem: 'power', color: '#EF4444', label: '5V → Arduino VIN' },
];
