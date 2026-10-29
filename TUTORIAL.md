# Tutorial: building and running the Smart Solar Irrigation IoT system

This guide explains how to set up every part of the project: Firebase, the web dashboard, the mobile app, the simulator and the ESP32 hardware.

You can follow it in two ways:

1. **Without hardware:** Parts 1, 2, 3, 4 and 5. The simulator plays the role of the ESP32.
2. **With hardware:** Parts 1, 2, 3, 4 and 6.

## Part 1: Requirements

| Tool | Why |
|---|---|
| Node.js 18 or newer | Web dashboard, mobile app and simulator |
| A Google account | Firebase |
| Expo Go app on your phone (Android or iOS) | Runs the mobile app |
| Arduino IDE 2 | Only for the hardware |
| ESP32 board and the components listed in the README | Only for the hardware |

## Part 2: Create the Firebase project

1. Open the [Firebase console](https://console.firebase.google.com) and click **Add project**.
2. In **Build** then **Realtime Database**, click **Create database**, choose a region and start in locked mode.
3. In **Build** then **Authentication**, click **Get started** and enable **Email/Password**.
4. In **Authentication** then **Users**, click **Add user** and create one account (for example a device account). The simulator and the ESP32 will sign in with it.
5. In **Realtime Database** then **Rules**, allow signed in users to read and write:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

6. In **Project settings** then **Your apps**, click the web icon, register an app and keep the `firebaseConfig` values. Also note the **Web API Key** and the database URL (it looks like `https://your-project-default-rtdb.europe-west1.firebasedatabase.app`).

## Part 3: Web dashboard

**Step 1.** Go to the folder and install the packages:

```bash
cd frontend
npm install
```

**Step 2.** Copy `frontend/.env.example` to `frontend/.env` and fill it:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DB_URL=https://your-project-default-rtdb.europe-west1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**Step 3.** Start it:

```bash
npm run dev
```

Open the address shown (usually http://localhost:5173), create an account on the sign up page, then sign in.

**Step 4.** On the dashboard you will see:

1. The water reservoir gauge and the rain status
2. The energy status of the solar panel
3. Device controls to switch the pump and the motor
4. The irrigation timer
5. Charts and the system alerts panel

To build a production version: `npm run build`. The result is in `frontend/dist`.

## Part 4: Mobile app

**Step 1.** Install the packages:

```bash
cd irrigation-mobile
npm install
```

**Step 2.** Copy `irrigation-mobile/.env.example` to `irrigation-mobile/.env` and fill it with the same Firebase values, using the `EXPO_PUBLIC_` names.

**Step 3.** Start Expo:

```bash
npm start
```

A QR code appears in the terminal. Your phone and your computer must be on the same WiFi network.

**Step 4.** Open **Expo Go** on your phone and scan the QR code (with the camera on iOS, inside Expo Go on Android).

If your network blocks the connection, use the tunnel mode:

```bash
npm run start:tunnel
```

**Step 5.** Use the app:

| Screen | What you can do |
|---|---|
| Login | Sign in with the account created on the web dashboard |
| Dashboard | Live reservoir level, rain sensor, pump and motor state, online indicator |
| Control | Switch the pump and the motor, choose a duration and start a smart irrigation cycle with countdown |
| Alerts | See the latest system alerts |
| Profile | Change the theme (light or dark) and log out |

The online indicator turns off if the device has not sent a heartbeat in the last 15 seconds.

## Part 5: Test without hardware (simulator)

**Step 1.** Copy `backend/.env.example` to `backend/.env`:

```
FIREBASE_URL=https://your-project-default-rtdb.europe-west1.firebasedatabase.app
FIREBASE_API_KEY=your web api key
FIREBASE_EMAIL=the user created in Part 2 step 4
FIREBASE_PASSWORD=its password
```

**Step 2.** Run the simulator (no `npm install` needed, it has no dependency):

```bash
cd backend
npm start
```

Values now move on the dashboard and in the mobile app. Try the pump and motor buttons: the simulator reacts to them.

**Other modes**

| Command | Effect |
|---|---|
| `npm start` | Normal simulation, one update per second |
| `npm run demo` | Showcase mode, faster and goes through every scenario (dry, low water, critical water, heavy rain ...) |
| `npm run once` | Writes a single update, useful to test the connection |
| `node simulator.js --interval=3000` | Custom update interval in milliseconds |
| `npm run check` | Checks the syntax of every simulator file |

Stop the simulator before using the real ESP32, otherwise both write to `/sensors`.

## Part 6: Real hardware (ESP32)

### 6.1 Wiring

| Component | ESP32 pin |
|---|:---:|
| Water level sensor | 27 |
| Rain sensor analog output | 34 |
| Pump relay input | 26 |
| Motor driver ENA (PWM) | 25 |
| Motor driver IN1 | 32 |
| Motor driver IN2 | 33 |
| Encoder channel A | 35 |
| Encoder channel B | 13 |
| Top limit switch | 18 |
| Bottom limit switch | 19 |
| DS3231 RTC | SDA 21, SCL 22 |

Power the pump and the motor from a separate supply (for example the solar battery), never directly from the ESP32, and connect all grounds together.

### 6.2 Arduino IDE setup

1. Install the ESP32 boards: **File** then **Preferences**, add `https://espressif.github.io/arduino-esp32/package_esp32_index.json` to the board manager URLs, then install **esp32** in the Boards Manager.
2. Install the libraries from the Library Manager: **Firebase ESP32 Client** (by Mobizt) and **RTClib** (by Adafruit).

### 6.3 Configure and upload

1. Open `arduino/irrigation_system.ino`.
2. Replace the placeholders at the top:

```cpp
#define WIFI_SSID     "your-wifi-name"
#define WIFI_PASSWORD "your-wifi-password"
#define API_KEY       "your-firebase-api-key"
#define DATABASE_URL  "https://your-project-default-rtdb.region.firebasedatabase.app"
#define USER_EMAIL    "your-firebase-user@example.com"
#define USER_PASSWORD "your-firebase-user-password"
```

3. (Optional) change the daily cleaning time:

```cpp
const int HEURE_DEMARRAGE  = 23;   // hour
const int MINUTE_DEMARRAGE = 21;   // minute
```

4. Select your ESP32 board and port, then click **Upload**.
5. Open the Serial Monitor at **115200** baud. You should see `WiFi Connected`, `Firebase write test OK` and `SYSTEME PRET`, then a status line every second with the water level, the rain value and the state.

Never upload the sketch with your real credentials to a public repository.

### 6.4 How the ESP32 behaves

| Situation | Behaviour |
|---|---|
| Every 2 seconds | Sends water level, rain value and state to Firebase |
| Every 5 seconds | Sends a heartbeat (`lastSeen`) |
| Pump switched in the app | Relay turns on or off |
| Motor switched on in the app | Starts a cleaning cycle (brush goes to the top limit switch and back) |
| Motor switched off during a cycle | The cycle stops safely |
| Scheduled time reached | Automatic cleaning with water, only if the reservoir is full enough and it is not raining |
| Brush blocked or no limit switch reached in 15 seconds | Emergency stop |
| WiFi lost | Automatic reconnection every 5 seconds |

## Part 7: Troubleshooting

| Problem | Solution |
|---|---|
| Dashboard shows no data | Check the `.env` values and that the simulator or the ESP32 is running |
| `Permission denied` from Firebase | Check the database rules and that you are signed in |
| Simulator says `FIREBASE_URL is missing` | Create `backend/.env` from the example |
| Phone cannot open the app | Use the same WiFi as the computer or run `npm run start:tunnel` |
| Device shows offline | The ESP32 heartbeat has stopped. Check its power and WiFi in the Serial Monitor |
| ESP32 does not connect to Firebase | Check the API key, the database URL and the device user email and password |
| Motor stops with `ARRET URGENCE` | The brush is blocked or a limit switch is not reached. Check the mechanics and the switches |
| Real values are overwritten | Stop the simulator while the ESP32 is running |
