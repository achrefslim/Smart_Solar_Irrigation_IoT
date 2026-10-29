#include <WiFi.h>
#include <FirebaseESP32.h>
#include <Wire.h>
#include <RTClib.h>
#include <esp_task_wdt.h>

// ── WiFi ──────────────────────────────────────────────────────────────────────
#define WIFI_SSID     "your-wifi-name"
#define WIFI_PASSWORD "your-wifi-password"

// ── Firebase ──────────────────────────────────────────────────────────────────
#define API_KEY       "your-firebase-api-key"
#define DATABASE_URL  "https://your-project-default-rtdb.region.firebasedatabase.app"
#define USER_EMAIL    "your-firebase-user@example.com"
#define USER_PASSWORD "your-firebase-user-password"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
int firebaseFailures = 0;

// ── Hardware pins ─────────────────────────────────────────────────────────────
#define PIN_CAPTEUR   27
#define PIN_PLUIE     34
#define PIN_RELAIS    26
#define LED_BUILTIN   2

#define SEUIL_HAUT    900
#define SEUIL_PLUIE   1500

RTC_DS3231 rtc;

#define ENA  25
#define IN1  32
#define IN2  33

#define ENC_A 35
#define ENC_B 13

#define FDC_HAUT 18
#define FDC_BAS  19

#define PWM_FREQ       5000
#define PWM_RESOLUTION 8

volatile long encoderCount = 0;

const int HEURE_DEMARRAGE  = 23;
const int MINUTE_DEMARRAGE = 21;

bool dejaExecute   = false;
bool nettoyageLance = false;  // set by Firebase command, executed in loop
bool cycleAvecPompe = false;

long lastEncoder   = 0;
unsigned long lastMoveTime = 0;
#define TEMPS_BLOCAGE 2000

bool motorStopDemande = false;
unsigned long dernierCheckMotorStop = 0;
unsigned long dernierCheckPompe = 0;

// ── Firebase helpers ──────────────────────────────────────────────────────────

bool firebasePret() {
  return WiFi.status() == WL_CONNECTED && Firebase.ready();
}

String firebasePath(const char *path) {
  if (path == nullptr || path[0] == '\0') return "/";
  if (path[0] == '/') return String(path);
  String fullPath = "/";
  fullPath += path;
  return fullPath;
}

void firebaseFailureHandler(const String &reason) {
  firebaseFailures++;
  Serial.print("Firebase error: ");
  Serial.println(reason);
  if (firebaseFailures >= 5) {
    firebaseFailures = 0;
    Serial.println("Firebase unstable, retrying...");
  }
}

bool firebaseSetInt(const char *path, int value) {
  if (!firebasePret()) return false;
  String fullPath = firebasePath(path);
  if (!Firebase.setInt(fbdo, fullPath, value)) {
    firebaseFailureHandler(fbdo.errorReason());
    return false;
  }
  firebaseFailures = 0;
  return true;
}

bool firebaseSetBool(const char *path, bool value) {
  if (!firebasePret()) return false;
  String fullPath = firebasePath(path);
  if (!Firebase.setBool(fbdo, fullPath, value)) {
    firebaseFailureHandler(fbdo.errorReason());
    return false;
  }
  firebaseFailures = 0;
  return true;
}

bool firebaseSetString(const char *path, const String &value) {
  if (!firebasePret()) return false;
  String fullPath = firebasePath(path);
  if (!Firebase.setString(fbdo, fullPath, value)) {
    firebaseFailureHandler(fbdo.errorReason());
    return false;
  }
  firebaseFailures = 0;
  return true;
}

bool firebaseGetBool(const char *path, bool *value) {
  if (!firebasePret()) return false;
  String fullPath = firebasePath(path);
  if (!Firebase.getBool(fbdo, fullPath)) {
    firebaseFailureHandler(fbdo.errorReason());
    return false;
  }
  *value = fbdo.boolData();
  firebaseFailures = 0;
  return true;
}

