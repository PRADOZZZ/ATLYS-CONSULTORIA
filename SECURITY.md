# Segurança do prototipo2

## Implementado
- CSP em `vercel.json` e `_headers`.
- HSTS, `nosniff`, proteção contra framing, política de referência e Permissions-Policy.
- Scripts locais; sem chaves privadas no frontend.
- Validação/sanitização dos formulários e limite básico contra spam no navegador.
- Honeypot automático nos formulários.
- Validação de telefone e CNPJ antes do checkout.
- ViaCEP para preenchimento de endereço e BrasilAPI para consulta cadastral do CNPJ.
- `noopener,noreferrer` ao abrir fluxos externos via JavaScript.

## Limitações importantes
Este projeto continua estático. Proteções no navegador reduzem erros e spam casual, mas não substituem um backend. Para produção com pagamento, gravação de pedidos ou WhatsApp Business API, segredos devem ficar em funções server-side/variáveis de ambiente e nunca no JavaScript público.

## Produção
Em Vercel, `vercel.json` aplica os headers automaticamente. Em outras hospedagens, replique os mesmos headers no servidor/CDN. HSTS só deve ser utilizado em HTTPS.


## Publicação final
- `vercel.json` agora aplica CSP, HSTS, nosniff, X-Frame-Options, Referrer-Policy e Permissions-Policy.
- O catálogo usa `/api/product-image` como proxy allowlistado por ID, com cache no CDN da Vercel. Isso evita hotlink direto no navegador, mas a autorização de uso comercial das imagens de terceiros ainda deve ser validada pela empresa.
- Dados pessoais continuam fora do localStorage; somente carrinho e controles técnicos locais podem ser persistidos.
- Privacidade e termos comerciais foram adicionados ao site.
