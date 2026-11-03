import express from 'express';
import { PRACTICE_DEPARTMENTS } from '../data/mockData.js';

const router = express.Router();

router.get('/', (req, res) => {
  const totalTarget = PRACTICE_DEPARTMENTS.reduce((acc, d) => acc + d.targetRevenue, 0);
  const totalCurrent = PRACTICE_DEPARTMENTS.reduce((acc, d) => acc + d.currentRevenue, 0);

  res.json({
    summary: {
      totalTarget,
      totalCurrent,
      achievementPercentage: Number(((totalCurrent / totalTarget) * 100).toFixed(1))
    },
    data: PRACTICE_DEPARTMENTS
  });
});

export default router;
