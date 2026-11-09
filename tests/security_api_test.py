import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
checks = []

def ok(name, cond):
    assert cond, name
    checks.append(name)

html = (ROOT / 'aparelhos.html').read_text(encoding='utf8')
css = (ROOT / 'assets/css/styles.css').read_text(encoding='utf8')
html = html.replace('<link rel="stylesheet" href="assets/css/styles.css">', '<style>' + css + '</style>')
for name in ('products', 'security', 'app', 'apis', 'store'):
    marker = f'<script src="assets/js/{name}.js"></script>'
    if marker in html:
        html = html.replace(marker, '<script>' + (ROOT / f'assets/js/{name}.js').read_text(encoding='utf8') + '</script>')

mock = r'''<script>
Object.defineProperty(window,'localStorage',{configurable:true,value:(()=>{const s={};return{getItem:k=>s[k]??null,setItem:(k,v)=>s[k]=String(v),removeItem:k=>delete s[k]}})()});
Object.defineProperty(window,'sessionStorage',{configurable:true,value:(()=>{const s={};return{getItem:k=>s[k]??null,setItem:(k,v)=>s[k]=String(v)}})()});
window.open=(url)=>{window.__popup=url;return null};
window.fetch=async function(url){
  url=String(url);
  if(url.includes('brasilapi.com.br')) return new Response(JSON.stringify({razao_social:'EMPRESA TESTE LTDA',cep:'01001000',municipio:'SÃO PAULO',uf:'SP',logradouro:'PRAÇA DA SÉ',numero:'100',descricao_tipo_de_logradouro:'PRAÇA'}),{status:200,headers:{'Content-Type':'application/json'}});
  if(url.includes('viacep.com.br')) return new Response(JSON.stringify({cep:'01001-000',logradouro:'Praça da Sé',bairro:'Sé',localidade:'São Paulo',uf:'SP'}),{status:200,headers:{'Content-Type':'application/json'}});
  throw new Error('network blocked in test');
};
</script>'''
html = html.replace('<head>', '<head>' + mock, 1)

with sync_playwright() as p:
    browser = p.chromium.launch(**({'executable_path': os.environ['CHROMIUM_PATH']} if os.environ.get('CHROMIUM_PATH') else {}), headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.set_content(html, wait_until='domcontentloaded')
    page.locator('.phone-card button[data-buy]').first.click()
    page.locator('#c-cnpj').fill('19131243000197')
    page.locator('#c-cnpj').blur()
    page.wait_for_timeout(150)
    ok('BrasilAPI preenche empresa', page.locator('#c-emp').input_value() == 'EMPRESA TESTE LTDA')
    ok('BrasilAPI preenche CEP', page.locator('#c-cep').input_value() == '01001-000')
    page.locator('#c-cep').focus()
    page.locator('#c-cep').blur()
    page.wait_for_timeout(150)
    ok('ViaCEP preenche cidade', page.locator('#c-cid').input_value() == 'São Paulo')
    ok('ViaCEP mantém/preenche endereço', bool(page.locator('#c-end').input_value()))
    page.locator('#c-nome').fill('Responsável Teste')
    page.locator('#c-wa').fill('11999999999')
    page.wait_for_timeout(1300)
    page.locator('#checkoutForm button[type="submit"]').click()
    page.wait_for_timeout(100)
    ok('checkout seguro gera pedido', page.locator('#orderSent:not(.hidden)').count() == 1)
    ok('dados pessoais não persistem no localStorage', page.evaluate('localStorage.getItem("atlys-last-order")') is None)
    ok('sem erro JS', not errors)
    browser.close()

print(f'{len(checks)} verificações de segurança/API concluídas:')
for x in checks:
    print('  OK', x)
