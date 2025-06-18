import express from 'express';
import { db } from '../firebase';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = express.Router();
const ATTENDANCE_COLLECTION = 'attendance';

// Create attendance record
router.post('/', async (req, res) => {
  try {
    const { memberId, classId, date, status } = req.body;
    if (!memberId || !classId || !date) {
      return res.status(400).json({ ok: false, error: 'memberId, classId, and date are required' });
    }
    const ref = await db.collection(ATTENDANCE_COLLECTION).add({
      memberId,
      classId,
      date,
      status: status || 'present',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const doc = await ref.get();
    res.status(201).json({ ok: true, id: ref.id, data: doc.data() });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Get all attendance records (public or authenticated)
router.get('/', async (_req, res) => {
  try {
    const snapshot = await db.collection(ATTENDANCE_COLLECTION).orderBy('date', 'desc').get();
    const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ ok: true, data: attendance });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Get attendance record by ID (protected)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const doc = await db.collection(ATTENDANCE_COLLECTION).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Attendance record not found' });
    res.json({ ok: true, data: { id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Update attendance record (admin only)
router.put('/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const data = req.body;
    const ref = db.collection(ATTENDANCE_COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Attendance record not found' });
    await ref.update({ ...data, updatedAt: new Date().toISOString() });
    const updatedDoc = await ref.get();
    res.json({ ok: true, data: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Delete attendance record (admin only)
router.delete('/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const ref = db.collection(ATTENDANCE_COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Attendance record not found' });
    await ref.delete();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

export default router;
