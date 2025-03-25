import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This is a placeholder file to satisfy typechecking
// The actual functionality is in [categoryId]/route.ts
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ error: 'API path has changed to /api/categories/[categoryId]' }, { status: 410 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({ error: 'API path has changed to /api/categories/[categoryId]' }, { status: 410 });
} 