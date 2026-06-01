import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await prisma.user.findFirst({ where: { email: "demo@equityportfolio.com" } });
    if (!user) return NextResponse.json({ alerts: [] });

    const alerts = await prisma.alert.findMany({
      where: { userId: user.id },
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.alert.update({ where: { id }, data: { isRead: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
