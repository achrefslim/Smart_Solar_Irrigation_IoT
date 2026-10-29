import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ref, update } from 'firebase/database';

import { db } from '../firebase/config';

const IrrigationControllerContext = createContext(null);

export function IrrigationControllerProvider({ children }) {
  const [duration, setDuration]   = useState(2);
  const [timeLeft, setTimeLeft]   = useState(0);
  const [running, setRunning]     = useState(false);
  const [completed, setCompleted] = useState(false);
  const [totalTime, setTotalTime] = useState(duration * 60);

  const formattedTimeLeft = useMemo(
    () => `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`,
    [timeLeft]
  );

  const timerState = useMemo(() => {
    if (running)   return 'RUNNING';
    if (completed) return 'COMPLETED';
    return 'IDLE';
  }, [completed, running]);

  const timerStatusText = useMemo(() => {
    if (running)   return 'Irrigation Active';
    if (completed) return 'Cycle Complete';
    return 'System Idle';
  }, [completed, running]);

  const progress = useMemo(() => {
    if (!running) return completed ? 0 : 100;
    if (!totalTime) return 0;
    return Math.max(0, (timeLeft / totalTime) * 100);
  }, [completed, running, timeLeft, totalTime]);

  // Start Irrigation triggers the full simulator cycle: pump + motor.
  const stopIrrigation = useCallback((markCompleted = false) => {
    setRunning(false);
    setTimeLeft(0);
    setCompleted(markCompleted);
    update(ref(db, 'controls'), { cycle: false, pump: false, motor: false });
  }, []);

  const startIrrigation = useCallback(() => {
    const seconds = duration * 60;
    setCompleted(false);
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setRunning(true);
    update(ref(db, 'controls'), { cycle: true, pump: true, motor: true });
  }, [duration]);

  // Countdown ticker
  useEffect(() => {
    if (!running) return undefined;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { stopIrrigation(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, stopIrrigation]);

  const value = useMemo(
    () => ({
      duration, setDuration,
      timeLeft, running, completed, totalTime,
      formattedTimeLeft, timerState, timerStatusText, progress,
      startIrrigation, stopIrrigation,
    }),
    [duration, timeLeft, running, completed, totalTime,
     formattedTimeLeft, timerState, timerStatusText, progress,
     startIrrigation, stopIrrigation]
  );

  return (
    <IrrigationControllerContext.Provider value={value}>
      {children}
    </IrrigationControllerContext.Provider>
  );
}

export function useIrrigationController() {
  const context = useContext(IrrigationControllerContext);
  if (!context) throw new Error('useIrrigationController must be used within IrrigationControllerProvider');
  return context;
}
