import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { user: null },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ user: payload }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { user: null },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }
}
