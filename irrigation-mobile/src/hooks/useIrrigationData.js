import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onValue, ref, set, update } from 'firebase/database';

import { db } from '../firebase/config';

const IrrigationDataContext = createContext(null);

function formatTimestamp(timestamp) {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return String(timestamp);
  return date.toLocaleString();
}

function normalizeAlert(rawAlert) {
  if (!rawAlert) return null;
  if (typeof rawAlert === 'string') return { text: rawAlert, timestamp: 'Just now' };
  return {
    text: rawAlert.message || rawAlert.text || rawAlert.title || 'Alert received',
    timestamp: formatTimestamp(rawAlert.timestamp || rawAlert.createdAt || rawAlert.time),
  };
}

export function IrrigationDataProvider({ children }) {
  const [sensorData, setSensorData] = useState({
    etat: 'SEC',
    pump: false,
    motor: false,
    eau: 0,
    pluie: 0,
    lastSeen: 0,
  });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingDevice, setUpdatingDevice] = useState('');

  useEffect(() => {
    const sensorsRef = ref(db, 'sensors');
    const alertsRef = ref(db, 'irrigationAlerts');

    const loadingFallback = setTimeout(() => {
      console.log('Loading fallback triggered.');
      setLoading(false);
    }, 2000);

    const unsubscribeSensors = onValue(
      sensorsRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log('SENSORS DATA:', data);
        if (data) {
          setSensorData({
            etat: data.etat === 'PLUIE' ? 'PLUIE' : 'SEC',
            pump: Boolean(data.pump),
            motor: Boolean(data.motor),
            eau: Number.isFinite(Number(data.eau)) ? Number(data.eau) : 0,
            pluie: Number.isFinite(Number(data.pluie)) ? Number(data.pluie) : 0,
            lastSeen: Number.isFinite(Number(data.lastSeen)) ? Number(data.lastSeen) : 0,
          });
        }
        clearTimeout(loadingFallback);
        setLoading(false);
      },
      (error) => {
        console.log('SENSORS ERROR:', error);
        clearTimeout(loadingFallback);
        setLoading(false);
      }
    );

    const unsubscribeAlerts = onValue(
      alertsRef,
      (snapshot) => {
        const nextAlerts = snapshot.val();
        if (!nextAlerts) {
          setAlerts([]);
          return;
        }

        const sorted = Object.entries(nextAlerts).sort(([, a], [, b]) => {
          const ta = new Date(a?.timestamp || a?.createdAt || a?.time || 0).getTime();
          const tb = new Date(b?.timestamp || b?.createdAt || b?.time || 0).getTime();
          return tb - ta;
        });

        setAlerts(sorted.slice(0, 10).map(([, a]) => normalizeAlert(a)).filter(Boolean));
      },
      (error) => console.log('ALERTS ERROR:', error)
    );

    return () => {
      clearTimeout(loadingFallback);
      unsubscribeSensors();
      unsubscribeAlerts();
    };
  }, []);

  const isOnline = useMemo(
    () => sensorData.lastSeen > 0 && Date.now() / 1000 - sensorData.lastSeen < 15,
    [sensorData.lastSeen]
  );

  const handleToggle = useCallback(
    async (deviceKey) => {
      const nextValue = !sensorData[deviceKey];
      try {
        setUpdatingDevice(deviceKey);
        if (deviceKey === 'motor') {
          await update(ref(db, 'controls'), { cycle: false, motor: nextValue });
          return;
        }
        await set(ref(db, `controls/${deviceKey}`), nextValue);
      } finally {
        setUpdatingDevice('');
      }
    },
    [sensorData]
  );

  const derivedAlerts = useMemo(() => {
    if (alerts.length > 0) return alerts;

    const fallback = [];

    if (sensorData.eau < 20) {
      fallback.push({ text: 'Water level critical', timestamp: 'Live sensor reading' });
    }
    if (sensorData.etat === 'PLUIE') {
      fallback.push({ text: 'Rain detected', timestamp: 'Live sensor reading' });
    }
    if (sensorData.pump || sensorData.motor) {
      fallback.push({ text: 'Irrigation devices active', timestamp: 'Live device status' });
    }
    if (fallback.length === 0) {
      fallback.push({ text: 'System operating normally', timestamp: 'No active alerts' });
    }

    return fallback;
  }, [alerts, sensorData.motor, sensorData.pump, sensorData.etat, sensorData.eau]);

  const value = useMemo(
    () => ({
      sensorData,
      alerts: derivedAlerts,
      loading,
      updatingDevice,
      isOnline,
      handleToggle,
    }),
    [sensorData, derivedAlerts, loading, updatingDevice, isOnline, handleToggle]
  );

  return <IrrigationDataContext.Provider value={value}>{children}</IrrigationDataContext.Provider>;
}

export default function useIrrigationData() {
  const context = useContext(IrrigationDataContext);
  if (!context) throw new Error('useIrrigationData must be used within IrrigationDataProvider');
  return context;
}
