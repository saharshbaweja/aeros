import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { action, params } = await req.json();

    // Action handler - in production these would modify the database
    switch (action) {
      case "ground_aircraft":
        return NextResponse.json({
          success: true,
          message: `Aircraft ${params.tail_number} has been grounded and set to maintenance status.`,
        });

      case "cancel_flight":
        return NextResponse.json({
          success: true,
          message: `Flight for ${params.customer_name} has been cancelled. SMS notification sent.`,
        });

      case "book_flight":
        return NextResponse.json({
          success: true,
          message: `Flight booked for ${params.customer_name} on ${params.date} at ${params.time}.`,
        });

      case "send_notification":
        return NextResponse.json({
          success: true,
          message: `Notification sent to ${params.recipient}: "${params.message}"`,
        });

      default:
        return NextResponse.json(
          { success: false, message: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    console.error("Actions API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: `Error: ${message}` },
      { status: 500 }
    );
  }
}
