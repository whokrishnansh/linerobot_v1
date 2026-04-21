// Component placeholder SVG illustrations
const ArduinoSvg = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="8" y="8" width="64" height="44" rx="4" fill="#006B3F"/>
    <rect x="14" y="14" width="24" height="22" rx="2" fill="#004D2D"/>
    <rect x="42" y="14" width="22" height="14" rx="2" fill="#004D2D"/>
    <circle cx="20" cy="46" r="4" fill="#B8B8B8"/>
    <rect x="38" y="28" width="26" height="6" rx="1" fill="#1a1a1a"/>
    <circle cx="64" cy="20" r="3" fill="#F59E0B"/>
    <text x="40" y="55" fontSize="6" fill="#A1A1A1" fontFamily="monospace" textAnchor="middle">Arduino UNO</text>
  </svg>
);

const IRSensorSvg = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="10" y="10" width="60" height="40" rx="3" fill="#1E40AF"/>
    <circle cx="28" cy="30" r="8" fill="#0A0A0A"/>
    <circle cx="28" cy="30" r="4" fill="#B87333"/>
    <circle cx="52" cy="30" r="8" fill="#0A0A0A"/>
    <circle cx="52" cy="30" r="4" fill="#B87333"/>
    <rect x="18" y="44" width="6" height="10" rx="1" fill="#B8B8B8"/>
    <rect x="28" y="44" width="6" height="10" rx="1" fill="#B8B8B8"/>
    <rect x="38" y="44" width="6" height="10" rx="1" fill="#B8B8B8"/>
    <text x="40" y="8" fontSize="6" fill="#60A5FA" fontFamily="monospace" textAnchor="middle">IR SENSOR</text>
  </svg>
);

const L298NSvg = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="8" y="6" width="64" height="48" rx="3" fill="#DC2626"/>
    <rect x="16" y="10" width="28" height="28" rx="2" fill="#0A0A0A"/>
    <rect x="20" y="14" width="20" height="4" rx="1" fill="#374151"/>
    <rect x="48" y="10" width="18" height="10" rx="1" fill="#1E3A8A"/>
    <rect x="48" y="24" width="18" height="10" rx="1" fill="#1E3A8A"/>
    <rect x="12" y="42" width="56" height="8" rx="1" fill="#B8B8B8"/>
    <text x="40" y="58" fontSize="5" fill="#A1A1A1" fontFamily="monospace" textAnchor="middle">L298N DRIVER</text>
  </svg>
);

const MotorSvg = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="8" y="16" width="40" height="28" rx="4" fill="#374151"/>
    <circle cx="56" cy="30" r="16" fill="#4B5563"/>
    <circle cx="56" cy="30" r="10" fill="#1F2937"/>
    <circle cx="56" cy="30" r="4" fill="#9CA3AF"/>
    <rect x="48" y="28" width="22" height="4" rx="2" fill="#6B7280"/>
    <rect x="14" y="44" width="6" height="8" rx="1" fill="#B8B8B8"/>
    <rect x="24" y="44" width="6" height="8" rx="1" fill="#B8B8B8"/>
    <text x="26" y="14" fontSize="6" fill="#A1A1A1" fontFamily="monospace" textAnchor="middle">BO MOTOR</text>
  </svg>
);

const ChassisSvg = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="6" y="12" width="68" height="36" rx="4" fill="#7C3AED" opacity="0.15"/>
    <rect x="6" y="12" width="68" height="36" rx="4" stroke="#7C3AED" strokeWidth="2"/>
    <rect x="10" y="18" width="20" height="4" rx="1" fill="#7C3AED" opacity="0.4"/>
    <rect x="50" y="18" width="20" height="4" rx="1" fill="#7C3AED" opacity="0.4"/>
    <rect x="30" y="28" width="20" height="4" rx="1" fill="#7C3AED" opacity="0.4"/>
    <text x="40" y="52" fontSize="6" fill="#7C3AED" fontFamily="monospace" textAnchor="middle">CHASSIS</text>
  </svg>
);

const CastorSvg = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="30" y="8" width="20" height="12" rx="2" fill="#6B7280"/>
    <circle cx="40" cy="36" r="16" fill="#4B5563"/>
    <circle cx="40" cy="36" r="10" fill="#374151"/>
    <circle cx="40" cy="36" r="4" fill="#9CA3AF"/>
    <text x="40" y="56" fontSize="6" fill="#A1A1A1" fontFamily="monospace" textAnchor="middle">CASTOR</text>
  </svg>
);

const BatterySvg = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="10" y="12" width="54" height="36" rx="4" fill="#16A34A"/>
    <rect x="64" y="22" width="8" height="16" rx="2" fill="#9CA3AF"/>
    <rect x="20" y="22" width="34" height="16" rx="2" fill="#15803D"/>
    <text x="36" y="34" fontSize="8" fill="white" fontWeight="600" textAnchor="middle">9V</text>
    <text x="40" y="55" fontSize="6" fill="#A1A1A1" fontFamily="monospace" textAnchor="middle">BATTERY</text>
  </svg>
);