void appliquerCommandePompe(bool force = true) {
  if (!force && millis() - dernierCheckPompe < 500) return;
  dernierCheckPompe = millis();

  bool pumpCmd = false;
  if (firebaseGetBool("controls/pump", &pumpCmd)) {
    bool currentPump = (digitalRead(PIN_RELAIS) == HIGH);
    if (pumpCmd != currentPump) {
      digitalWrite(PIN_RELAIS, pumpCmd ? HIGH : LOW);
    }
    firebaseSetBool("sensors/pump", pumpCmd);
  }
}

void resetStopMoteur() {
  motorStopDemande = false;
  dernierCheckMotorStop = 0;
}

bool stopMoteurDemande() {
  if (millis() - dernierCheckMotorStop < 500) return motorStopDemande;
  dernierCheckMotorStop = millis();

  bool motorCmd = true;
  if (firebaseGetBool("controls/motor", &motorCmd)) {
    motorStopDemande = !motorCmd;
  }
  return motorStopDemande;
}

// ── WiFi reconnection ─────────────────────────────────────────────────────────

void gererConnexionWiFi() {
  static unsigned long lastReconnect = 0;
  if (WiFi.status() == WL_CONNECTED) return;
  if (millis() - lastReconnect > 5000) {
    lastReconnect = millis();
    WiFi.reconnect();
  }
}

// ── Heartbeat (app detects offline when this stops updating) ──────────────────

void envoyerHeartbeat() {
  static unsigned long lastHB = 0;
  if (millis() - lastHB < 5000) return;
  lastHB = millis();
  // rtc.now().unixtime() returns seconds since Unix epoch (1970-01-01)
  firebaseSetInt("sensors/lastSeen", (int)rtc.now().unixtime());
}

// ── Sensor sync ───────────────────────────────────────────────────────────────

void synchroniserCapteurs(int niveau, int pluieVal, bool pluie) {
  static unsigned long lastSend = 0;
  if (millis() - lastSend < 2000) return;
  lastSend = millis();

  int eau = constrain(map(niveau, 0, 4095, 0, 100), 0, 100);

  // Always write current values — no change-detection so stale data
  // from any other source gets overwritten every 2 s.
  firebaseSetInt("sensors/eau",   eau);
  firebaseSetInt("sensors/pluie", pluieVal);
  firebaseSetString("sensors/etat", pluie ? "PLUIE" : "SEC");
}

// ── Read pump / motor commands from app ──────────────────────────────────────
// Pump  → controls/pump  (bool)  → relay direct on/off
// Motor → controls/motor (bool)  → triggers cleaning cycle

void lireCommandesPompeMoteur() {
  static unsigned long lastRead = 0;
  if (!firebasePret() || millis() - lastRead < 2000) return;
  lastRead = millis();

  appliquerCommandePompe();

  // ── Motor: start cleaning cycle on rising edge ────────────────────────────
  static bool prevMotorCmd = false;
  bool motorCmd = false;
  if (firebaseGetBool("controls/motor", &motorCmd)) {
    if (motorCmd && !prevMotorCmd && !nettoyageLance) {
      bool cycleCmd = false;
      firebaseGetBool("controls/cycle", &cycleCmd);
      cycleAvecPompe = cycleCmd;
      nettoyageLance = true;  // handled in loop()
    }
    prevMotorCmd = motorCmd;
  }
}

// ── ISR ───────────────────────────────────────────────────────────────────────

void IRAM_ATTR encoderISR() {
  if (digitalRead(ENC_B) == HIGH) encoderCount++;
  else encoderCount--;
}

// ── Sensor reads ──────────────────────────────────────────────────────────────

int lireCapteurEau() {
  int somme = 0;
  for (int i = 0; i < 10; i++) { somme += analogRead(PIN_CAPTEUR); delay(5); }
  return somme / 10;
}

