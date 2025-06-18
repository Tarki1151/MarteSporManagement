import express from 'express';
import { db } from '../firebase';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = express.Router();
const HEALTH_HISTORY_COLLECTION = 'healthHistory';

// Create health history
router.post('/', async (req, res) => {
  try {
    const { memberId, conditions, allergies, medications, notes, updatedBy } = req.body;
    if (!memberId) {
      return res.status(400).json({ ok: false, error: 'memberId is required' });
    }
    const ref = await db.collection(HEALTH_HISTORY_COLLECTION).add({
      memberId,
      conditions: conditions || [],
      allergies: allergies || [],
      medications: medications || [],
      notes: notes || '',
      updatedBy: updatedBy || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const doc = await ref.get();
    res.status(201).json({ ok: true, id: ref.id, data: doc.data() });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Get all health histories (public or authenticated)
router.get('/', async (_req, res) => {
  try {
    const snapshot = await db.collection(HEALTH_HISTORY_COLLECTION).orderBy('createdAt', 'desc').get();
    const histories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ ok: true, data: histories });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Get health history by ID (protected)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const doc = await db.collection(HEALTH_HISTORY_COLLECTION).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Health history not found' });
    res.json({ ok: true, data: { id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Update health history (admin only)
router.put('/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const data = req.body;
    const ref = db.collection(HEALTH_HISTORY_COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Health history not found' });
    await ref.update({ ...data, updatedAt: new Date().toISOString() });
    const updatedDoc = await ref.get();
    res.json({ ok: true, data: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Delete health history (admin only)
router.delete('/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const ref = db.collection(HEALTH_HISTORY_COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Health history not found' });
    await ref.delete();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

export default router;