const WiresSvg = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <path d="M 10 10 Q 30 10 30 30 Q 30 50 50 50" stroke="#EF4444" strokeWidth="4" strokeLinecap="round"/>
    <path d="M 20 15 Q 40 15 40 30 Q 40 45 60 45" stroke="#0A0A0A" strokeWidth="4" strokeLinecap="round"/>
    <path d="M 10 25 Q 40 25 70 35" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round"/>
    <path d="M 15 40 Q 35 35 65 20" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round"/>
    <text x="40" y="58" fontSize="6" fill="#A1A1A1" fontFamily="monospace" textAnchor="middle">JUMPER WIRES</text>
  </svg>
);

const BreadboardSvg = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="6" y="8" width="68" height="44" rx="3" fill="#F5F5DC"/>
    <rect x="6" y="8" width="68" height="44" rx="3" stroke="#D6D3A8" strokeWidth="1.5"/>
    <rect x="10" y="18" width="60" height="6" rx="1" fill="#EF4444" opacity="0.3"/>
    <rect x="10" y="36" width="60" height="6" rx="1" fill="#3B82F6" opacity="0.3"/>
    {[14,18,22,26,30,34,38,42,46,50,54,58,62].map((x,i) => (
      <circle key={i} cx={x} cy="28" r="1.5" fill="#A1A1A1"/>
    ))}
    <text x="40" y="55" fontSize="6" fill="#A1A1A1" fontFamily="monospace" textAnchor="middle">BREADBOARD</text>
  </svg>
);

const USBCableSvg = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect x="8" y="22" width="18" height="16" rx="2" fill="#374151"/>
    <rect x="54" y="20" width="18" height="20" rx="2" fill="#374151"/>
    <path d="M 26 30 Q 40 30 54 30" stroke="#6B7280" strokeWidth="6" strokeLinecap="round"/>
    <text x="40" y="52" fontSize="6" fill="#A1A1A1" fontFamily="monospace" textAnchor="middle">USB CABLE</text>
  </svg>
);

const TapeSvg = () => (
  <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <circle cx="40" cy="30" r="22" fill="#1F2937"/>
    <circle cx="40" cy="30" r="14" fill="#374151"/>
    <circle cx="40" cy="30" r="6" fill="#4B5563"/>
    <path d="M 40 8 L 40 4" stroke="white" strokeWidth="8" strokeLinecap="round"/>
    <text x="40" y="56" fontSize="6" fill="#A1A1A1" fontFamily="monospace" textAnchor="middle">BLACK TAPE</text>
  </svg>
);

export const COMPONENTS = [
  {
    id: 'arduino',
    name: 'Arduino UNO',
    role: 'The Brain',
    quantity: 1,
    tier: 'core',
    placeholderSvg: ArduinoSvg,
  },
  {
    id: 'ir-sensor',
    name: 'IR Sensor Module',
    role: 'The Eyes',
    quantity: 2,
    tier: 'core',
    placeholderSvg: IRSensorSvg,
  },
  {
    id: 'l298n',
    name: 'L298N Motor Driver',
    role: 'The Controller',
    quantity: 1,
    tier: 'core',
    placeholderSvg: L298NSvg,
  },
  {
    id: 'motor',
    name: 'BO Motor + Wheel',
    role: 'The Wheels',
    quantity: 2,
    tier: 'core',
    placeholderSvg: MotorSvg,
  },
  {
    id: 'chassis',
    name: 'Chassis / Body Frame',
    role: 'The Body',
    quantity: 1,
    tier: 'supply',
    placeholderSvg: ChassisSvg,
  },
  {
    id: 'castor',
    name: 'Castor Wheel',
    role: 'Front Support',
    quantity: 1,
    tier: 'supply',
    placeholderSvg: CastorSvg,
  },
  {
    id: 'battery',
    name: '9V Battery + Snap',
    role: 'The Power',
    quantity: 1,
    tier: 'supply',
    placeholderSvg: BatterySvg,
  },
  {
    id: 'wires',
    name: 'Jumper Wires M-F',
    role: 'The Connections',
    quantity: 10,
    tier: 'supply',
    placeholderSvg: WiresSvg,
  },
  {
    id: 'breadboard',
    name: 'Mini Breadboard',
    role: 'The Junction',
    quantity: 1,
    tier: 'supply',
    placeholderSvg: BreadboardSvg,
  },
  {
    id: 'usb',
    name: 'USB Cable A-B',
    role: 'Programming Link',
    quantity: 1,
    tier: 'supply',
    placeholderSvg: USBCableSvg,
  },
  {
    id: 'tape',
    name: 'Black Tape Track',
    role: 'The Road',
    quantity: 1,
    tier: 'supply',
    placeholderSvg: TapeSvg,
  },
];
