import CallAnsweringDemo from "./demos/CallAnsweringDemo"
import TextChatDemo from "./demos/TextChatDemo"
import FollowUpDemo from "./demos/FollowUpDemo"
import WinBackDemo from "./demos/WinBackDemo"

const services = [
  {
    name: "24/7 Call Answering",
    tagline: "Picks up when you can't.",
    description:
      "Missed calls get answered in seconds — nights, weekends, mid-job. Callers get real answers and a booked appointment, not voicemail.",
    Demo: CallAnsweringDemo,
  },
  {
    name: "Text & Chat Booking",
    tagline: "Replies in seconds. Books the job.",
    description:
      "One assistant, two channels: it answers new leads by text and chats on your website — qualifies them, answers questions, and books the appointment while you work.",
    Demo: TextChatDemo,
  },
  {
    name: "Automatic Follow-Up",
    tagline: "No lead goes cold.",
    description:
      "When a lead doesn't book right away, timed check-ins go out on day 1, 3, 7, and 14 — until they book or say no. The follow-up your office never has time to do.",
    Demo: FollowUpDemo,
  },
  {
    name: "Past Customer Win-Back",
    tagline: "Your past customers. Your next jobs.",
    description:
      "Reaches the customers you've already served right as their season hits — spring AC, fall heating — so you're in their inbox before they even think to call around.",
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
          What you get
        </p>
        <h2 className="type-headline mb-3 md:mb-4" style={{ color: "#35524A" }}>
          Four tools. One monthly fee.
        </h2>
        <p
          className="type-subhead mb-8 md:mb-16"
          style={{ color: "#627C85", maxWidth: "58ch" }}
        >
          Watch each one work a real job below — every demo is the actual
          conversation flow your customers will have.
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-px"
          style={{ backgroundColor: "#A2E8DD" }}
        >
          {services.map((s) => (
            <div
              key={s.name}
              className="p-6 md:p-10"
              style={{ backgroundColor: "#F5F2EC" }}
            >
              <h3
                className="type-card-title mb-2"
                style={{ color: "#35524A" }}
              >
                {s.name}
              </h3>
              <p
                className="type-label mb-3 md:mb-4"
                style={{ color: "#32DE8A", letterSpacing: "0.12em" }}
              >
                {s.tagline}
              </p>
              <p className="type-body mb-5 md:mb-6" style={{ color: "#627C85" }}>
                {s.description}
              </p>
              <s.Demo />
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
