import { getAuth } from 'firebase/auth';

export const initializeFirebaseAuth = (app) => getAuth(app);
