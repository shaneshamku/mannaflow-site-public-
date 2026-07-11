"use client"

import { useEffect, useRef, useState, type ComponentType } from "react"

export type DemoCarouselItem = {
  id: string
  name: string
  Demo: ComponentType
}

const n = (items: DemoCarouselItem[]) => items.length

function posClass(off: number) {
  if (off === 0) return "is-active"
  if (off === 1) return "is-next"
  if (off === -1) return "is-prev"
  return "is-far"
}

export default function DemoCarousel({ items }: { items: DemoCarouselItem[] }) {
  const [active, setActive] = useState(0)
  const startX = useRef<number | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const count = n(items)

  // Cards are absolutely positioned and reordered by CSS transform, so the
  // browser's native #hash jump (which fires before this effect, against
  // the server-rendered layout) lands in the wrong spot. Drive the scroll
  // ourselves instead of letting the individual cards be anchor targets.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    const i = items.findIndex((item) => item.id === hash)
    if (i >= 0) {
      setActive(i)
      wrapperRef.current?.scrollIntoView({ block: "start" })
    }
  }, [items])

  const go = (dir: number) => setActive((a) => (a + dir + count) % count)

  function relative(i: number) {
    let off = i - active
    if (off > count / 2) off -= count
    else if (off < -count / 2) off += count
    return off
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX
  }
  function onPointerUp(e: React.PointerEvent) {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1)
    startX.current = null
  }

  return (
    <div ref={wrapperRef} style={{ scrollMarginTop: "80px" }}>
      <div className="mf-demo-carousel">
        <button
          type="button"
          className="mf-demo-arrow mf-demo-arrow--prev"
          onClick={() => go(-1)}
          aria-label="Previous demo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className="mf-demo-stage"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {items.map((item, i) => {
            const off = relative(i)
            const { Demo } = item
            return (
              <article
                key={item.id}
                className={`mf-demo-card ${posClass(off)}`}
                aria-hidden={off !== 0}
              >
                <h2 className="mf-demo-card-title">{item.name}</h2>
                <div className="mf-demo-card-body">
                  <Demo />
                </div>
              </article>
            )
          })}
        </div>

        <button
          type="button"
          className="mf-demo-arrow mf-demo-arrow--next"
          onClick={() => go(1)}
          aria-label="Next demo"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="mf-demo-dots" role="tablist" aria-label="Product demos">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`mf-demo-dot${i === active ? " is-active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Show ${item.name}`}
            aria-selected={i === active}
            role="tab"
          />
        ))}
      </div>
    </div>
  )
}
