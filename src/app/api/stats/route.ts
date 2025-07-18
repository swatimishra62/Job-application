/* eslint-disable @typescript-eslint/no-explicit-any */

// app/api/stats/route.ts
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import Job from "@/models/Job";
import { verifyToken } from "@/lib/db";

export async function GET(req: Request) {
  await connectDB();
  try {
    const userId = verifyToken(req);

    const pipeline = [
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ];

    const stats = await Job.aggregate(pipeline);

    const formatted = {
      applied: 0,
      interview: 0,
      rejected: 0,
      accepted: 0,
    };

    stats.forEach((item) => {
      formatted[item._id as keyof typeof formatted] = item.count;
    });

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
