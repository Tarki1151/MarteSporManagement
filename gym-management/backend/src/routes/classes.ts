import express from 'express';
import { db } from '../firebase';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = express.Router();
const CLASSES_COLLECTION = 'classes';

// Create class
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.name || !data.schedule) {
      return res.status(400).json({ ok: false, error: 'name and schedule are required' });
    }
    const ref = await db.collection(CLASSES_COLLECTION).add({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const doc = await ref.get();
    res.status(201).json({ ok: true, id: ref.id, data: doc.data() });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Get all classes (public or authenticated)
router.get('/', async (_req, res) => {
  try {
    const snapshot = await db.collection(CLASSES_COLLECTION).orderBy('createdAt', 'desc').get();
    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ ok: true, data: classes });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Get class by ID (protected)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const doc = await db.collection(CLASSES_COLLECTION).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Class not found' });
    res.json({ ok: true, data: { id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Update class (admin only)
router.put('/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const data = req.body;
    const ref = db.collection(CLASSES_COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Class not found' });
    await ref.update({ ...data, updatedAt: new Date().toISOString() });
    const updatedDoc = await ref.get();
    res.json({ ok: true, data: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Delete class (admin only)
router.delete('/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const ref = db.collection(CLASSES_COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Class not found' });
    await ref.delete();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

export default router;
