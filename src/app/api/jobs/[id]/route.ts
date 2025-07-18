/* eslint-disable @typescript-eslint/no-explicit-any */

// app/api/jobs/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import { verifyToken } from "@/lib/db";

export async function PUT(req: Request, { params }: any) {
  await connectDB();
  try {
    const userId = verifyToken(req);
    const { id } = params;
    const updates = await req.json();

    const job = await Job.findOneAndUpdate({ _id: id, userId }, updates, {
      new: true,
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job updated", job });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  await connectDB();
  try {
    const userId = verifyToken(req);
    const { id } = params;

    const job = await Job.findOneAndDelete({ _id: id, userId });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
