/* eslint-disable @typescript-eslint/no-explicit-any */

// app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import { verifyToken } from "@/lib/db";

export async function POST(req: Request) {
  await connectDB();
  try {
    const userId = verifyToken(req);
    const { company, position, status, location } = await req.json();

    const job = new Job({ company, position, status, location, userId });
    await job.save();

    return NextResponse.json({ message: "Job added", job });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function GET(req: Request) {
    await connectDB();
    try {
      const userId = verifyToken(req);
      const url = new URL(req.url);
      const status = url.searchParams.get("status");
      const company = url.searchParams.get("company");
  
      const filters: any = { userId };
      if (status) filters.status = status;
      if (company) filters.company = new RegExp(company, "i");
  
      const jobs = await Job.find(filters).sort({ createdAt: -1 });
  
      return NextResponse.json(jobs);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
  }
