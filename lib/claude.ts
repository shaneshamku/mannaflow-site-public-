import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const SYSTEM_PROMPT = `You are a helpful assistant for MannaFlow HVAC, a heating, ventilation, and air conditioning service company. You communicate via SMS on behalf of the HVAC technician.

Your role is to:
- Find out what HVAC issue the customer is experiencing
- Collect their name, property address, and a clear description of the problem
- Determine urgency (is this an emergency, like no heat in winter, no cooling in extreme heat, gas smell, or CO alarm, or a routine concern?)
- Let them know a technician will review their request and follow up shortly

You MUST NOT:
- Quote prices, give cost estimates, or discuss labour rates
- Make scheduling commitments or promise specific response times
- Discuss topics unrelated to HVAC service
- Use em dashes or semicolons in any reply, use commas, periods, and basic punctuation whenever possible

When asked about prices or timing:
"Our technician will give you an accurate quote after reviewing your situation. In the meantime, can I grab your address so we're ready to help?"

ESCALATION: If the customer reports a gas smell, carbon monoxide alarm, flooding from HVAC equipment, or is in an emergency safety situation, begin your response with [ESCALATE] immediately.

Keep responses short and conversational, this is SMS. 2-3 sentences max. Plain language only.

Information priority order:
1. Is this an emergency? (safety first)
2. What is the issue?
3. Customer's name
4. Property address`;

export const ESCALATION_TRIGGERS = [
  "gas smell",
  "smell gas",
  "carbon monoxide",
  "co alarm",
  "co detector",
  "no heat",
  "flooding",
  "water damage",
  "speak to someone",
  "talk to a human",
  "real person",
  "call me back",
  "frustrated",
  "this is ridiculous",
  "not helpful",
  "useless",
  "emergency",
];

export function shouldEscalate(message: string): boolean {
  const lower = message.toLowerCase();
  return ESCALATION_TRIGGERS.some((trigger) => lower.includes(trigger));
}

export const INFO_EXTRACT_PROMPT = `Given the following SMS conversation, extract any customer information that was shared. Return ONLY a valid JSON object with these fields (use null for any field not mentioned):

{
  "name": string | null,
  "email": string | null,
  "address": string | null,
  "issueDescription": string | null,
  "serviceType": "REPAIR" | "INSTALLATION" | "MAINTENANCE" | "EMERGENCY" | null,
  "urgencyLevel": "ROUTINE" | "URGENT" | "EMERGENCY" | null
}

Rules:
- name: full name if mentioned (not just first name greetings)
- email: only if explicitly shared
- address: street address, city, or postal code if mentioned
- issueDescription: brief summary of the HVAC problem described
- serviceType: EMERGENCY if urgency is safety/no-heat/no-cool; REPAIR for broken equipment; INSTALLATION for new unit; MAINTENANCE for tune-up/cleaning
- urgencyLevel: EMERGENCY if safety risk or no heat/cooling; URGENT if uncomfortable but safe; ROUTINE otherwise

Conversation:
`;
