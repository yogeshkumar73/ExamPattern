import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Paper from '@/models/Paper';
import Download from '@/models/Download';
import Like from '@/models/Like';
import Bookmark from '@/models/Bookmark';

/**
 * GET /api/papers/dashboard - Get community repository dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all aggregated statistics
    const [
      totalPapers,
      totalDownloads,
      totalLikes,
      totalBookmarks,
      mostDownloadedPapers,
      recentPapers,
      topUploadersData,
      examTypeDistribution,
    ] = await Promise.all([
      Paper.countDocuments(),
      Download.countDocuments(),
      Like.countDocuments(),
      Bookmark.countDocuments(),
      Paper.find()
        .sort({ downloads: -1 })
        .limit(5)
        .select('paperId title uploaderName downloads likes createdAt')
        .lean(),
      Paper.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('paperId title examType subject uploaderName downloads likes createdAt')
        .lean(),
      Paper.aggregate([
        {
          $group: {
            _id: '$uploaderId',
            name: { $first: '$uploaderName' },
            uploadCount: { $sum: 1 },
            totalDownloads: { $sum: '$downloads' },
          },
        },
        { $sort: { uploadCount: -1 } },
        { $limit: 10 },
      ]),
      Paper.aggregate([
        {
          $group: {
            _id: '$examType',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Get hourly download stats (last 24 hours)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const hourlyStats = await Download.aggregate([
      {
        $match: {
          downloadedAt: { $gte: oneDayAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d %H:00',
              date: '$downloadedAt',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalPapers,
          totalDownloads,
          totalLikes,
          totalBookmarks,
          averageDownloadsPerPaper:
            totalPapers > 0 ? (totalDownloads / totalPapers).toFixed(2) : 0,
          averageLikesPerPaper: totalPapers > 0 ? (totalLikes / totalPapers).toFixed(2) : 0,
        },
        mostDownloaded: mostDownloadedPapers,
        recentUploads: recentPapers,
        topUploaders: topUploadersData,
        examTypeDistribution,
        hourlyDownloads: hourlyStats,
      },
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get dashboard data' },
      { status: 500 }
    );
  }
}
