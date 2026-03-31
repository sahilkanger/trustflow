import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTestimonialSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ testimonialId: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { testimonialId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership through space
  const testimonial = await prisma.testimonial.findUnique({
    where: { id: testimonialId },
    include: { space: { select: { userId: true } } },
  });

  if (!testimonial || testimonial.space.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateTestimonialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const updated = await prisma.testimonial.update({
    where: { id: testimonialId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const { testimonialId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const testimonial = await prisma.testimonial.findUnique({
    where: { id: testimonialId },
    include: { space: { select: { userId: true } } },
  });

  if (!testimonial || testimonial.space.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.testimonial.delete({ where: { id: testimonialId } });

  return NextResponse.json({ success: true });
}
