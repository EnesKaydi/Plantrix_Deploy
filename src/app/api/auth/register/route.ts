import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password } = body;

    if (!email || !password) {
      return new NextResponse('Email and password are required', { status: 400 });
    }

    if (!passwordRegex.test(password)) {
      return new NextResponse(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        { status: 400 }
      );
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (exist) {
      return new NextResponse('User with this email already exists', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Don't send the password back to the client
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('[REGISTER_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 