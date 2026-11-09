# ATLYS — PROTOTIPO2 | PROGRESSO

Última revisão: 2026-11-08

## Concluído nesta rodada
- Tipografia principal alterada para Baskerville com fallbacks compatíveis.
- Hero reduzido e reproporcionado para notebooks/desktop menores.
- Menu desktop passa para hambúrguer antes de faltar largura (até 1180 px).
- 22 produtos continuam cadastrados e funcionais.
- As imagens principais dos 22 produtos deixaram de depender do proxy `/api/product-image`; foram substituídas por fontes reais diretas correspondentes aos modelos.
- Se uma segunda vista falhar, ela é removida e o card preserva a foto principal, evitando alternar para placeholder.
- Carrinho, filtros, busca, checkout, BrasilAPI, ViaCEP e WhatsApp preservados.
- 32 testes funcionais concluídos.
- 7 testes de segurança/API concluídos.
- Teste de estrutura dos 22 produtos concluído.
- 404 recebeu meta description.

## Pendente para máxima robustez de produção
- Obter autorização/licença comercial e, quando permitido, armazenar localmente as imagens reais dos aparelhos. As fotos atuais são remotas e podem mudar no futuro.
- Realizar inspeção visual final no ambiente Vercel real após deploy, pois hotlinks de terceiros podem ter políticas diferentes por origem/região.
- Revisão jurídica final dos textos de Privacidade e Termos pela empresa.

## Próxima etapa recomendada
Deploy de homologação na Vercel, inspeção visual dos 22 aparelhos e, se algum host remoto bloquear imagem, substituir exclusivamente aquele modelo por uma fonte autorizada/estável ou arquivo local autorizado.

## Rodada de auditoria — 2026-11-08 (noite)
Alteração de código: apenas `tests/*.py` (caminho do Chromium configurável via `CHROMIUM_PATH`, antes fixo em `/usr/bin/chromium`). Nenhum arquivo do site foi alterado.

### Testado (ambiente sem acesso a hosts externos)
- smoke_test: 32/32 OK. security_api_test: 7/7 OK.
- Varredura Playwright em 320, 360, 390, 430, 768, 1024, 1180, 1280, 1366, 1440 e 1920 px nas 6 páginas: 0 px de rolagem horizontal, 0 erros JS, 0 recursos locais ausentes.
- Header + Hero encaixam acima da dobra em 1366×768, 1280×720, 1180×720 e 1024×768 (verificado em captura em 1366×768 e 390×844).
- CSP: hash do script inline da home confere. Títulos, meta description, canonical (exceto 404), Open Graph, robots.txt, sitemap e links/âncoras internas OK. Sem chaves secretas no frontend.
- 22 produtos renderizados; todos têm img2 diferente da principal (iPhone 18 Pro 256/512 e Pro Max 256/512 compartilham o mesmo par de fotos entre armazenamentos).

### NÃO verificado (depende de rede/humano)
- Inspeção visual das fotos dos 22 aparelhos: o ambiente de teste bloqueia hosts externos. As imagens vêm de ~50 varejistas de vários países (webshopapp, ebay, s3, mobiledokan etc.), não do fabricante nem de operadora brasileira.
- Licença das fotos; correspondência exata de modelo/cor; links remotos que podem quebrar.
- Fluxo real de WhatsApp, deploy na Vercel e revisão jurídica de Privacidade/Termos.

### Correção de deploy (2026-11-08, 23:5x)
- Vercel falhava com "The pattern api/product-image.js defined in functions doesn't match any Serverless Functions". O frontend já não usava a função; removidos o bloco `functions` do `vercel.json` e a pasta `api/`. O site agora é 100% estático.
