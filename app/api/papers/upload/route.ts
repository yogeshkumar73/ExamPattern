import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongodb';
import Paper from '@/models/Paper';
import User from '@/models/User';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * POST /api/papers/upload - Upload a new paper to MongoDB GridFS
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const examType = formData.get('examType') as string;
    const subject = formData.get('subject') as string;
    const year = formData.get('year') as string;
    const description = formData.get('description') as string;
    const userId = formData.get('userId') as string;

    // Validation
    if (!file || !title || !examType || !subject || !year || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, title, examType, subject, year, userId' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: PDF, DOCX, PPTX, ZIP, Images` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 50MB limit. Current: ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get user info
    const user = await User.findById(userId).select('name photoUrl');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate file hash for duplicate detection
    const fileBuffer = await file.arrayBuffer();
    const fileHash = crypto
      .createHash('sha256')
      .update(Buffer.from(fileBuffer))
      .digest('hex');

    // Check for duplicate file
    const existingPaper = await Paper.findOne({ fileHash });
    if (existingPaper) {
      return NextResponse.json(
        { error: 'This file has already been uploaded', duplicateId: existingPaper._id },
        { status: 409 }
      );
    }

    // Connect to MongoDB directly for GridFS
    const mongoUrl = process.env.MONGODB_URI;
    if (!mongoUrl) {
      throw new Error('MONGODB_URI not configured');
    }

    const client = new MongoClient(mongoUrl);
    let gridfsId: ObjectId;

    try {
      await client.connect();
      const db = client.db();
      const bucket = new GridFSBucket(db);

      // Upload file to GridFS
      const uploadStream = bucket.openUploadStream(file.name, {
        metadata: {
          uploadedBy: userId,
          uploadDate: new Date(),
          mimeType: file.type,
        },
      });

      await new Promise((resolve, reject) => {
        uploadStream.end(Buffer.from(fileBuffer), (err) => {
          if (err) reject(err);
          else resolve(gridfsId = uploadStream.id);
        });
      });
    } finally {
      await client.close();
    }

    // Create paper document
    const paperId = `PAPER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const paper = await Paper.create({
      paperId,
      title,
      description,
      examType,
      subject,
      year: parseInt(year),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileHash,
      gridfsId,
      uploaderId: new ObjectId(userId),
      uploaderName: user.name,
      uploaderAvatar: user.photoUrl || '',
      downloads: 0,
      likes: 0,
      bookmarks: 0,
      reports: 0,
      views: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Paper uploaded successfully',
        paper: {
          id: paper._id,
          paperId,
          title,
          examType,
          subject,
          year,
          uploaderName: user.name,
          createdAt: paper.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Paper upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload paper' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/papers/upload - Get upload info/quota for user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get user's paper count and total size
    const papers = await Paper.aggregate([
      { $match: { uploaderId: new ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalPapers: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          totalDownloads: { $sum: '$downloads' },
        },
      },
    ]);

    const stats = papers[0] || {
      totalPapers: 0,
      totalSize: 0,
      totalDownloads: 0,
    };

    return NextResponse.json({
      success: true,
      stats: {
        totalPapers: stats.totalPapers,
        totalSize: stats.totalSize,
        totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2),
        totalDownloads: stats.totalDownloads,
        maxQuota: 10, // Max papers per user
        availableQuota: Math.max(0, 10 - stats.totalPapers),
      },
    });
  } catch (error: any) {
    console.error('Get upload quota error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get upload info' },
      { status: 500 }
    );
  }
}
