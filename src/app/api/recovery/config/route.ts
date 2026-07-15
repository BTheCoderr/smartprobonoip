import { NextResponse } from "next/server";
import { isEmailConfigured } from "@/lib/db/recovery";

export async function GET() {
  return NextResponse.json({
    emailEnabled: isEmailConfigured(),
  });
}
