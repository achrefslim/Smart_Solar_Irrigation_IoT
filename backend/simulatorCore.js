const { FirebaseRestClient } = require('./firebaseClient');

const DEFAULT_INTERVAL_MS = 1000;
const RAIN_THRESHOLD = 1500;
const SHOWCASE_INTERVAL_MS = 700;
const SCENARIOS = [
  {
    key: 'healthyDry',
    label: 'Healthy dry weather',
    weight: 4,
    durationTicks: [2, 4],
    waterRange: [68, 96],
    rainRange: [2400, 3600],
    waterJitter: 3,
    rainJitter: 140,
  },
  {
    key: 'lowWaterDry',
    label: 'Low water alert',
    weight: 3,
    durationTicks: [2, 4],
    waterRange: [18, 38],
    rainRange: [2100, 3400],
    waterJitter: 4,
    rainJitter: 160,
  },
  {
    key: 'criticalWater',
    label: 'Critical water level',
    weight: 3,
    durationTicks: [2, 3],
    waterRange: [4, 18],
    rainRange: [2200, 3500],
    waterJitter: 3,
    rainJitter: 130,
  },
  {
    key: 'rainStorm',
    label: 'Heavy rain',
    weight: 3,
    durationTicks: [2, 4],
    waterRange: [42, 82],
    rainRange: [120, 850],
    waterJitter: 4,
    rainJitter: 180,
  },
  {
    key: 'thresholdDance',
    label: 'Threshold switching',
    weight: 2,
    durationTicks: [2, 4],
    waterRange: [26, 74],
    rainRange: [1250, 1750],
    waterJitter: 5,
    rainJitter: 220,
  },
  {
    key: 'sensorChaos',
    label: 'Extreme sensor sweep',
    weight: 1,
    durationTicks: [1, 2],
    waterRange: [2, 98],
    rainRange: [0, 4095],
    waterJitter: 8,
    rainJitter: 320,
  },
];

function asBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['1', 'true', 'on', 'yes'].includes(normalized);
  }
  return false;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(value);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.round(randomBetween(min, max));
}

function pickWeighted(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * totalWeight;

  for (const item of items) {
    cursor -= item.weight;
    if (cursor <= 0) return item;
  }

  return items[items.length - 1];
}

function moveTowards(current, target, minStep, maxStep, jitter = 0) {
  const difference = target - current;
  if (Math.abs(difference) <= minStep) {
    return target;
  }

  const step = Math.min(Math.abs(difference), randomBetween(minStep, maxStep));
  const nextValue = current + Math.sign(difference) * step + randomBetween(-jitter, jitter);
  return nextValue;
}

function buildAlerts(sensorData) {
  const now = new Date().toISOString();
  const alerts = {};

  if (sensorData.eau < 20) {
    alerts.waterCritical = {
      severity: 'danger',
      message: 'Water level critical - immediate action required',
      timestamp: now,
    };
  } else if (sensorData.eau < 40) {
    alerts.waterLow = {
      severity: 'warning',
      message: 'Water level low - consider irrigation',
      timestamp: now,
    };
  }

  if (sensorData.etat === 'PLUIE') {
    alerts.rainDetected = {
      severity: 'info',
      message: 'Rain detected - auto-irrigation paused',
      timestamp: now,
    };
  }

  return alerts;
}

class IrrigationSimulator {
  constructor(options = {}) {
    this.client = options.client || new FirebaseRestClient();
    this.intervalMs = Number(options.intervalMs || DEFAULT_INTERVAL_MS);
    this.tickCount = 0;
    this.interval = null;
    this.waterLevel = 65;
    this.rainRaw = 2800;
    this.lastControls = { pump: false, motor: false };
    this.currentScenario = null;
    this.scenarioTicksRemaining = 0;
    this.targetWaterLevel = this.waterLevel;
    this.targetRainRaw = this.rainRaw;
  }

  async ensureDatabaseShape() {
    const controls = (await this.client.get('controls')) || {};
    const sensors = (await this.client.get('sensors')) || {};

    const nextControls = {
      pump: asBool(controls.pump),
      motor: asBool(controls.motor),
    };

    this.lastControls = nextControls;

    await this.client.patch('controls', nextControls);
    await this.client.patch('sensors', {
      eau: Number.isFinite(Number(sensors.eau)) ? Number(sensors.eau) : round(this.waterLevel),
      pluie: Number.isFinite(Number(sensors.pluie)) ? Number(sensors.pluie) : round(this.rainRaw),
      etat: sensors.etat === 'PLUIE' ? 'PLUIE' : 'SEC',
      pump: asBool(sensors.pump),
      motor: asBool(sensors.motor),
      lastSeen: Math.floor(Date.now() / 1000),
    });
  }

