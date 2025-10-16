from playwright.sync_api import sync_playwright, TimeoutError

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000")
    page.wait_for_load_state('networkidle')
    try:
        page.wait_for_selector("main h2.title", timeout=10000) # 10s timeout
        page.screenshot(path="jules-scratch/verification/verification_before.png")
        page.click("main h2.title")
        page.screenshot(path="jules-scratch/verification/verification_after.png")
    except TimeoutError:
        print("Selector 'main h2.title' not found. Page content:")
        print(page.content())
    browser.close()