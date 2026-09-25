import { NextResponse } from "next/server";

export function serviceUnavailable(operation: string, error: unknown) {
  // Avoid logging credentials or raw database errors into deployment logs.
  console.error(
    `${operation} failed`,
    error instanceof Error ? error.name : "UnknownError",
  );
  return NextResponse.json(
    {
      error:
        "The studio is temporarily unavailable. Please try again in a moment.",
    },
    { status: 503 },
  );
}