  nextWaterLevel(pumpOn) {
    const scenario = this.currentScenario || SCENARIOS[0];
    this.waterLevel = moveTowards(this.waterLevel, this.targetWaterLevel, 5, 18, scenario.waterJitter);

    if (pumpOn) {
      this.waterLevel -= randomBetween(4, 10);
    } else if (this.rainRaw < RAIN_THRESHOLD) {
      this.waterLevel += randomBetween(2, 6);
    } else {
      this.waterLevel += randomBetween(-2, 2);
    }

    this.waterLevel = clamp(this.waterLevel, 2, 99);
    return round(this.waterLevel);
  }

  nextRainRaw() {
    const scenario = this.currentScenario || SCENARIOS[0];
    this.rainRaw = moveTowards(this.rainRaw, this.targetRainRaw, 120, 520, scenario.rainJitter);

    if (scenario.key === 'thresholdDance' && Math.random() < 0.35) {
      this.rainRaw += randomBetween(-280, 280);
    }

    this.rainRaw = clamp(this.rainRaw, 0, 4095);
    return round(this.rainRaw);
  }

  chooseScenario(controls, { force = false } = {}) {
    if (!force && this.scenarioTicksRemaining > 0) {
      this.scenarioTicksRemaining -= 1;
      return;
    }

    const scenario = pickWeighted(SCENARIOS);
    const [minTicks, maxTicks] = scenario.durationTicks;
    const pumpBias = controls.pump ? randomBetween(-14, -6) : 0;
    const rainBias = controls.motor ? randomBetween(-100, 100) : 0;

    this.currentScenario = scenario;
    this.scenarioTicksRemaining = randomInt(minTicks, maxTicks);
    this.targetWaterLevel = clamp(
      randomBetween(scenario.waterRange[0], scenario.waterRange[1]) + pumpBias,
      2,
      99
    );
    this.targetRainRaw = clamp(
      randomBetween(scenario.rainRange[0], scenario.rainRange[1]) + rainBias,
      0,
      4095
    );
  }

  async readControls() {
    const controls = (await this.client.get('controls')) || {};
    this.lastControls = {
      pump: asBool(controls.pump),
      motor: asBool(controls.motor),
    };
    return this.lastControls;
  }

  async writeSensorData(controls) {
    this.chooseScenario(controls);
    const pluie = this.nextRainRaw();
    const sensorData = {
      eau: this.nextWaterLevel(controls.pump),
      pluie,
      etat: pluie < RAIN_THRESHOLD ? 'PLUIE' : 'SEC',
      pump: controls.pump,
      motor: controls.motor,
      lastSeen: Math.floor(Date.now() / 1000),
    };

    await this.client.patch('sensors', sensorData);
    await this.client.put('irrigationAlerts', buildAlerts(sensorData));
    return sensorData;
  }

  async tick() {
    this.tickCount += 1;
    const controls = await this.readControls();
    const sensorData = await this.writeSensorData(controls);

    const line =
      `[tick ${String(this.tickCount).padStart(4, '0')}] ` +
      `[${(this.currentScenario?.key || 'idle').padEnd(14)}] ` +
      `Eau: ${String(sensorData.eau).padStart(3)}%  ` +
      `Pluie: ${String(sensorData.pluie).padStart(4)}  ` +
      `Etat: ${sensorData.etat.padEnd(5)}  ` +
      `Pump: ${sensorData.pump ? 'ON ' : 'OFF'}  ` +
      `Motor: ${sensorData.motor ? 'ON ' : 'OFF'}`;

    console.log(line);
    return sensorData;
  }

  async start({ once = false } = {}) {
    await this.client.authenticate();
    console.log(`Firebase connected (${this.client.authMode} mode).`);

    await this.ensureDatabaseShape();
    console.log('Database shape verified.');

    await this.tick();
    if (once) return;

    console.log(`Simulator running every ${this.intervalMs} ms. Use Ctrl+C to stop.`);
    this.interval = setInterval(() => {
      this.tick().catch((error) => {
        console.error('Tick error:', error.message);
      });
    }, this.intervalMs);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }
}

function getCliOptions(argv = process.argv.slice(2)) {
  const once = argv.includes('--once');
  const showcase = argv.includes('--showcase');
  const fallbackIntervalMs = showcase ? SHOWCASE_INTERVAL_MS : DEFAULT_INTERVAL_MS;
  const intervalArg = argv.find((arg) => arg.startsWith('--interval='));
  const intervalMs = intervalArg
    ? Number(intervalArg.slice('--interval='.length))
    : fallbackIntervalMs;

  return {
    once,
    showcase,
    intervalMs: Number.isFinite(intervalMs) && intervalMs > 0 ? intervalMs : fallbackIntervalMs,
  };
}

async function runCli() {
  const options = getCliOptions();
  const simulator = new IrrigationSimulator({ intervalMs: options.intervalMs });

  process.on('SIGINT', () => {
    simulator.stop();
    console.log('\nSimulator stopped.');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    simulator.stop();
    process.exit(0);
  });

  await simulator.start({ once: options.once });
}

module.exports = {
  IrrigationSimulator,
  asBool,
  buildAlerts,
  getCliOptions,
  runCli,
};
