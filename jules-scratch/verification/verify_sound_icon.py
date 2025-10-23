
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 375, "height": 667})
        page.goto("http://localhost:3000")
        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

run()
