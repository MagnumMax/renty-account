import re
import unittest
from pathlib import Path


ROOT = Path("/Users/maksymholovakhin/renty-account")
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "style.css").read_text(encoding="utf-8")
JS = (ROOT / "app.js").read_text(encoding="utf-8")


class MobileA11yTests(unittest.TestCase):
    def test_viewport_allows_zoom(self):
        match = re.search(r'<meta\s+name="viewport"\s+content="([^"]+)"', HTML)
        self.assertIsNotNone(match)
        content = match.group(1)
        self.assertNotIn("user-scalable=no", content)
        self.assertNotIn("maximum-scale=1.0", content)
        self.assertIn("width=device-width", content)

    def test_mobile_menu_button_has_accessible_name(self):
        self.assertRegex(
            HTML,
            r'<button id="btn-mobile-menu"[^>]*aria-label="[^"]+"[^>]*aria-expanded="false"[^>]*aria-controls="mobile-drawer"',
        )

    def test_mobile_drawer_has_dialog_semantics_and_close_button(self):
        self.assertRegex(
            HTML,
            r'<div id="mobile-drawer"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="mobile-drawer-title"',
        )
        self.assertRegex(
            HTML,
            r'<button id="btn-mobile-menu-close"[^>]*aria-label="Закрыть меню"',
        )

    def test_login_uses_real_forms(self):
        self.assertRegex(HTML, r'<form id="login-step-email"[^>]*>')
        self.assertRegex(HTML, r'<form id="login-step-code"[^>]*>')

    def test_modals_use_dialog_semantics(self):
        modal_ids = [
            "modal-delete-account",
            "modal-extend",
            "modal-standard",
            "modal-destructive",
            "modal-bottom-sheet",
        ]
        for modal_id in modal_ids:
            self.assertRegex(
                HTML,
                rf'<(?:div|section) id="{modal_id}"[^>]*role="dialog"[^>]*aria-modal="true"',
            )

    def test_styles_include_reduced_motion(self):
        self.assertIn("@media (prefers-reduced-motion: reduce)", CSS)

    def test_dark_theme_is_removed(self):
        self.assertNotIn('[data-theme="dark"]', CSS)
        self.assertNotIn("@media (prefers-color-scheme: dark)", CSS)

    def test_styles_use_geist_or_sf_stack(self):
        self.assertIn("Geist", CSS)
        self.assertIn("SF Pro", CSS)
        self.assertNotIn("Montserrat", CSS)

    def test_overlay_layer_does_not_use_inline_onclick(self):
        self.assertNotIn("onclick=", HTML)

    def test_overlay_triggers_use_data_attributes(self):
        self.assertRegex(HTML, r'data-overlay-open="modal-standard"')
        self.assertRegex(HTML, r'data-overlay-open="modal-extend"')
        self.assertRegex(HTML, r'data-overlay-close="modal-standard"')
        self.assertRegex(HTML, r'data-toast-message="[^"]+"')

    def test_overlay_manager_is_centralized_in_js(self):
        self.assertIn("data-overlay-open", JS)
        self.assertIn("data-overlay-close", JS)
        self.assertIn("data-toast-message", JS)
        self.assertIn("handleDelegatedClick", JS)

    def test_premium_badge_is_next_to_welcome_title(self):
        self.assertRegex(
            HTML,
            r'С возвращением, Максим!</h2>\s*<span[^>]*>[\s\S]*?Premium[\s\S]*?</span>',
        )

    def test_premium_copy_is_unified_without_sidebar_duplicates(self):
        self.assertNotIn("Premium member", HTML)
        self.assertEqual(len(re.findall(r'>\s*Premium\s*<', HTML)), 1)

    def test_additional_option_replaced_with_scdw(self):
        self.assertIn("Расширенная страховка SCDW", HTML)
        self.assertNotIn("Спортивный выхлоп", HTML)

    def test_scdw_card_has_rental_context_and_benefits(self):
        self.assertIn("Для вашей текущей аренды Audi RS Q8", HTML)
        self.assertIn("Покрытие при кузовных повреждениях", HTML)
        self.assertIn("Меньше расходов при страховом случае", HTML)
        self.assertIn("Спокойнее на парковке и в городе", HTML)

    def test_mobile_header_has_safe_area_polish(self):
        self.assertRegex(
            HTML,
            r'<header class="[^"]*pt-\[calc\(env\(safe-area-inset-top,0px\)\+12px\)\][^"]*"',
        )


if __name__ == "__main__":
    unittest.main()
