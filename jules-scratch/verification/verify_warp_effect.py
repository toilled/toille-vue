
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000")
    page.press('body', 'w')
    page.wait_for_timeout(1000)  # Wait for the effect to be visible
    page.screenshot(path="jules-scratch/verification/warp_effect.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
