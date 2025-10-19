from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")
        expect(page).to_have_title("Elliot > Home")
        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

run()
