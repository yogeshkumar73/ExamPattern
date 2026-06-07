import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

/**
 * POST /api/admin/init - Initialize/Create admin user for development
 * This endpoint creates an admin account if one doesn't exist
 * 
 * Request body:
 * {
 *   "email": "admin@example.com",
 *   "password": "admin123",
 *   "name": "Admin User"
 * }
 */

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    try {
      await dbConnect();

      // Check if admin already exists
      const existingAdmin = await User.findOne({ email, role: 'admin' });
      if (existingAdmin) {
        return NextResponse.json(
          {
            success: true,
            message: 'Admin user already exists',
            admin: {
              id: existingAdmin._id,
              email: existingAdmin.email,
              name: existingAdmin.name,
              role: existingAdmin.role,
            },
          },
          { status: 200 }
        );
      }

      // Check if user with this email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists. Please use a different email.' },
          { status: 409 }
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create admin user
      const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        phone: '',
        role: 'admin',
        status: 'Active',
        isLabApproved: true,
        profileComplete: true,
        // Arena fields (even admins have these)
        arenaApprovalStatus: 'approved',
        arenaAccessRequestedAt: new Date(),
        arenaApprovedAt: new Date(),
        arenaApprovedBy: 'System',
        arenaRejectedAt: null,
        arenaApprovalReason: '',
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Admin user created successfully',
          admin: {
            id: admin._id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          },
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.error('Database error:', dbErr);
      return NextResponse.json(
        {
          error: 'Database error. Make sure MongoDB is connected.',
          details: dbErr.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Admin init error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize admin' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/init - Check if admin exists and get admin count
 */
export async function GET() {
  try {
    await dbConnect();

    const adminCount = await User.countDocuments({ role: 'admin' });
    const totalUsers = await User.countDocuments();

    return NextResponse.json({
      success: true,
      adminCount,
      totalUsers,
      adminExists: adminCount > 0,
      message: adminCount > 0 
        ? `${adminCount} admin(s) found in database` 
        : 'No admin users found. Use POST to create one.',
    });
  } catch (error: any) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check admin status' },
      { status: 500 }
    );
  }
}
