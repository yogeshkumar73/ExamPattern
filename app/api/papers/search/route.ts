import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongodb';
import Paper from '@/models/Paper';

/**
 * GET /api/papers/search - Search and filter papers
 * Query params: q (search query), examType, subject, year, sort (newest|popular|trending), page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const examType = searchParams.get('examType');
    const subject = searchParams.get('subject');
    const year = searchParams.get('year');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Build filter
    const filter: any = {};

    if (query) {
      filter.$text = { $search: query };
    }

    if (examType) {
      filter.examType = examType;
    }

    if (subject) {
      filter.subject = subject;
    }

    if (year) {
      filter.year = parseInt(year);
    }

    // Build sort
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case 'popular':
        sortOption = { downloads: -1, createdAt: -1 };
        break;
      case 'trending':
        sortOption = { likes: -1, downloads: -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute search
    const [papers, total] = await Promise.all([
      Paper.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select('paperId title description examType subject year uploaderName uploads downloads likes bookmarks createdAt')
        .lean(),
      Paper.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        papers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
