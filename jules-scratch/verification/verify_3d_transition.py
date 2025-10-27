
import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    try:
        page.goto("http://localhost:3000")
        page.screenshot(path="jules-scratch/01_initial_load.png")
        time.sleep(1) # allow animations to settle

        # Forward navigation
        page.get_by_role("link", name="About").click()
        time.sleep(0.5) # wait for transition
        page.screenshot(path="jules-scratch/02_navigate_to_About.png")

        page.get_by_role("link", name="Interests").click()
        time.sleep(0.5) # wait for transition
        page.screenshot(path="jules-scratch/03_navigate_to_Interests.png")

        # Backward navigation
        page.get_by_role("link", name="About").click()
        time.sleep(0.5) # wait for transition
        page.screenshot(path="jules-scratch/04_navigate_back_to_About.png")

        page.get_by_role("link", name="Home").click()
        time.sleep(0.5) # wait for transition
        page.screenshot(path="jules-scratch/05_navigate_back_to_Home.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
