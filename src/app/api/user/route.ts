/* eslint-disable @typescript-eslint/no-explicit-any */

// app/api/user/route.ts
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectDB();
  try {
    const userId = verifyToken(req);
    const user = await User.findById(userId).select("username email");
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  await connectDB();
  try {
    const userId = verifyToken(req);
    const body = await req.json();
    const { username, email } = body;
    await User.findByIdAndUpdate(userId, { username, email });
    return NextResponse.json({ message: "Profile updated" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
