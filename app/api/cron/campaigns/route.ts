import { NextRequest, NextResponse } from "next/server";
import { processAllActiveCampaignAssignments } from "@/lib/campaigns";

// See docs/CAMPAIGN_ENGINE.md. Pass ?dryRun=1 to compute what would be sent
// without actually dispatching SMS/email or mutating HvacCampaignLead rows —
// safe to hit manually to sanity-check pending sends.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const results = await processAllActiveCampaignAssignments({ dryRun });

  return NextResponse.json({ dryRun, processed: results.length, results });
}
