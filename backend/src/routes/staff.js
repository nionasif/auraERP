import express from 'express';
import { STAFF_DIRECTORY } from '../data/mockData.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    total: STAFF_DIRECTORY.length,
    data: STAFF_DIRECTORY
  });
});

export default router;
