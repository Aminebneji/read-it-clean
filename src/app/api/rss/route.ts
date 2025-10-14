import { NextResponse } from "next/server";
import { getAllRSSFeedsInOne } from "@/services/rss.service";

export async function GET() {
    try {
        const data = await getAllRSSFeedsInOne();
        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { success: false, error: (err as Error).message },
            { status: 500 }
        );
    }
}
