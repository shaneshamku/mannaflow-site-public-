"""Visual review script — desktop + mobile screenshots and basic checks."""
from playwright.sync_api import sync_playwright
import os, json

URL = "http://localhost:4321"
OUT = r"C:\Users\shane\Projects\mannaflow-site\scripts\screenshots"
os.makedirs(OUT, exist_ok=True)

findings = []

def check(page, label):
    # Overflow check
    overflow = page.evaluate("""() => {
        const els = Array.from(document.querySelectorAll('*'));
        return els
            .filter(el => el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0)
            .map(el => ({ tag: el.tagName, cls: el.className.toString().slice(0, 60), sw: el.scrollWidth, cw: el.clientWidth }))
            .slice(0, 10);
    }""")
    if overflow:
        findings.append(f"[{label}] OVERFLOW on: {overflow}")
    else:
        findings.append(f"[{label}] No horizontal overflow detected")

    # Button/link check
    broken_links = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a'))
            .filter(a => !a.href || a.href === '' || a.href === '#')
            .map(a => a.textContent.trim().slice(0, 40));
    }""")
    if broken_links:
        findings.append(f"[{label}] Placeholder links (expected): {broken_links[:5]}")

    # Heading periods check
    heading_periods = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('h1,h2,h3'))
            .filter(h => h.textContent.trim().endsWith('.'))
            .map(h => h.textContent.trim().slice(0, 60));
    }""")
    if heading_periods:
        findings.append(f"[{label}] Headings still ending with period: {heading_periods}")
    else:
        findings.append(f"[{label}] All headings: no trailing periods")

    # Long lines check (approximate — look for text nodes > 120 chars that might wrap badly)
    long_copy = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('p'))
            .filter(p => p.textContent.trim().length > 180)
            .map(p => p.textContent.trim().slice(0, 80) + '...');
    }""")
    if long_copy:
        findings.append(f"[{label}] Paragraphs >180 chars (may be wordy): {long_copy[:3]}")
    else:
        findings.append(f"[{label}] No overly long paragraphs detected")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # ── Desktop 1280px ──────────────────────────────────────────
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto(URL)
    page.wait_for_load_state("networkidle")
    page.screenshot(path=f"{OUT}\\desktop_full.png", full_page=True)
    page.screenshot(path=f"{OUT}\\desktop_above_fold.png")
    check(page, "desktop-1280")

    # Click each value tab
    for i in range(4):
        try:
            tabs = page.locator('[role="tab"]').all()
            tabs[i].click()
            page.wait_for_timeout(200)
        except Exception as e:
            findings.append(f"[desktop] Tab {i} click error: {e}")

    # Open first FAQ
    try:
        page.locator('.faq-trigger').first.click()
        page.wait_for_timeout(200)
        page.screenshot(path=f"{OUT}\\desktop_faq_open.png")
        findings.append("[desktop] FAQ accordion: opens successfully")
    except Exception as e:
        findings.append(f"[desktop] FAQ error: {e}")

    page.close()

    # ── Mobile 375px ─────────────────────────────────────────────
    page = browser.new_page(viewport={"width": 375, "height": 812})
    page.goto(URL)
    page.wait_for_load_state("networkidle")
    page.screenshot(path=f"{OUT}\\mobile_above_fold.png")
    page.screenshot(path=f"{OUT}\\mobile_full.png", full_page=True)
    check(page, "mobile-375")

    # Check hamburger exists and works
    try:
        ham = page.locator('.hamburger')
        if ham.count() > 0:
            ham.click()
            page.wait_for_timeout(200)
            page.screenshot(path=f"{OUT}\\mobile_menu_open.png")
            findings.append("[mobile] Hamburger menu: opens successfully")
        else:
            findings.append("[mobile] Hamburger not found at 375px")
    except Exception as e:
        findings.append(f"[mobile] Hamburger error: {e}")

    page.close()
    browser.close()

print("\n=== REVIEW FINDINGS ===")
for f in findings:
    print(f)

print(f"\nScreenshots saved to: {OUT}")
