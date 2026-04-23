export const ARDUINO_CODE = `// ATL Robot Lab — Line Following Robot
// Grade 9–10 | Activity 01

// === PIN DEFINITIONS ===
#define LEFT_SENSOR   2    // IR sensor — left
#define RIGHT_SENSOR  3    // IR sensor — right

#define ENA  5    // L298N motor A enable (PWM)
#define ENB  6    // L298N motor B enable (PWM)
#define IN1  8    // L298N motor A forward
#define IN2  9    // L298N motor A backward
#define IN3  10   // L298N motor B forward
#define IN4  11   // L298N motor B backward

// === SETUP ===
void setup() {
  pinMode(LEFT_SENSOR,  INPUT);
  pinMode(RIGHT_SENSOR, INPUT);

  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);

  // Enable both motor channels at full speed
  analogWrite(ENA, 200);
  analogWrite(ENB, 200);

  Serial.begin(9600);
  Serial.println("Line follower ready.");
}

// === MOTOR CONTROL HELPERS ===
void forward() {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
}

void turnLeft() {
  digitalWrite(IN1, LOW);  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);
}

void turnRight() {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);  digitalWrite(IN4, LOW);
}

void stopMotors() {
  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW);
}

// === MAIN LOOP ===
void loop() {
  int L = digitalRead(LEFT_SENSOR);
  int R = digitalRead(RIGHT_SENSOR);

  // 0 = sees black tape, 1 = sees white floor

  if (L == 0 && R == 0) {
    forward();           // Both on line — go straight
  } else if (L == 1 && R == 0) {
    turnLeft();          // Drifted right — steer left
  } else if (L == 0 && R == 1) {
    turnRight();         // Drifted left — steer right
  } else {
    stopMotors();        // Lost the line — stop
  }
}`;

