import express from 'express';
import { db } from '../firebase';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = express.Router();
const PARENTAL_CONSENT_COLLECTION = 'parentalConsent';

// Create parental consent
router.post('/', async (req, res) => {
  try {
    const { memberId, guardianName, guardianContact, consentDate, note } = req.body;
    if (!memberId || !guardianName || !guardianContact || !consentDate) {
      return res.status(400).json({ ok: false, error: 'memberId, guardianName, guardianContact, and consentDate are required' });
    }
    const ref = await db.collection(PARENTAL_CONSENT_COLLECTION).add({
      memberId,
      guardianName,
      guardianContact,
      consentDate,
      note: note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const doc = await ref.get();
    res.status(201).json({ ok: true, id: ref.id, data: doc.data() });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Get all parental consents (public or authenticated)
router.get('/', async (_req, res) => {
  try {
    const snapshot = await db.collection(PARENTAL_CONSENT_COLLECTION).orderBy('consentDate', 'desc').get();
    const consents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ ok: true, data: consents });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Get parental consent by ID (protected)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const doc = await db.collection(PARENTAL_CONSENT_COLLECTION).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Parental consent not found' });
    res.json({ ok: true, data: { id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Update parental consent (admin only)
router.put('/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const data = req.body;
    const ref = db.collection(PARENTAL_CONSENT_COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Parental consent not found' });
    await ref.update({ ...data, updatedAt: new Date().toISOString() });
    const updatedDoc = await ref.get();
    res.json({ ok: true, data: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

// Delete parental consent (admin only)
router.delete('/:id', authenticateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const ref = db.collection(PARENTAL_CONSENT_COLLECTION).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ ok: false, error: 'Parental consent not found' });
    await ref.delete();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

export default router;