int lirePluie() {
  int somme = 0;
  for (int i = 0; i < 10; i++) { somme += analogRead(PIN_PLUIE); delay(5); }
  return somme / 10;
}

// ── Motor helpers ─────────────────────────────────────────────────────────────

void motorAvant(int vitesse) {
  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW); ledcWrite(ENA, vitesse);
}

void motorArriere(int vitesse) {
  digitalWrite(IN1, LOW); digitalWrite(IN2, HIGH); ledcWrite(ENA, vitesse);
}

void motorStop() {
  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW); ledcWrite(ENA, 0);
}

bool obstacleDetecte() {
  if (encoderCount != lastEncoder) {
    lastEncoder   = encoderCount;
    lastMoveTime  = millis();
    return false;
  }
  return (millis() - lastMoveTime > TEMPS_BLOCAGE);
}

void arretUrgence() {
  motorStop();
  digitalWrite(PIN_RELAIS, LOW);
  firebaseSetBool("sensors/pump",  false);
  firebaseSetBool("sensors/motor", false);
  Serial.println("!!! ARRET URGENCE !!!");
  ESP.restart();
}

// ── Cleaning cycle (blocking) ─────────────────────────────────────────────────

void arreterNettoyage(bool utiliserPompe) {
  motorStop();
  if (utiliserPompe) {
    digitalWrite(PIN_RELAIS, LOW);
    firebaseSetBool("sensors/pump", false);
    firebaseSetBool("controls/pump", false);
  }
  firebaseSetBool("sensors/motor", false);
  firebaseSetBool("controls/motor", false);
  firebaseSetBool("controls/cycle", false);
}

bool gererStopMoteur(bool utiliserPompe) {
  if (!stopMoteurDemande()) return false;
  Serial.println("STOP MOTEUR DEMANDE");
  arreterNettoyage(utiliserPompe);
  return true;
}

void nettoyerPanneau(bool utiliserPompe) {
  Serial.println(utiliserPompe ? ">>> NETTOYAGE DEMARRE" : ">>> MOTEUR DEMARRE");
  resetStopMoteur();

  if (utiliserPompe) {
    digitalWrite(PIN_RELAIS, HIGH);
    firebaseSetBool("sensors/pump", true);
  } else {
    appliquerCommandePompe(true);
  }

  firebaseSetBool("sensors/motor", true);

  for (int i = 1; i <= 5; i++) {
    Serial.print("Cycle "); Serial.println(i);

    // ALLER
    unsigned long timeout = millis();
    lastEncoder   = encoderCount;
    lastMoveTime  = millis();

    while (digitalRead(FDC_HAUT) == LOW) {
      esp_task_wdt_reset();
      if (!utiliserPompe) appliquerCommandePompe(false);
      if (gererStopMoteur(utiliserPompe)) return;
      motorAvant(150);
      if (obstacleDetecte()) { Serial.println("OBSTACLE ALLER");  arretUrgence(); }
      if (millis() - timeout > 15000) { Serial.println("TIMEOUT ALLER"); arretUrgence(); }
      delay(5);
    }

    motorStop();
    delay(1000);

    // RETOUR
    timeout       = millis();
    lastEncoder   = encoderCount;
    lastMoveTime  = millis();

    while (digitalRead(FDC_BAS) == LOW) {
      esp_task_wdt_reset();
      if (!utiliserPompe) appliquerCommandePompe(false);
      if (gererStopMoteur(utiliserPompe)) return;
      motorArriere(150);
      if (obstacleDetecte()) { Serial.println("OBSTACLE RETOUR"); arretUrgence(); }
      if (millis() - timeout > 15000) { Serial.println("TIMEOUT RETOUR"); arretUrgence(); }
      delay(5);
    }

    motorStop();
    delay(1000);
  }

  arreterNettoyage(utiliserPompe);
  Serial.println(utiliserPompe ? ">>> NETTOYAGE TERMINE" : ">>> MOTEUR TERMINE");
}

