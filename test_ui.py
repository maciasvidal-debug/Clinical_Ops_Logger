import time
from playwright.sync_api import sync_playwright

def test_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Mock API responses if necessary, but we just need UI
        page.goto("http://localhost:3000")

        page.evaluate("""() => {
            localStorage.setItem('user', JSON.stringify({
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                role: 'manager',
                status: 'completed'
            }));
            localStorage.setItem('isAuthenticated', 'true');
        }""")

        page.reload()
        time.sleep(2)

        # Click menu button on mobile or desktop Settings icon
        try:
          page.click('text=Configuración', timeout=3000)
        except:
          try:
            page.click('text=Settings', timeout=3000)
          except:
            pass # Maybe we need to click the icon

        time.sleep(1)

        try:
          page.click('text=Configuración General', timeout=3000)
        except:
          try:
            page.click('text=General Settings', timeout=3000)
          except:
            pass

        time.sleep(1)

        # Take a screenshot of the Danger Zone
        page.screenshot(path="settings_danger_zone.png", full_page=True)

        try:
          page.click('text=Eliminar mi cuenta', timeout=3000)
        except:
          try:
            page.click('text=Delete My Account', timeout=3000)
          except:
            pass

        time.sleep(1)

        # Take a screenshot of the modal
        page.screenshot(path="settings_delete_modal.png")

        browser.close()

if __name__ == "__main__":
    test_ui()
