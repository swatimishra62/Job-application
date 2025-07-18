// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();
  const { username, email, password } = await req.json();

  const userExists = await User.findOne({ email });
  if (userExists) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const newUser = new User({ username, email, password });
  await newUser.save();

  return NextResponse.json({ message: "Signup successful" }, { status: 201 });
}
