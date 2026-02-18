"""
测试深色模式是否正确应用
"""
from playwright.sync_api import sync_playwright
import time

def test_dark_mode():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        
        try:
            print("🚀 正在访问外观设置页面...")
            page.goto('http://localhost:3000/settings/appearance')
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            
            # 截图查看初始状态
            page.screenshot(path='test-initial.png', full_page=True)
            print("📸 已保存初始状态截图")
            
            # 检查 html 元素是否有 dark 类
            has_dark_class = page.evaluate('() => document.documentElement.classList.contains("dark")')
            print(f"\n✅ HTML 元素是否有 dark 类: {has_dark_class}")
            
            # 检查 localStorage
            dark_mode_value = page.evaluate('() => localStorage.getItem("inkwords_dark_mode")')
            print(f"✅ localStorage 中的 dark mode 值: {dark_mode_value}")
            
            # 点击开启深色模式
            print("\n🖱️ 点击深色模式开关...")
            toggle_button = page.locator('section').nth(1).locator('button').last
            toggle_button.click()
            time.sleep(1)
            
            # 再次检查
            has_dark_class_after = page.evaluate('() => document.documentElement.classList.contains("dark")')
            print(f"✅ 点击后 HTML 元素是否有 dark 类: {has_dark_class_after}")
            
            dark_mode_value_after = page.evaluate('() => localStorage.getItem("inkwords_dark_mode")')
            print(f"✅ 点击后 localStorage 中的 dark mode 值: {dark_mode_value_after}")
            
            # 截图查看深色模式状态
            page.screenshot(path='test-dark-mode.png', full_page=True)
            print("\n📸 已保存深色模式截图")
            
            # 访问 profile 页面
            print("\n🚀 访问 profile 页面...")
            page.goto('http://localhost:3000/profile')
            page.wait_for_load_state('networkidle')
            time.sleep(2)
            
            # 检查 profile 页面的 dark 类
            has_dark_class_profile = page.evaluate('() => document.documentElement.classList.contains("dark")')
            print(f"✅ Profile 页面 HTML 元素是否有 dark 类: {has_dark_class_profile}")
            
            page.screenshot(path='test-profile-dark.png', full_page=True)
            print("📸 已保存 profile 页面截图")
            
            print("\n🎉 测试完成！")
            
        except Exception as e:
            print(f"\n❌ 测试失败: {e}")
            page.screenshot(path='test-error.png', full_page=True)
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    test_dark_mode()
