// Firebase layihəsinin açıq konfiqurasiyası.
// Bu açarlar gizli deyil: veb-tətbiqlərdə hamıya görünür. Məlumatın təhlükəsizliyini
// firestore.rules faylındakı qaydalar təmin edir.
var OD_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDv_ibf10at6y3jVGqWTfLhBlXttl-uguQ',
  authDomain: 'od-dili.firebaseapp.com',
  projectId: 'od-dili',
  storageBucket: 'od-dili.firebasestorage.app',
  messagingSenderId: '161196823262',
  appId: '1:161196823262:web:a958ffb68c499c689ee84f'
};
// Bulud yalnız bu ünvanlarda işləyir; başqa yerdə (məs. faylı birbaşa açanda) Od demo rejimə keçir.
var OD_FIREBASE_HOSTS = ['sano8063.github.io', 'od-dili.web.app', 'od-dili.firebaseapp.com', 'localhost', '127.0.0.1'];