// ── Setup ─────────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);

  esp_task_wdt_config_t wdt_config = {
    .timeout_ms    = 10000,
    .idle_core_mask = (1 << portNUM_PROCESSORS) - 1,
    .trigger_panic  = true
  };
  esp_task_wdt_init(&wdt_config);
  esp_task_wdt_add(NULL);

  // WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    esp_task_wdt_reset();
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");

  // Firebase
  config.api_key      = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email     = USER_EMAIL;
  auth.user.password  = USER_PASSWORD;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Give Firebase a moment to connect, then initialise controls/
  Serial.print("Connecting to Firebase");
  unsigned long fbWait = millis();
  while (!Firebase.ready() && millis() - fbWait < 30000) {
    esp_task_wdt_reset();
    delay(300);
    Serial.print(".");
  }
  Serial.println();
  if (Firebase.ready()) {
    bool firebaseOk = true;
    firebaseOk &= firebaseSetString("sensors/source", "ESP32");
    firebaseOk &= firebaseSetBool("controls/pump",  false);
    firebaseOk &= firebaseSetBool("controls/motor", false);
    firebaseOk &= firebaseSetBool("controls/cycle", false);
    Serial.println(firebaseOk ? "Firebase write test OK" : "Firebase write test failed");
  } else {
    Serial.println("Firebase not ready yet; controls/ will sync after connection.");
  }
  Serial.println("controls/ initialised");

  // Motor driver
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  ledcAttach(ENA, PWM_FREQ, PWM_RESOLUTION);

  // Encoder
  pinMode(ENC_A, INPUT);
  pinMode(ENC_B, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(ENC_A), encoderISR, RISING);

  // Limit switches
  pinMode(FDC_HAUT, INPUT_PULLDOWN);
  pinMode(FDC_BAS,  INPUT_PULLDOWN);

  // Relay (pump)
  pinMode(PIN_RELAIS, OUTPUT);
  digitalWrite(PIN_RELAIS, LOW);

  // RTC
  Wire.begin(21, 22);
  if (!rtc.begin()) { Serial.println("RTC ERROR"); ESP.restart(); }
  rtc.adjust(DateTime(F(__DATE__), F(__TIME__))); // ← REMOVE AFTER FIRST UPLOAD

  Serial.println("SYSTEME PRET");
}

// ── Loop ──────────────────────────────────────────────────────────────────────

void loop() {
  esp_task_wdt_reset();
  gererConnexionWiFi();

  DateTime now     = rtc.now();
  int niveau       = lireCapteurEau();
  int pluieVal     = lirePluie();
  bool pluie       = pluieVal < SEUIL_PLUIE;

  synchroniserCapteurs(niveau, pluieVal, pluie);
  envoyerHeartbeat();
  lireCommandesPompeMoteur();

  // Trigger from app (controls/motor set to true)
  if (nettoyageLance) {
    nettoyageLance = false;
    nettoyerPanneau(cycleAvecPompe);
    cycleAvecPompe = false;
  }

  // Auto cleaning on schedule
  if (now.hour()   == HEURE_DEMARRAGE &&
      now.minute() == MINUTE_DEMARRAGE &&
      !dejaExecute &&
      niveau > SEUIL_HAUT &&
      !pluie) {
    nettoyerPanneau(true);
    dejaExecute = true;
  }

  if (now.minute() != MINUTE_DEMARRAGE) dejaExecute = false;

  // Serial log every second
  static unsigned long tLog = 0;
  if (millis() - tLog > 1000) {
    tLog = millis();
    Serial.println("------------");
    Serial.println(now.timestamp(DateTime::TIMESTAMP_FULL));
    Serial.print("Eau: ");   Serial.print(niveau);
    Serial.print(" | Pluie: "); Serial.print(pluieVal);
    Serial.print(" | Etat: "); Serial.println(pluie ? "PLUIE" : "SEC");
  }
}
