import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { UpdateTaskInput } from '@/types/task';
import DOMPurify from 'isomorphic-dompurify';

// Helper function to check task ownership
async function checkTaskOwnership(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  // Simplified return statement
  return !!(task && task.userId === userId);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  if (!await checkTaskOwnership(params.taskId, session.user.id)) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  try {
    const body = await req.json() as UpdateTaskInput;
    const { title, content, description, ...rest } = body;

    const sanitizedData: Partial<UpdateTaskInput> = { ...rest };

    if (title) {
      sanitizedData.title = DOMPurify.sanitize(title);
    }
    if (content) {
      sanitizedData.content = DOMPurify.sanitize(content);
    }
    if (description) {
      sanitizedData.description = DOMPurify.sanitize(description);
    }

    // Prisma's update is strict about `null` vs. `undefined`.
    // Explicitly handle setting parentId to null.
    if (body.hasOwnProperty('parentId')) {
      sanitizedData.parentId = body.parentId;
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: params.taskId,
      },
      data: sanitizedData,
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    // Log error in production-safe way
    if (process.env.NODE_ENV === 'development') {
      console.error(`[TASK_PATCH: ${params.taskId}]`, error);
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  if (!await checkTaskOwnership(params.taskId, session.user.id)) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  try {
    // Note: Deleting a parent task might require cascading deletes for children.
    // The current schema uses `onDelete: NoAction` for self-relations.
    // A recursive delete logic might be needed here if children should also be deleted.
    await prisma.task.delete({
      where: {
        id: params.taskId,
      },
    });
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    // Log error in production-safe way
    if (process.env.NODE_ENV === 'development') {
      console.error(`[TASK_DELETE: ${params.taskId}]`, error);
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 