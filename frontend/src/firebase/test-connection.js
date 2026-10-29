import { get, ref } from 'firebase/database';
import { rtdb } from './config';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');

    const snapshot = await get(ref(rtdb, 'sensors'));
    console.log('Firebase connected successfully.');
    console.log('Sensors node exists:', snapshot.exists());
    console.log('Sensors data:', snapshot.val());

    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
};
