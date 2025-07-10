import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { CreateTaskInput } from '@/types/task';
import DOMPurify from 'isomorphic-dompurify';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('[TASKS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  try {
    const body = await req.json() as CreateTaskInput;
    const { title, parentId, level, orderIndex, content, description } = body;

    const sanitizedTitle = DOMPurify.sanitize(title);
    const sanitizedContent = content ? DOMPurify.sanitize(content) : undefined;
    const sanitizedDescription = description ? DOMPurify.sanitize(description) : undefined;

    const newTask = await prisma.task.create({
      data: {
        title: sanitizedTitle,
        content: sanitizedContent,
        description: sanitizedDescription,
        parentId,
        level,
        orderIndex,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error('[TASKS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 