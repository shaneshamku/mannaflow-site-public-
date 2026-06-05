import json
from playwright.sync_api import sync_playwright

OUT = r"C:\Users\shane\Projects\agency-vault\design\screenshots"
URL = "http://localhost:4321"

# Section selectors we care about; we'll check the river never overlaps content boxes.
CONTENT_SEL = [
    ".hero-text", "h1", ".lead-flow-card", ".vt-intro",
    ".demo-card", ".features-grid", ".faq-list",
]

VIEWPORTS = [
    ("desktop_1440", 1440, 900),
    ("tablet_1024", 1024, 768),
    ("mobile_375", 375, 812),
]


def river_water_segments(page):
    """Return the rendered water path as sampled points in page coords."""
    return page.evaluate(
        """() => {
        const p = document.getElementById('river-water-path');
        if (!p || !p.getAttribute('d')) return null;
        const len = p.getTotalLength();
        const pts = [];
        const half = parseFloat(p.getAttribute('stroke-width')) / 2;
        for (let i = 0; i <= 60; i++) {
            const pt = p.getPointAtLength((len * i) / 60);
            pts.push({ x: pt.x, y: pt.y });
        }
        return { half, pts, pageW: document.documentElement.clientWidth };
    }"""
    )


def content_left_edges(page):
    return page.evaluate(
        """(sels) => {
        const out = [];
        for (const s of sels) {
            document.querySelectorAll(s).forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.width === 0) return;
                out.push({ sel: s, left: r.left + window.scrollX, right: r.right + window.scrollX,
                           top: r.top + window.scrollY, bottom: r.bottom + window.scrollY });
            });
        }
        return out;
    }""",
        CONTENT_SEL,
    )


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    results = {}
    for name, w, h in VIEWPORTS:
        page = browser.new_page(viewport={"width": w, "height": h})
        page.goto(URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(600)
        # scroll through to trigger any lazy/scroll logic, then back to top
        total = page.evaluate("document.body.scrollHeight")
        for y in range(0, total, h):
            page.evaluate(f"window.scrollTo(0, {y})")
            page.wait_for_timeout(40)
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(300)

        # horizontal overflow?
        overflow = page.evaluate(
            "document.documentElement.scrollWidth - document.documentElement.clientWidth"
        )

        water = river_water_segments(page)
        overlaps = []
        if water:
            boxes = content_left_edges(page)
            half = water["half"]
            for pt in water["pts"]:
                lo, hi = pt["x"] - half, pt["x"] + half
                for b in boxes:
                    if pt["y"] >= b["top"] and pt["y"] <= b["bottom"]:
                        # channel horizontal span intersects content box span?
                        if hi > b["left"] and lo < b["right"]:
                            overlaps.append(
                                {"sel": b["sel"], "x": round(pt["x"]), "y": round(pt["y"]),
                                 "box": [round(b["left"]), round(b["right"])]}
                            )
        results[name] = {
            "overflow_px": overflow,
            "river_present": water is not None,
            "content_overlaps": overlaps[:8],
            "overlap_count": len(overlaps),
        }
        page.screenshot(path=f"{OUT}\\river_{name}.png", full_page=True)
        page.close()

    print(json.dumps(results, indent=2))
    browser.close()
