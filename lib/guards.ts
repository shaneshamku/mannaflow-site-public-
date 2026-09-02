// Code-level backstop for the chiropractic vertical's "never give medical
// advice" rule, covering both services the clinic books (chiropractic care
// and massage therapy). The system prompt already instructs Claude never to
// diagnose/treat/prescribe (lib/claude.ts); this catches it in the rare case
// a reply slips through anyway, before it reaches a patient over SMS.

const MEDICAL_ADVICE_PATTERNS = [
  // Diagnostic language: naming or speculating about a condition
  /\byou (have|might have|could have|probably have|may have)\b.{0,40}\b(herniated|slipped|pinched|bulging|sprain(ed)?|strain(ed)?|fracture(d)?|subluxation|arthritis|sciatica|disc|misalign(ed|ment))\b/i,
  /\bsounds like\b.{0,40}\b(herniated|slipped|pinched|bulging|sprain|strain|fracture|subluxation|arthritis|sciatica|disc)\b/i,
  /\bdiagnos(e|is|ed|ing)\b/i,

  // Treatment/exercise/medication recommendations
  /\bI (recommend|suggest|advise|would)\b.{0,40}\b(stretch(ing|es)?|ic(e|ing)|heat(ing)?|rest(ing)?|exercises?|adjustments?|medications?|ibuprofen|tylenol|advil|acetaminophen|naproxen)\b/i,
  /\byou should (take|try|do|use)\b/i,
  /\btry (stretch(ing)?|ic(e|ing)|applying heat|rest(ing)?|taking)\b/i,

  // Clinical appropriateness / outcome claims
  /\b(chiropractic( care)?|massage( therapy)?) (will|can|should) (fix|cure|help with|treat|relieve)\b/i,
  /\b(a |get a )?massage\b.{0,20}\bfor your\b/i,
  /\bthis (will|should) (fix|cure|resolve|heal)\b/i,
];

export function containsMedicalAdvice(text: string): boolean {
  return MEDICAL_ADVICE_PATTERNS.some((pattern) => pattern.test(text));
}

export function guardChiropracticReply(reply: string, fallback: string): string {
  return containsMedicalAdvice(reply) ? fallback : reply;
}
