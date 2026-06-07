import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, GridFSBucket } from 'mongodb';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongodb';
import Paper from '@/models/Paper';
import Download from '@/models/Download';

/**
 * GET /api/papers/download - Download a paper
 * Query params: paperId, userId
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paperId = searchParams.get('paperId');
    const userId = searchParams.get('userId');

    if (!paperId) {
      return NextResponse.json(
        { error: 'paperId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch paper
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    // Connect to MongoDB for GridFS
    const mongoUrl = process.env.MONGODB_URI;
    if (!mongoUrl) {
      throw new Error('MONGODB_URI not configured');
    }

    const client = new MongoClient(mongoUrl);
    let fileBuffer: Buffer;

    try {
      await client.connect();
      const db = client.db();
      const bucket = new GridFSBucket(db);

      // Download file from GridFS
      fileBuffer = await new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const downloadStream = bucket.openDownloadStream(paper.gridfsId);

        downloadStream.on('data', (chunk) => {
          chunks.push(chunk);
        });

        downloadStream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        downloadStream.on('error', reject);
      });
    } finally {
      await client.close();
    }

    // Increment download count and record download
    await Promise.all([
      Paper.findByIdAndUpdate(paperId, { $inc: { downloads: 1 } }),
      userId && Download.create({ paperId: new ObjectId(paperId), userId: new ObjectId(userId) }),
    ]);

    // Return file as download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': paper.fileType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${paper.fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error.message || 'Download failed' },
      { status: 500 }
    );
  }
}
