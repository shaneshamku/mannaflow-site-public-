import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const organizationName = process.env.SEED_ORGANIZATION ?? "Client Demo";
const organization = await prisma.hvacOrganization.upsert({
  where: { name: organizationName }, update: {}, create: { name: organizationName },
});

// Step shape consumed by lib/campaigns.ts (see docs/CAMPAIGN_ENGINE.md for the
// full design writeup — this file is the single source of truth for campaign
// content, so re-run `node scripts/seed-campaigns.mjs` after editing copy.
//
//   day               - days after HvacCampaignLead.assignedAt this step becomes
//                        due. Fractional values (e.g. 0.5) exist for same-day
//                        second touches ("same evening" in the source doc).
//   sendSms/sendEmail  - which channels this step actually dispatches.
//   smsBody/emailBody  - merge-tag templates. Tokens: {{name}}, {{issue}}, {{link}}
//   skipIfReplied      - if true, skip this step if the lead has sent any inbound
//                        SMS since assignedAt.
//   onlyIfUrgency      - if set, skip unless lead.urgencyLevel is in this list.
//   needsManualCallback - logs a NOTE activity + alerts TECH_EMAIL that a human/
//                        Retell voice callback is owed; the call itself isn't automated.

const campaigns = [
  {
    path: "A",
    name: "Path A — Missed Call, No Contact",
    description:
      "Missed-call nurture for leads who haven't been reached yet. Acknowledges the missed call, removes friction to book, and closes out low-pressure by day 21.",
    steps: [
      {
        day: 0,
        channel: "SMS",
        intent: "Acknowledge + offer instant path back in",
        sampleCopy: "Hi, this is [Company] — sorry we missed your call! If you need help with your heating/cooling today, just reply here or tap to book a time: [link]",
        sendSms: true,
        sendEmail: false,
        smsBody: "Hi {{name}}, this is MannaFlow HVAC — sorry we missed your call! If you need help with your heating/cooling today, just reply here or tap to book a time: {{link}}",
      },
      {
        day: 0.5,
        channel: "SMS",
        intent: "Light second touch, lower pressure (if no reply, same evening)",
        sampleCopy: "Still around if you need us — even after hours. Reply YES and we'll get you booked in.",
        sendSms: true,
        sendEmail: false,
        smsBody: "Still around if you need us — even after hours. Reply YES and we'll get you booked in: {{link}}",
        skipIfReplied: true,
      },
      {
        day: 1,
        channel: "SMS + Email",
        intent: "Direct ask, remove friction",
        sampleCopy: "Just checking — did you get your [furnace/AC] issue sorted? If not, here's a 2-minute way to book a tech: [link]. No obligation to call back and forth.",
        sendSms: true,
        sendEmail: true,
        smsBody: "Just checking — did you get your {{issue}} sorted? If not, here's a 2-minute way to book a tech: {{link}}. No back-and-forth needed.",
        emailSubject: "Still need help with {{issue}}?",
        emailBody: "Hi {{name}},\n\nJust checking in — did you get your {{issue}} taken care of? If not, it only takes a couple minutes to book a technician:\n\n{{link}}\n\nNo obligation, no back-and-forth — just pick a time that works.\n\n— MannaFlow HVAC",
      },
      {
        day: 3,
        channel: "Email",
        intent: "Trust content — why responding fast matters",
        sampleCopy: "Short, real: what happens if a minor issue goes unaddressed — safety/cost framing, not scare tactics. Ends with booking link.",
        sendSms: false,
        sendEmail: true,
        emailSubject: "What happens if you wait on {{issue}}?",
        emailBody: "Hi {{name}},\n\nA quick note on why we suggest not waiting too long on {{issue}}: small HVAC issues have a way of turning into bigger, more expensive ones — and in some cases, safety issues. We're not trying to scare you into anything, just want you to have the full picture.\n\nIf you'd like a tech to take a look: {{link}}\n\n— MannaFlow HVAC",
      },
      {
        day: 7,
        channel: "SMS",
        intent: "Proof + direct ask",
        sampleCopy: "We've helped [X] homes in [city] this month — average tech arrival same day. Want us to grab you a slot this week?",
        sendSms: true,
        sendEmail: false,
        smsBody: "We've been keeping busy helping homes in the area stay comfortable — average tech arrival same day. Want us to grab you a slot this week? {{link}}",
      },
      {
        day: 14,
        channel: "Email",
        intent: "Seasonal hook",
        sampleCopy: "Tie to current season (pre-summer AC check, pre-winter furnace tune-up) — \"before the first cold snap\" framing.",
        sendSms: false,
        sendEmail: true,
        emailSubject: "Before the season catches up with you",
        emailBody: "Hi {{name}},\n\nJust a heads up — this is usually the time of year we start getting busier, so if {{issue}} is still on your list, now's a good time to get ahead of it before appointments fill up.\n\nBook a time here: {{link}}\n\n— MannaFlow HVAC",
      },
      {
        day: 21,
        channel: "SMS",
        intent: "Close-out, low pressure",
        sampleCopy: "We'll leave it here for now — if anything comes up with your system, we're one text away: [link]. Take care!",
        sendSms: true,
        sendEmail: false,
        smsBody: "We'll leave it here for now — if anything comes up with your system, we're one text away: {{link}}. Take care!",
      },
    ],
  },
  {
    path: "B",
    name: "Path B — Engaged, Didn't Book",
    description:
      "For leads who talked to the agent about a specific issue but didn't book. References their issue directly and escalates to a human/voice callback by day 7.",
    steps: [
      {
        day: 0,
        channel: "SMS",
        intent: "Reference the specific issue, offer booking directly (agent handoff)",
        sampleCopy: "Hi [Name], following up on the [issue, e.g. 'AC not cooling'] you mentioned — want me to lock in a tech visit? Here's what's open: [link]",
        sendSms: true,
        sendEmail: false,
        smsBody: "Hi {{name}}, following up on the {{issue}} you mentioned — want me to lock in a tech visit? Here's what's open: {{link}}",
      },
      {
        day: 0.5,
        channel: "SMS",
        intent: "Second nudge only if urgency_level = high (same evening)",
        sampleCopy: "Just making sure this didn't slip — if your AC is still out, we can likely get someone out today.",
        sendSms: true,
        sendEmail: false,
        smsBody: "Just making sure this didn't slip — if {{issue}} is still going on, we can likely get someone out today: {{link}}",
        skipIfReplied: true,
        onlyIfUrgency: ["URGENT", "EMERGENCY"],
      },
      {
        day: 1,
        channel: "SMS + Email",
        intent: "Direct + remove objection (cost/timing)",
        sampleCopy: "Address the #1 likely objection captured by urgency_level/issue_category (e.g., cost estimate range, same-day availability).",
        sendSms: true,
        sendEmail: true,
        smsBody: "Still thinking it over? Happy to answer questions about cost or timing — or just book a time that works: {{link}}",
        emailSubject: "Questions about cost or timing for {{issue}}?",
        emailBody: "Hi {{name}},\n\nWanted to follow up on {{issue}}. If cost or scheduling is what's holding things up, happy to talk through options — we often have same-day availability.\n\nBook a time here: {{link}}\n\n— MannaFlow HVAC",
      },
      {
        day: 3,
        channel: "Email",
        intent: "Education tailored to issue_category",
        sampleCopy: "E.g., if issue_category = no_heat: short explainer on common causes + when it's same-day vs. schedulable.",
        sendSms: false,
        sendEmail: true,
        emailSubject: "What's actually going on with {{issue}}",
        emailBody: "Hi {{name}},\n\nA short explainer on {{issue}}: common causes we see, and how to tell if it needs same-day attention versus something that can be scheduled in the next few days.\n\nIf you'd like a tech to take a look either way: {{link}}\n\n— MannaFlow HVAC",
      },
      {
        day: 7,
        channel: "Voice callback (human or outbound Retell) + SMS",
        intent: "Highest-touch — real callback for warm, qualified leads gone quiet",
        sampleCopy: "Short human-toned script: \"wanted to check in personally since it sounded urgent.\"",
        sendSms: true,
        sendEmail: false,
        smsBody: "Wanted to check in personally since {{issue}} sounded urgent — a member of our team will be reaching out by phone shortly. In the meantime you can also book directly: {{link}}",
        needsManualCallback: true,
      },
      {
        day: 14,
        channel: "Email",
        intent: "Proof + seasonal",
        sampleCopy: "Review/testimonial relevant to their issue category.",
        sendSms: false,
        sendEmail: true,
        emailSubject: "What your neighbours are saying",
        emailBody: "Hi {{name}},\n\nA lot of homeowners dealing with {{issue}} end up glad they got it looked at sooner rather than later. If you'd still like a tech to take a look, we'd be happy to help:\n\n{{link}}\n\n— MannaFlow HVAC",
      },
      {
        day: 21,
        channel: "SMS",
        intent: "Close-out",
        sampleCopy: "Same low-pressure close as Path A, but references their specific issue by name.",
        sendSms: true,
        sendEmail: false,
        smsBody: "We'll leave it here for now — if {{issue}} is still going on, we're one text away: {{link}}. Take care!",
      },
    ],
  },
  {
    path: "C",
    name: "Path C — Quoted, Went Cold",
    description:
      "For leads who received a quote but stalled. Recaps the quote, handles cost/financing objections, and leans on seasonal urgency and social proof.",
    steps: [
      {
        day: 1,
        channel: "SMS + Email",
        intent: "Thank-you + recap of the quote, single clear next step",
        sampleCopy: "Thanks again for having us out. Here's a copy of your quote for [job]: [link]. Happy to answer any questions before you decide.",
        sendSms: true,
        sendEmail: true,
        smsBody: "Thanks again for having us out! Here's a copy of your quote for {{issue}}: {{link}}. Happy to answer any questions before you decide.",
        emailSubject: "Your quote for {{issue}}",
        emailBody: "Hi {{name}},\n\nThanks again for having us out. Here's a copy of your quote for {{issue}}:\n\n{{link}}\n\nHappy to answer any questions before you decide — just reply to this email or give us a call.\n\n— MannaFlow HVAC",
      },
      {
        day: 3,
        channel: "Email",
        intent: "Handle the #1 objection: financing/cost",
        sampleCopy: "Financing options, what's included, \"no surprises\" framing — homeowner's repair-vs-replace math.",
        sendSms: false,
        sendEmail: true,
        emailSubject: "Financing options for {{issue}}",
        emailBody: "Hi {{name}},\n\nIf cost is what's giving you pause on {{issue}}, we get it — it's a big decision. We offer financing options and can walk through exactly what's included so there are no surprises.\n\nReply to this email or book a time to talk it through: {{link}}\n\n— MannaFlow HVAC",
      },
      {
        day: 7,
        channel: "SMS",
        intent: "Social proof + soft urgency",
        sampleCopy: "A few neighbours on your street have made the switch this year — happy to share what they went with if useful. (only if locally true/available)",
        sendSms: true,
        sendEmail: false,
        smsBody: "A few homes nearby have made the switch this year — happy to share what they went with if useful. Let us know: {{link}}",
      },
      {
        day: 14,
        channel: "Email",
        intent: "Seasonal/availability urgency",
        sampleCopy: "Install slot availability tightening pre-season, rebate/incentive deadlines (heat pump rebates — relevant in KW/London/Halifax).",
        sendSms: false,
        sendEmail: true,
        emailSubject: "Availability is tightening up",
        emailBody: "Hi {{name}},\n\nJust a heads up that install slots are starting to fill up as the season picks up, and some rebate/incentive programs have deadlines coming. If you'd like to move forward on {{issue}}, now's a good time.\n\nBook a time here: {{link}}\n\n— MannaFlow HVAC",
      },
      {
        day: 21,
        channel: "SMS",
        intent: "Final, respectful close",
        sampleCopy: "We'll hold your quote on file — no pressure. Reply anytime if you'd like to move forward or have questions.",
        sendSms: true,
        sendEmail: false,
        smsBody: "We'll hold your quote for {{issue}} on file — no pressure. Reply anytime if you'd like to move forward or have questions: {{link}}",
      },
    ],
  },
  {
    path: "D",
    name: "Path D — Website/Chat Engagement, No Call",
    description:
      "Softest-touch path for website/chat visitors who never called. Starts at day 1 with no hard ask, matches content to pages viewed, and rolls into the general list.",
    steps: [
      {
        day: 1,
        channel: "Email only (SMS only if phone captured via chat/form)",
        intent: "Soft welcome, no ask beyond \"here if you need us\"",
        sampleCopy: "Thanks for stopping by [Company]'s site — if you're weighing options for [service they viewed], happy to answer questions, no pressure.",
        sendSms: false,
        sendEmail: true,
        emailSubject: "Thanks for stopping by MannaFlow HVAC",
        emailBody: "Hi {{name}},\n\nThanks for stopping by our site — if you're weighing options for {{issue}}, happy to answer any questions. No pressure at all.\n\nIf you'd like to book a time to talk: {{link}}\n\n— MannaFlow HVAC",
      },
      {
        day: 3,
        channel: "Email",
        intent: "Educational content matched to page(s) viewed",
        sampleCopy: "If they viewed the heat pump page: a short \"is a heat pump right for my home\" explainer.",
        sendSms: false,
        sendEmail: true,
        emailSubject: "Is this the right fit for your home?",
        emailBody: "Hi {{name}},\n\nA short explainer that might help as you weigh options for {{issue}} — happy to answer specific questions about your home's setup any time.\n\n{{link}}\n\n— MannaFlow HVAC",
      },
      {
        day: 7,
        channel: "Email + SMS if engaged (opened/clicked prior emails)",
        intent: "Light proof point",
        sampleCopy: "Reviews, warranty/guarantee info.",
        sendSms: false,
        sendEmail: true,
        emailSubject: "What homeowners say about working with us",
        emailBody: "Hi {{name}},\n\nA couple of reviews and our warranty/guarantee info, in case it's useful while you're deciding on {{issue}}:\n\n{{link}}\n\n— MannaFlow HVAC",
      },
      {
        day: 14,
        channel: "Email",
        intent: "Seasonal nudge",
        sampleCopy: "Tie to season + low-friction CTA (\"get a free estimate\" rather than \"book now\").",
        sendSms: false,
        sendEmail: true,
        emailSubject: "A good time to get ahead of it",
        emailBody: "Hi {{name}},\n\nWith the season changing, now's a good time to get a free estimate for {{issue}} before things get busier.\n\n{{link}}\n\n— MannaFlow HVAC",
      },
      {
        day: 21,
        channel: "Email",
        intent: "Roll into general list",
        sampleCopy: "Invite to monthly tips list; sequence ends, no hard close.",
        sendSms: false,
        sendEmail: true,
        emailSubject: "We're here whenever you're ready",
        emailBody: "Hi {{name}},\n\nWe'll leave things here for now — if {{issue}} comes up again or you'd like to talk, we're just an email away. We'll also add you to our seasonal tips list in case that's useful.\n\n— MannaFlow HVAC",
      },
    ],
  },
];

for (const c of campaigns) {
  const existing = await prisma.hvacCampaign.findFirst({ where: { organizationId: organization.id, path: c.path } });
  if (existing) {
    await prisma.hvacCampaign.update({
      where: { id: existing.id },
      data: { name: c.name, description: c.description, steps: c.steps },
    });
    console.log(`Updated campaign: ${c.name}`);
  } else {
    await prisma.hvacCampaign.create({
      data: { organizationId: organization.id, name: c.name, path: c.path, description: c.description, steps: c.steps },
    });
    console.log(`Created campaign: ${c.name}`);
  }
}

await prisma.$disconnect();
