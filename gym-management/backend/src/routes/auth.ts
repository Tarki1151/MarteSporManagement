import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../firebase';

const router = Router();
const USERS_COLLECTION = 'users';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Login endpoint (email + password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'email and password are required' });
    }
    // Find user by email
    const snapshot = await db.collection(USERS_COLLECTION).where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    // Simple password check (should hash in production)
    if (user.password !== password) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    // Generate JWT
    const token = jwt.sign({ id: userDoc.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ ok: true, token, user: { id: userDoc.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Register endpoint (admin only, or for seeding)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ ok: false, error: 'email, password and name are required' });
    }
    // Check if user exists
    const snapshot = await db.collection(USERS_COLLECTION).where('email', '==', email).limit(1).get();
    if (!snapshot.empty) {
      return res.status(409).json({ ok: false, error: 'User already exists' });
    }
    // Create user (password should be hashed in production)
    const ref = await db.collection(USERS_COLLECTION).add({
      email,
      password,
      name,
      role: role || 'staff',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const doc = await ref.get();
    res.status(201).json({ ok: true, id: ref.id, data: doc.data() });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

export default router;
