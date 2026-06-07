import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongodb';
import Paper from '@/models/Paper';
import Bookmark from '@/models/Bookmark';

/**
 * GET /api/papers/[id]/bookmark - Check if user bookmarked the paper
 * Query params: userId
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paperId = params.id;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const bookmark = await Bookmark.findOne({
      paperId: new ObjectId(paperId),
      userId: new ObjectId(userId),
    });

    return NextResponse.json({
      success: true,
      bookmarked: !!bookmark,
    });
  } catch (error: any) {
    console.error('Get bookmark error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get bookmark status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/papers/[id]/bookmark - Bookmark a paper
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paperId = params.id;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if paper exists
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    // Try to create bookmark (with unique constraint)
    try {
      await Bookmark.create({
        paperId: new ObjectId(paperId),
        userId: new ObjectId(userId),
      });

      // Increment bookmark count
      await Paper.findByIdAndUpdate(paperId, { $inc: { bookmarks: 1 } });

      return NextResponse.json({
        success: true,
        message: 'Paper bookmarked',
        bookmarks: paper.bookmarks + 1,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        // Already bookmarked
        return NextResponse.json(
          { error: 'Already bookmarked this paper' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Bookmark error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to bookmark paper' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/papers/[id]/bookmark - Remove bookmark
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paperId = params.id;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if bookmark exists and delete
    const bookmark = await Bookmark.findOneAndDelete({
      paperId: new ObjectId(paperId),
      userId: new ObjectId(userId),
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    // Decrement bookmark count
    await Paper.findByIdAndUpdate(paperId, { $inc: { bookmarks: -1 } });

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed',
    });
  } catch (error: any) {
    console.error('Remove bookmark error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove bookmark' },
      { status: 500 }
    );
  }
}
