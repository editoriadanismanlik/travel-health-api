import { Router } from 'express';
import { startOfMonth, endOfMonth, subDays, format } from 'date-fns';
import { Job } from '../models/Job';
import { Task } from '../models/Task';
import { Earning } from '../models/Earning';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    let startDate: Date;
    let endDate = new Date();

    switch (timeRange) {
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case 'month':
        startDate = startOfMonth(endDate);
        endDate = endOfMonth(endDate);
        break;
      case 'quarter':
        startDate = subDays(endDate, 90);
        break;
      case 'year':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      default:
        startDate = startOfMonth(endDate);
        endDate = endOfMonth(endDate);
    }

    // Jobs Statistics
    const [
      totalJobs,
      activeJobs,
      completedJobs,
      jobsByStatus,
      jobsTrend
    ] = await Promise.all([
      Job.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Job.countDocuments({ status: 'active', createdAt: { $gte: startDate, $lte: endDate } }),
      Job.countDocuments({ status: 'completed', createdAt: { $gte: startDate, $lte: endDate } }),
      Job.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$status', value: { $sum: 1 } } },
        { $project: { _id: 0, name: '$_id', value: 1 } }
      ]),
      Job.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $project: { _id: 0, date: '$_id', count: 1 } },
        { $sort: { date: 1 } }
      ])
    ]);

    // Tasks Statistics
    const [
      totalTasks,
      pendingTasks,
      completedTasks,
      tasksByStatus,
      tasksTrend
    ] = await Promise.all([
      Task.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Task.countDocuments({ status: 'pending', createdAt: { $gte: startDate, $lte: endDate } }),
      Task.countDocuments({ status: 'completed', createdAt: { $gte: startDate, $lte: endDate } }),
      Task.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$status', value: { $sum: 1 } } },
        { $project: { _id: 0, name: '$_id', value: 1 } }
      ]),
      Task.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $project: { _id: 0, date: '$_id', count: 1 } },
        { $sort: { date: 1 } }
      ])
    ]);

    // Earnings Statistics
    const [
      totalEarnings,
      monthlyEarnings,
      earningsByJob,
      earningsTrend
    ] = await Promise.all([
      Earning.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      Earning.aggregate([
        { $match: { createdAt: { $gte: startOfMonth(endDate), $lte: endOfMonth(endDate) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      Earning.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }},
        { $unwind: '$job' },
        { $group: {
          _id: '$job.title',
          value: { $sum: '$amount' }
        }},
        { $project: { _id: 0, name: '$_id', value: 1 } },
        { $sort: { value: -1 } },
        { $limit: 5 }
      ]),
      Earning.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' }
        }},
        { $project: { _id: 0, date: '$_id', amount: 1 } },
        { $sort: { date: 1 } }
      ])
    ]);

    res.json({
      jobStats: {
        totalJobs,
        activeJobs,
        completedJobs,
        jobsByStatus,
        jobsTrend
      },
      taskStats: {
        totalTasks,
        pendingTasks,
        completedTasks,
        tasksByStatus,
        tasksTrend
      },
      earningStats: {
        totalEarnings,
        monthlyEarnings,
        earningsByJob,
        earningsTrend
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

export default router;
