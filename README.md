# Smart Solar Irrigation IoT

A complete IoT system that monitors a solar installation and its water reservoir, controls an irrigation pump, and automatically cleans the solar panel with a motorised brush and water spray. An **ESP32** reads the sensors and drives the actuators, **Firebase Realtime Database** connects everything in real time, and the system is supervised from a **React web dashboard** and a **React Native (Expo) mobile app**. A **Node.js simulator** lets you test the dashboards without any hardware.

## Table of contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Hardware](#hardware)
4. [Firebase data model](#firebase-data-model)
5. [Technologies](#technologies)
6. [Project structure](#project-structure)
7. [Quick start](#quick-start)
8. [Security](#security)

For a full step by step guide, read [TUTORIAL.md](TUTORIAL.md).

## Features

**ESP32 firmware**

1. Reads the water level of the reservoir (0 to 100 percent) and a rain sensor every loop
2. Sends live values to Firebase every 2 seconds and a heartbeat every 5 seconds so the apps know if the device is online
3. Turns the pump relay on or off from the apps
4. Runs a solar panel cleaning cycle: the brush motor goes back and forth between two limit switches, with the pump spraying water
5. Automatic daily cleaning at a scheduled time (DS3231 real time clock), only if the reservoir has enough water and it is not raining
6. Safety: encoder based blockage detection, 15 second timeout per pass, emergency stop, remote stop from the app, watchdog timer and automatic WiFi reconnection

**Web dashboard (React and Vite)**

1. Sign up and sign in with Firebase Authentication
2. Live water reservoir gauge, rain status and energy status
3. Device controls for the pump and the motor
4. Irrigation timer
5. Charts of the sensor history and a system alerts panel
6. Light and dark theme

**Mobile app (React Native and Expo)**

1. Login screen
2. Dashboard with live field data, reservoir level, rain sensor, pump and motor state, online or offline indicator
3. Control screen with pump and motor switches and a smart irrigation cycle with a chosen duration and countdown
4. Alerts screen
5. Profile screen with light and dark theme

**Simulator (Node.js)**

1. Writes realistic sensor values to Firebase as if a real ESP32 was connected
2. Several weather scenarios: healthy dry weather, low water, critical water, heavy rain, threshold switching, extreme sensor sweep
3. Reacts to the pump and motor commands sent by the apps and generates alerts

## Architecture

| Layer | Component | Role |
|---|---|---|
| Field | ESP32 with sensors and actuators | Measures, acts, and executes the commands |
| Cloud | Firebase Realtime Database and Authentication | Real time data exchange and user accounts |
| Supervision | React web dashboard | Monitoring and control from a computer |
| Supervision | Expo mobile app | Monitoring and control from a phone |
| Testing | Node.js simulator | Replaces the ESP32 during development |

The ESP32 writes to `/sensors`, the apps write commands to `/controls`, and the ESP32 reads those commands back. No local server is needed when the real hardware is running.

## Hardware

| Component | ESP32 pin | Role |
|---|:---:|---|
| Water level sensor | 27 | Reservoir level |
| Rain sensor (analog) | 34 | Rain detection (raining when value is below 1500) |
| Pump relay | 26 | Water pump |
| DC motor driver (ENA, IN1, IN2) | 25, 32, 33 | Cleaning brush motor (PWM) |
| Motor encoder (A, B) | 35, 13 | Movement and blockage detection |
| Limit switches (top, bottom) | 18, 19 | End of travel of the brush |
| DS3231 RTC | I2C | Clock for the daily cleaning schedule |
| Built in LED | 2 | Status |

## Firebase data model

| Path | Written by | Content |
|---|---|---|
| `/sensors/eau` | ESP32 | Water level in percent |
| `/sensors/pluie` | ESP32 | Raw rain sensor value |
| `/sensors/etat` | ESP32 | `PLUIE` (rain) or `SEC` (dry) |
| `/sensors/pump` | ESP32 | Pump state |
| `/sensors/motor` | ESP32 | Motor state |
| `/sensors/lastSeen` | ESP32 | Unix time of the last heartbeat |
| `/controls/pump` | Apps | Pump command (true or false) |
| `/controls/motor` | Apps | Starts or stops the cleaning cycle |
| `/irrigationAlerts` | Simulator | Alerts shown in the apps |

## Technologies

| Part | Tools |
|---|---|
| Firmware | Arduino C++, ESP32, FirebaseESP32, RTClib |
| Cloud | Firebase Realtime Database, Firebase Authentication |
| Web | React 19, Vite, React Router, Chart.js, ApexCharts, Recharts, Sass |
| Mobile | React Native 0.81, Expo 54, React Navigation |
| Simulator | Node.js 18 (no external dependency, uses the Firebase REST API) |

## Project structure

```
Smart_Solar_Irrigation_IoT/
|__ arduino/
|   |  irrigation_system.ino     ESP32 firmware
|__ backend/                     Hardware simulator
|   |  simulator.js              Entry point
|   |  simulatorCore.js          Scenarios and simulation logic
|   |  firebaseClient.js         Firebase REST client
|   |  .env.example
|__ frontend/                    React web dashboard
|   |  .env.example
|   |__ src/components/          Dashboard, charts, gauges, login, signup
|   |__ src/firebase/            Firebase setup
|__ irrigation-mobile/           Expo mobile app
    |  App.js
    |  .env.example
    |__ src/screens/             Dashboard, Control, Alerts, Profile, Login
    |__ src/hooks/               Live data from Firebase
```

## Quick start

1. Create a Firebase project with **Realtime Database** and **Email/Password** authentication.
2. Copy each `.env.example` to `.env` (in `backend`, `frontend` and `irrigation-mobile`) and fill in your Firebase values.
3. Start the web dashboard:

```bash
cd frontend
npm install
npm run dev
```

4. Start the mobile app:

```bash
cd irrigation-mobile
npm install
npm start
```

5. Without hardware, start the simulator:

```bash
cd backend
npm start
```

6. With hardware, open `arduino/irrigation_system.ino` in the Arduino IDE, fill in your WiFi and Firebase values and upload it to the ESP32.

## Security

No credential is stored in the repository. Firebase settings are read from `.env` files, which are ignored by git, and the ESP32 sketch only contains placeholders.

## Author

[achrefslim](https://github.com/achrefslim)