export const ASSEMBLY_STEPS = [
  {
    id: 1,
    phase: 'Mounting',
    phaseColor: '#7C3AED',
    title: 'Lay the chassis flat',
    body: 'Place the purple chassis plate on the desk, smooth side up, with the wide edge facing you.',
    tip: 'The pre-drilled holes are for motors — keep them oriented toward the back corners so the wheels mount easily.',
    reveal: ['chassis'],
    camera: { position: [0, 8, 6], target: [0, 0, 0] },
  },
  {
    id: 2,
    phase: 'Mounting',
    phaseColor: '#7C3AED',
    title: 'Attach the BO motors',
    body: 'Press each BO motor into the rear motor brackets and secure with the provided screws or clips.',
    tip: 'Both motor shafts should point outward — away from the chassis center. Misaligned motors cause the robot to pull to one side.',
    reveal: ['chassis', 'motor'],
    camera: { position: [3, 6, 5], target: [1, 0, 0] },
  },
  {
    id: 3,
    phase: 'Mounting',
    phaseColor: '#7C3AED',
    title: 'Fit the castor wheel',
    body: 'Clip the castor wheel assembly into the front-center slot — it swivels freely and balances the robot.',
    tip: 'The castor should spin in all directions. If it feels stiff, check for a plastic film on the ball — peel it off.',
    reveal: ['chassis', 'motor', 'castor'],
    camera: { position: [-3, 6, 5], target: [-1, 0, 0] },
  },
  {
    id: 4,
    phase: 'Mounting',
    phaseColor: '#7C3AED',
    title: 'Mount the Arduino',
    body: "Stick the double-sided foam pad on the Arduino's bottom and press it center-rear on the chassis.",
    tip: "Keep the USB port accessible from the back of the robot — you'll need to plug in a cable in Step 12.",
    reveal: ['chassis', 'motor', 'castor', 'arduino'],
    camera: { position: [0, 7, 4], target: [0, 0.5, 0] },
  },
  {
    id: 5,
    phase: 'Mounting',
    phaseColor: '#7C3AED',
    title: 'Stick the breadboard',
    body: "Peel the breadboard's adhesive backing and press it next to the Arduino on the chassis.",
    tip: 'Orient the breadboard so the power rails (red and blue lines) run front-to-back — this makes wiring much cleaner.',
    reveal: ['chassis', 'motor', 'castor', 'arduino', 'breadboard'],
    camera: { position: [1, 7, 4], target: [0, 0.5, 0] },
  },
  {
    id: 6,
    phase: 'Mounting',
    phaseColor: '#7C3AED',
    title: 'Mount the L298N driver',
    body: 'Attach the red L298N motor driver to the front-center area of the chassis using foam tape.',
    tip: 'The screw terminal block (green, 4-port) should face outward toward the motors — this is where motor wires connect.',
    reveal: ['chassis', 'motor', 'castor', 'arduino', 'breadboard', 'l298n'],
    camera: { position: [-1, 7, 4], target: [0, 0.5, 0] },
  },
  {
    id: 7,
    phase: 'Mounting',
    phaseColor: '#7C3AED',
    title: 'Attach the IR sensors',
    body: 'Clip both IR sensors onto the front arm of the chassis, angled slightly downward toward the floor.',
    tip: 'Left sensor should be about 3 cm from center-left, right sensor from center-right. Too far apart and they miss the 1.5 cm tape.',
    reveal: ['chassis', 'motor', 'castor', 'arduino', 'breadboard', 'l298n', 'ir'],
    camera: { position: [0, 4, 7], target: [0, -0.5, 0] },
  },
  {
    id: 8,
    phase: 'Wiring',
    phaseColor: '#F59E0B',
    title: 'Connect motors to the L298N',
    body: 'Run the two motor wire pairs into OUT1/OUT2 (left motor) and OUT3/OUT4 (right motor) screws on the L298N.',
    tip: 'Tighten each screw terminal until the wire has a firm pull-out resistance. Loose connections are the most common cause of motors not spinning.',
    reveal: ['chassis', 'motor', 'castor', 'arduino', 'breadboard', 'l298n', 'ir', 'wires_motor'],
    camera: { position: [3, 5, 5], target: [1, 0, 0] },
  },
  {
    id: 9,
    phase: 'Wiring',
    phaseColor: '#F59E0B',
    title: 'Wire sensors to the Arduino',
    body: "Connect each IR sensor's 3-wire cable: VCC to breadboard rail, GND to GND rail, OUT to Arduino D2 and D3.",
    tip: 'Use the breadboard rail for shared VCC and GND — only the signal wire (yellow) goes directly to the Arduino digital pin.',
    reveal: ['chassis', 'motor', 'castor', 'arduino', 'breadboard', 'l298n', 'ir', 'wires_motor', 'wires_sensor'],
    camera: { position: [0, 4, 7], target: [0, -0.5, 0] },
  },
  {
    id: 10,
    phase: 'Wiring',
    phaseColor: '#F59E0B',
    title: 'Wire L298N to the Arduino',
    body: 'Run six wires from the Arduino to the L298N: D5→ENA, D6→ENB (PWM speed), and D8–D11 to IN1–IN4 (direction).',
    tip: 'Pin map: D5→ENA, D6→ENB, D8→IN1, D9→IN2, D10→IN3, D11→IN4. Swapping IN1/IN2 (or IN3/IN4) reverses that motor.',
    reveal: ['chassis', 'motor', 'castor', 'arduino', 'breadboard', 'l298n', 'ir', 'wires_motor', 'wires_sensor', 'wires_control'],
    camera: { position: [-2, 6, 5], target: [0, 0.2, 0] },
  },
  {
    id: 11,
    phase: 'Wiring',
    phaseColor: '#F59E0B',
    title: 'Connect the power',
    body: 'Wire Battery+ to L298N +12V and Arduino VIN (via the breadboard + rail), and Battery− to L298N GND. Tie Arduino GND to L298N GND for a common ground.',
    tip: 'Do NOT connect the battery yet — just route the wires. Arduino is powered from Battery+ through VIN (7–12V). All GNDs must be common.',
    reveal: ['chassis', 'motor', 'castor', 'arduino', 'breadboard', 'l298n', 'ir', 'wires_motor', 'wires_sensor', 'wires_control', 'battery', 'wires_power'],
    camera: { position: [0, 8, 6], target: [0, 0, 0] },
  },
  {
    id: 12,
    phase: 'Programming',
    phaseColor: '#4F46E5',
    title: 'Upload the code',
    body: 'Plug the Arduino into your laptop via USB and upload the line-following sketch using Arduino IDE.',
    tip: 'Select "Arduino UNO" as the board and the correct COM port. If the upload fails, press the reset button before hitting upload again.',
    reveal: ['chassis', 'motor', 'castor', 'arduino', 'breadboard', 'l298n', 'ir', 'wires_motor', 'wires_sensor', 'wires_control', 'battery', 'wires_power'],
    camera: { position: [0, 5, 5], target: [0, 1, 0] },
  },
  {
    id: 13,
    phase: 'Testing',
    phaseColor: '#22C55E',
    title: 'Put it on the track',
    body: 'Place your robot on the black tape track and snap in the battery — watch it follow the line.',
    tip: "If the robot spins in circles, swap the two wires on one motor output. If it goes backward, swap both pairs. You don't need to re-upload code.",
    reveal: ['chassis', 'motor', 'castor', 'arduino', 'breadboard', 'l298n', 'ir', 'wires_motor', 'wires_sensor', 'wires_control', 'battery', 'wires_power', 'track'],
    camera: { position: [0, 12, 10], target: [0, 0, 0] },
  },
];
