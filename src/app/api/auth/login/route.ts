import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";
import { rateLimiter } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await rateLimiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { message: "Too many requests, please try again later." },
      { status: 429 }
    );
  }
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Do not redirect, handle response manually
    });

    // If signIn returns a URL, it means there was an error or a redirect happened
    // In our case, we set redirect: false, so it should not return a URL on success
    if (result?.error) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // If no error, it means authentication was successful.
    // NextAuth handles setting the session cookie automatically.
    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}