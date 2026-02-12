from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Navigating to home page...")
        page.goto("http://localhost:3000/")

        # Wait for the main content to be visible
        print("Waiting for content...")
        try:
            page.wait_for_selector(".text-paragraph", timeout=10000)
        except Exception as e:
            print(f"Error waiting for selector: {e}")
            page.screenshot(path="verification/error_screenshot.png")
            browser.close()
            return

        # Wait a bit for the 3D scene to render somewhat (though we mainly care about text readability)
        time.sleep(2)

        # Take a screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/home_page.png")

        browser.close()
        print("Done.")

if __name__ == "__main__":
    run()
