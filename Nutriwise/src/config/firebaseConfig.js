import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDWkTgEozceXAhwJGGi4IZg2d7fYFh3ftU',
  authDomain: 'nutriwise-1234.firebaseapp.com',
  projectId: 'nutriwise-1234',
  storageBucket: 'nutriwise-1234.appspot.com',
  messagingSenderId: '1012104829453',
  appId: '1:1012104829453:ios:7ac209b6c836e757529344',
};

// 🔥 Kiểm tra nếu Firebase chưa được khởi tạo thì mới khởi tạo
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
