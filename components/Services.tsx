import CallAnsweringDemo from "./demos/CallAnsweringDemo"
import TextChatDemo from "./demos/TextChatDemo"
import FollowUpDemo from "./demos/FollowUpDemo"
import WinBackDemo from "./demos/WinBackDemo"

const services = [
  {
    name: "Call Coverage",
    tagline: "Picks up when your team cannot.",
    description:
      "New callers get a professional response when your team is busy, after hours, or away from the phone. Urgent jobs can be flagged, routine calls can be organized, and every lead gets captured.",
    Demo: CallAnsweringDemo,
  },
  {
    name: "Text & Website Booking",
    tagline: "Turns inquiries into booked conversations.",
    description:
      "Website visitors and text leads can ask questions, share job details, and move toward booking without waiting for your office to reply manually.",
    Demo: TextChatDemo,
  },
  {
    name: "Quote Follow-Up",
    tagline: "Keeps open opportunities from going cold.",
    description:
      "When someone gets a quote but does not book right away, MannaFlow sends timed follow-ups so your team does not have to remember every check-in.",
    Demo: FollowUpDemo,
  },
  {
    name: "Past Customer Re-Engagement",
    tagline: "Brings previous customers back at the right time.",
    description:
      "Reach past customers before seasonal demand hits, including spring cooling, fall heating, maintenance reminders, and service check-ins.",
    Demo: WinBackDemo,
  },
]

export default function Services() {
  return (
    <section
      id="services"
      style={{ backgroundColor: "#F5F2EC" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <p className="type-eyebrow mb-3 md:mb-4" style={{ color: "#627C85" }}>
          What You Get
        </p>
        <h2 className="type-headline mb-3 md:mb-4" style={{ color: "#212926" }}>
          Four ways to stop losing time on leads
        </h2>
        <p
          className="type-subhead mb-8 md:mb-16"
          style={{ color: "#627C85", maxWidth: "58ch" }}
        >
          See how MannaFlow helps contractors respond, book, follow up, and
          re-engage customers without adding more manual work.
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-px"
          style={{ backgroundColor: "#DDD5C6" }}
        >
          {services.map((s) => (
            <div
              key={s.name}
              className="p-6 md:p-10"
              style={{
                backgroundColor: "#F5F2EC",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <h3
                className="type-card-title mb-2"
                style={{ color: "#212926" }}
              >
                {s.name}
              </h3>
              <p
                className="type-label mb-3 md:mb-4"
                style={{ color: "#A65F28", letterSpacing: "0.12em" }}
              >
                {s.tagline}
              </p>
              <p className="type-body mb-5 md:mb-6" style={{ color: "#3D4744" }}>
                {s.description}
              </p>
              {/* marginTop auto pins demos to the cell bottom so panels in the
                  same row align even if description line counts differ */}
              <div style={{ marginTop: "auto" }}>
                <s.Demo />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 md:pt-12 text-center">
          <a href="#contact" className="btn-primary">
            See It In Action
          </a>
        </div>
      </div>
    </section>
  )
}
