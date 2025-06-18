import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { db } from './firebase';
import membersRouter from './routes/members';
import classesRouter from './routes/classes';
import attendanceRouter from './routes/attendance';
import paymentsRouter from './routes/payments';
import parentalConsentRouter from './routes/parentalConsent';
import healthHistoryRouter from './routes/healthHistory';
import authRouter from './routes/auth';

dotenv.config();

const app = express();

// --- CORS AYARLAMASI ---
// Frontend uygulamanızın adresini buraya ekleyin
const allowedOrigins = ['http://localhost:3000','http://localhost:3001','http://localhost:3002'];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Eğer istek bir origin belirtmiyorsa (örneğin sunucu içi istekler veya Postman gibi araçlar)
    // veya izin verilen origin listesindeyse, devam etmesine izin ver.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bu origin CORS politikası tarafından engellendi.'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Authorization başlığı gibi bilgilerin gönderilebilmesi için
};

// Security & utility middlewares
app.use(helmet());
app.use(cors(corsOptions)); // Güncellenmiş CORS ayarını burada kullanıyoruz
app.use(express.json()); // Bu satırı CORS'tan sonra koymak iyi bir pratiktir
app.use(mongoSanitize());
app.use(hpp());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(cookieParser());
app.use(compression());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Firestore test endpoint
app.get('/api/firestore-test', async (req, res) => {
  try {
    const ref = db.collection('test').doc('connectivity');
    await ref.set({ testedAt: new Date().toISOString() }, { merge: true });
    const doc = await ref.get();
    res.json({ ok: true, data: doc.data() });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

app.use('/api/members', membersRouter);
app.use('/api/classes', classesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/parental-consent', parentalConsentRouter);
app.use('/api/health-history', healthHistoryRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5001; // Backend portu genellikle 5000 olarak ayarlanır
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});