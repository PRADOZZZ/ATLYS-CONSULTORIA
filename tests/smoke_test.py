"""Teste local de regressão do prototipo2 (Python Playwright e Chromium).

Executar, na raiz do projeto: python tests/smoke_test.py (modo DOM offline).
Opcional: ATLYS_TEST_HTTP=1 python tests/smoke_test.py (servidor HTTP real).
Não abre contatos externos: WhatsApp, mapa, fontes e imagens remotas são bloqueados.
No modo DOM offline, scripts e CSS são incorporados, e Storage/WhatsApp são simulados.
O modo HTTP pode ser bloqueado por políticas do navegador gerenciado.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright, Error as PlaywrightError
import json
import os

ROOT = Path(__file__).resolve().parent.parent


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def run():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f'http://127.0.0.1:{server.server_port}/'
    checks = []
    inline_mode = os.environ.get('ATLYS_TEST_HTTP') != '1'  # fallback por política do navegador neste ambiente

    def build_inline_html(target, initial_store=None):
        html = (ROOT / target).read_text(encoding='utf8')
        css = (ROOT / 'assets/css/styles.css').read_text(encoding='utf8')
        html = html.replace('<link rel="stylesheet" href="assets/css/styles.css">', '<style>' + css + '</style>')
        for name in ('products', 'app', 'store'):
            marker = f'<script src="assets/js/{name}.js"></script>'
            if marker in html:
                script = (ROOT / f'assets/js/{name}.js').read_text(encoding='utf8')
                html = html.replace(marker, '<script>' + script + '</script>')
        data = json.dumps(initial_store or {})
        mock = """<script>
            (function(){
              const data = JSON.parse(__REPLACE__);
              function makeStorage(state){ return {
                getItem(k){return Object.prototype.hasOwnProperty.call(state,k)?state[k]:null},
                setItem(k,v){state[k]=String(v)},
                removeItem(k){delete state[k]},
                clear(){Object.keys(state).forEach(k=>delete state[k])}
              }}
              Object.defineProperty(window,'localStorage',{configurable:true,value:makeStorage(data)});
              Object.defineProperty(window,'sessionStorage',{configurable:true,value:makeStorage({})});
              window.open=(url)=>{window.__testPopup=url;return null};
            })();
            </script>"""
        mock = mock.replace('__REPLACE__', json.dumps(data))
        return html.replace('<head>', '<head>' + mock, 1)

    def load_page(page, target, initial_store=None):
        nonlocal inline_mode
        if not inline_mode:
            try:
                page.goto(base + target, wait_until='domcontentloaded', timeout=8000)
                return
            except PlaywrightError as e:
                if 'BLOCKED_BY_ADMINISTRATOR' not in str(e):
                    raise
                inline_mode = True
                print('AVISO: Chromium bloqueia navegação. Testando DOM/JS com scripts incorporados (sem navegação real).')
        page.set_content(build_inline_html(target, initial_store), wait_until='domcontentloaded')

    def test(name, condition):
        assert condition, f'FALHOU: {name}'
        checks.append(name)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(**({'executable_path': os.environ['CHROMIUM_PATH']} if os.environ.get('CHROMIUM_PATH') else {}), headless=True, args=['--no-sandbox'])
            context = browser.new_context(viewport={'width': 1440, 'height': 900}, permissions=['clipboard-read', 'clipboard-write'])
            context.route('https://**/*', lambda route: route.abort())
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            load_page(page, 'aparelhos.html')
            test('22 produtos renderizados', page.locator('.phone-card').count() == 22)
            test('22 produtos cadastrados com segunda fonte distinta', page.evaluate('PRODUCTS.filter(p => p.img2 && p.img2 !== p.img).length') == 22)
            test('carrinho não recebe foco quando fechado', page.locator('#cartDrawer').get_attribute('aria-hidden') == 'true' and page.locator('#cartDrawer').get_attribute('inert') is not None)
            page.locator('.filter-btn[data-brand="Apple"]').click()
            test('filtro Apple', page.locator('.phone-card:visible').count() == 7)
            page.locator('.filter-btn[data-storage="512"]').click()
            test('filtro combinado Apple + 512 GB', page.locator('.phone-card:visible').count() == 2)
            page.locator('.filter-btn[data-brand="all"]').click()
            page.locator('.filter-btn[data-storage="512"]').click()  # desativa
            page.locator('#phoneSearch').fill('galaxy')
            test('busca Galaxy', page.locator('.phone-card:visible').count() == 9)
            page.locator('#phoneSearch').fill('')

            opener = page.locator('.phone-card').first.locator('button').first
            opener.click()
            test('adicionar abre carrinho e mantém item', page.locator('#cartDrawer.open').count() == 1 and page.locator('.cart-item').count() == 1)
            test('modal acessível e fundo bloqueado', page.locator('#cartDrawer').get_attribute('aria-hidden') == 'false' and page.locator('body.overlay-open').count() == 1)
            page.keyboard.press('Shift+Tab')
            test('foco retorna ao último controle do carrinho', page.evaluate('document.activeElement.textContent.includes("Solicitar proposta")'))
            page.keyboard.press('Tab')
            test('Tab circular mantém foco no carrinho', page.evaluate('document.activeElement.classList.contains("cart-close")'))
            page.keyboard.press('Escape')
            test('Escape fecha carrinho e devolve foco', page.locator('#cartDrawer.open').count() == 0 and opener.evaluate('(el)=>document.activeElement===el'))

            buy = page.locator('.phone-card').first.locator('button').nth(1)
            buy.click()
            test('solicitar proposta abre checkout', page.locator('#checkoutModal.open').count() == 1 and page.locator('#cartDrawer.open').count() == 0)
            test('checkout foca primeiro campo', page.evaluate('document.activeElement.id==="c-emp"'))
            page.keyboard.press('Shift+Tab')  # campo empresa -> botão Fechar
            test('Shift+Tab chega ao botão fechar', page.evaluate('document.activeElement.classList.contains("cart-close")'))
            page.keyboard.press('Shift+Tab')  # primeiro controle -> último
            test('Shift+Tab circula dentro do checkout', page.evaluate('document.activeElement.textContent.includes("Solicitar proposta e abrir WhatsApp")'))
            page.keyboard.press('Tab')
            test('Tab circula de volta ao início do checkout', page.evaluate('document.activeElement.classList.contains("cart-close")'))
            page.keyboard.press('Escape')
            test('Escape fecha checkout e restaura foco', page.locator('#checkoutModal.open').count() == 0 and buy.evaluate('(el)=>document.activeElement===el'))

            page.locator('.cart-fab').evaluate('(el)=>el.click()')
            page.locator('#cartDrawer .btn.primary.full').click()
            page.locator('#c-emp').fill('Empresa Teste')
            page.locator('#c-cnpj').fill('12345678000190')
            page.locator('#c-nome').fill('Responsável Teste')
            page.locator('#c-wa').fill('11999999999')
            page.locator('#c-mail').fill('teste@example.com')
            page.locator('#c-cid').fill('São Paulo')
            # Popups externos podem falhar no ambiente offline; há link alternativo no site.
            page.locator('#checkoutForm button[type="submit"]').click()
            test('pedido preparado com conteúdo preenchido', page.locator('#orderSent:not(.hidden)').count() == 1 and 'Empresa Teste' in page.locator('#orderSent pre').inner_text())
            test('link WhatsApp preserva dados e destino', 'wa.me/5511941451956' in page.locator('#orderWhatsAppLink').get_attribute('href') and 'Empresa%20Teste' in page.locator('#orderWhatsAppLink').get_attribute('href'))
            test('pedido preserva o carrinho', page.evaluate('Object.values(JSON.parse(localStorage.getItem("atlys-cart"))).reduce((a,b)=>a+b,0)') == 2)
            page.locator('#orderSent button').filter(has_text='Copiar pedido').click()
            page.wait_for_timeout(100)
            test('copiar pedido exibe status', bool(page.locator('#copyOrderStatus').inner_text()))
            page.locator('#orderSent button').filter(has_text='Já enviei').click()
            test('limpeza do carrinho apenas após confirmação', page.evaluate('Object.keys(JSON.parse(localStorage.getItem("atlys-cart"))).length') == 0)

            for width in (1440, 390):
                page.set_viewport_size({'width': width, 'height': 844})
                for target in ('index.html', 'aparelhos.html', 'portabilidade.html'):
                    layout_page = context.new_page()
                    layout_page.set_viewport_size({'width':width,'height':844})
                    layout_page.on('pageerror', lambda error: errors.append(str(error)))
                    load_page(layout_page, target)
                    has_overflow = layout_page.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
                    test(f'sem rolagem horizontal: {target} em {width}px', not has_overflow)
                    layout_page.close()
            mobile_page = context.new_page()
            mobile_page.set_viewport_size({'width':390,'height':844})
            mobile_page.on('pageerror', lambda error: errors.append(str(error)))
            load_page(mobile_page, 'index.html')
            mobile_page.locator('#menuBtn').click()
            test('menu mobile abre', mobile_page.locator('#mobileMenu.open').count() == 1)
            if inline_mode:
                mobile_page.evaluate('document.addEventListener("click",e=>{if(e.target.closest("a"))e.preventDefault()},true)')
            mobile_page.locator('#mobileMenu a').first.click()
            test('menu mobile fecha ao navegar', mobile_page.locator('#mobileMenu.open').count() == 0)
            mobile_page.close()
            if errors: print('JS ERRORS:', errors)
            test('nenhum erro JavaScript nas páginas testadas', not errors)
            context.close()

            malformed = browser.new_context()
            malformed.route('https://**/*', lambda route: route.abort())
            if not inline_mode:
                malformed.add_init_script('localStorage.setItem("atlys-cart", JSON.stringify({"nao-existe": 50, "ip15-256": -4, "a57": 2}));')
            p2 = malformed.new_page()
            load_page(p2, 'aparelhos.html', {'atlys-cart':json.dumps({'nao-existe':50,'ip15-256':-4,'a57':2})})
            test('carrinho persistido inválido é ignorado', p2.locator('.cart-count').first.inner_text() == '2')
            malformed.close()
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
    print(f'{len(checks)} verificações concluídas com sucesso em modo {"DOM offline" if inline_mode else "HTTP local"}:')
    for c in checks:
        print('  OK', c)


if __name__ == '__main__':
    run()
