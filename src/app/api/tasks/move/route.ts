import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface MoveTaskPayload {
  taskId: string;
  newParentId: string | null;
  newOrderIndex: number;
  newLevel: number;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body: MoveTaskPayload = await req.json();
    const { taskId, newParentId, newOrderIndex, newLevel } = body;

    // Use a transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // 1. Get the task being moved
      const taskToMove = await tx.task.findUnique({
        where: { id: taskId, userId },
      });

      if (!taskToMove) {
        throw new Error('Task not found or user does not have permission.');
      }

      const oldParentId = taskToMove.parentId;
      const oldOrderIndex = taskToMove.orderIndex;

      // 2. Decrement orderIndex for all tasks in the old list that were after the moved task
      await tx.task.updateMany({
        where: {
          userId,
          parentId: oldParentId,
          orderIndex: { gt: oldOrderIndex },
        },
        data: {
          orderIndex: {
            decrement: 1,
          },
        },
      });

      // 3. Increment orderIndex for all tasks in the new list that are at or after the new position
      await tx.task.updateMany({
        where: {
          userId,
          parentId: newParentId,
          orderIndex: { gte: newOrderIndex },
        },
        data: {
          orderIndex: {
            increment: 1,
          },
        },
      });

      // 4. Finally, update the moved task with its new parentId, level, and orderIndex
      await tx.task.update({
        where: {
          id: taskId,
        },
        data: {
          parentId: newParentId,
          level: newLevel,
          orderIndex: newOrderIndex,
        },
      });
    });

    return NextResponse.json({ message: 'Task moved successfully' }, { status: 200 });
  } catch (error: unknown) {
    // Log error in production-safe way
    if (process.env.NODE_ENV === 'development') {
      console.error('[TASKS_MOVE_POST]', error);
    }
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(errorMessage, { status: 500 });
  }
} 