import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const campaigns = [
  {
    path: "A",
    name: "Path A — Missed Call, No Contact",
    description:
      "Missed-call nurture for leads who haven't been reached yet. Acknowledges the missed call, removes friction to book, and closes out low-pressure by day 21.",
    steps: [
      { day: 0, channel: "SMS", intent: "Acknowledge + offer instant path back in", sampleCopy: "Hi, this is [Company] — sorry we missed your call! If you need help with your heating/cooling today, just reply here or tap to book a time: [link]" },
      { day: 0, channel: "SMS", intent: "Light second touch, lower pressure (if no reply, same evening)", sampleCopy: "Still around if you need us — even after hours. Reply YES and we'll get you booked in." },
      { day: 1, channel: "SMS + Email", intent: "Direct ask, remove friction", sampleCopy: "Just checking — did you get your [furnace/AC] issue sorted? If not, here's a 2-minute way to book a tech: [link]. No obligation to call back and forth." },
      { day: 3, channel: "Email", intent: "Trust content — why responding fast matters", sampleCopy: "Short, real: what happens if a minor issue goes unaddressed — safety/cost framing, not scare tactics. Ends with booking link." },
      { day: 7, channel: "SMS", intent: "Proof + direct ask", sampleCopy: "We've helped [X] homes in [city] this month — average tech arrival same day. Want us to grab you a slot this week?" },
      { day: 14, channel: "Email", intent: "Seasonal hook", sampleCopy: "Tie to current season (pre-summer AC check, pre-winter furnace tune-up) — \"before the first cold snap\" framing." },
      { day: 21, channel: "SMS", intent: "Close-out, low pressure", sampleCopy: "We'll leave it here for now — if anything comes up with your system, we're one text away: [link]. Take care!" },
    ],
  },
  {
    path: "B",
    name: "Path B — Engaged, Didn't Book",
    description:
      "For leads who talked to the agent about a specific issue but didn't book. References their issue directly and escalates to a human/voice callback by day 7.",
    steps: [
      { day: 0, channel: "SMS", intent: "Reference the specific issue, offer booking directly (agent handoff)", sampleCopy: "Hi [Name], following up on the [issue, e.g. 'AC not cooling'] you mentioned — want me to lock in a tech visit? Here's what's open: [link]" },
      { day: 0, channel: "SMS", intent: "Second nudge only if urgency_level = high (same evening)", sampleCopy: "Just making sure this didn't slip — if your AC is still out, we can likely get someone out today." },
      { day: 1, channel: "SMS + Email", intent: "Direct + remove objection (cost/timing)", sampleCopy: "Address the #1 likely objection captured by urgency_level/issue_category (e.g., cost estimate range, same-day availability)." },
      { day: 3, channel: "Email", intent: "Education tailored to issue_category", sampleCopy: "E.g., if issue_category = no_heat: short explainer on common causes + when it's same-day vs. schedulable." },
      { day: 7, channel: "Voice callback (human or outbound Retell) + SMS", intent: "Highest-touch — real callback for warm, qualified leads gone quiet", sampleCopy: "Short human-toned script: \"wanted to check in personally since it sounded urgent.\"" },
      { day: 14, channel: "Email", intent: "Proof + seasonal", sampleCopy: "Review/testimonial relevant to their issue category." },
      { day: 21, channel: "SMS", intent: "Close-out", sampleCopy: "Same low-pressure close as Path A, but references their specific issue by name." },
    ],
  },
  {
    path: "C",
    name: "Path C — Quoted, Went Cold",
    description:
      "For leads who received a quote but stalled. Recaps the quote, handles cost/financing objections, and leans on seasonal urgency and social proof.",
    steps: [
      { day: 1, channel: "SMS + Email", intent: "Thank-you + recap of the quote, single clear next step", sampleCopy: "Thanks again for having us out. Here's a copy of your quote for [job]: [link]. Happy to answer any questions before you decide." },
      { day: 3, channel: "Email", intent: "Handle the #1 objection: financing/cost", sampleCopy: "Financing options, what's included, \"no surprises\" framing — homeowner's repair-vs-replace math." },
      { day: 7, channel: "SMS", intent: "Social proof + soft urgency", sampleCopy: "A few neighbours on your street have made the switch this year — happy to share what they went with if useful. (only if locally true/available)" },
      { day: 14, channel: "Email", intent: "Seasonal/availability urgency", sampleCopy: "Install slot availability tightening pre-season, rebate/incentive deadlines (heat pump rebates — relevant in KW/London/Halifax)." },
      { day: 21, channel: "SMS", intent: "Final, respectful close", sampleCopy: "We'll hold your quote on file — no pressure. Reply anytime if you'd like to move forward or have questions." },
    ],
  },
  {
    path: "D",
    name: "Path D — Website/Chat Engagement, No Call",
    description:
      "Softest-touch path for website/chat visitors who never called. Starts at day 1 with no hard ask, matches content to pages viewed, and rolls into the general list.",
    steps: [
      { day: 1, channel: "Email only (SMS only if phone captured via chat/form)", intent: "Soft welcome, no ask beyond \"here if you need us\"", sampleCopy: "Thanks for stopping by [Company]'s site — if you're weighing options for [service they viewed], happy to answer questions, no pressure." },
      { day: 3, channel: "Email", intent: "Educational content matched to page(s) viewed", sampleCopy: "If they viewed the heat pump page: a short \"is a heat pump right for my home\" explainer." },
      { day: 7, channel: "Email + SMS if engaged (opened/clicked prior emails)", intent: "Light proof point", sampleCopy: "Reviews, warranty/guarantee info." },
      { day: 14, channel: "Email", intent: "Seasonal nudge", sampleCopy: "Tie to season + low-friction CTA (\"get a free estimate\" rather than \"book now\")." },
      { day: 21, channel: "Email", intent: "Roll into general list", sampleCopy: "Invite to monthly tips list; sequence ends, no hard close." },
    ],
  },
];

for (const c of campaigns) {
  const existing = await prisma.hvacCampaign.findFirst({ where: { path: c.path } });
  if (existing) {
    await prisma.hvacCampaign.update({
      where: { id: existing.id },
      data: { name: c.name, description: c.description, steps: c.steps },
    });
    console.log(`Updated campaign: ${c.name}`);
  } else {
    await prisma.hvacCampaign.create({
      data: { name: c.name, path: c.path, description: c.description, steps: c.steps },
    });
    console.log(`Created campaign: ${c.name}`);
  }
}

await prisma.$disconnect();
