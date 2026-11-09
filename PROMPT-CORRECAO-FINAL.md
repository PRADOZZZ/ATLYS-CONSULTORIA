# PROMPT MESTRE — CORREÇÃO FINAL E PUBLICAÇÃO DO PROTOTIPO2

Atue como uma equipe sênior de desenvolvimento web, UI/UX, e-commerce B2B, segurança, SEO, acessibilidade, performance e QA.

## REGRA PRINCIPAL

Você receberá o projeto existente `prototipo2`. NÃO recrie o site do zero, NÃO troque a identidade visual, NÃO substitua por template e NÃO remova funcionalidades que já funcionam. Trabalhe diretamente sobre a base existente e preserve o visual atual: azul-marinho escuro, composição corporativa, componentes predominantemente retos/quadrados, jornadas, serviços, esteiras, loja B2B, carrinho, checkout por WhatsApp e imagens institucionais já posicionadas.

A versão de referência visual é o próprio projeto recebido. Alterações devem ser corretivas e incrementais.

## 1. PRIORIDADE MÁXIMA — IMAGENS DOS APARELHOS

Audite os 22 produtos cadastrados em `assets/js/products.js`.

Requisitos:
- Cada card precisa exibir pelo menos UMA fotografia real e correta do aparelho.
- Nunca mostrar espaço vazio por falha de imagem.
- Nunca usar foto de modelo diferente.
- Não usar imagens corporativas como substitutas de celulares.
- Se houver duas fotografias válidas e diferentes, alternar entre elas a cada ~6 segundos.
- Se a segunda fotografia falhar, manter somente a primeira. NÃO alternar para placeholder.
- O placeholder local `assets/img/phones/unavailable.svg` é apenas último recurso.
- Não duplicar a mesma foto para simular uma segunda vista.
- Validar manualmente todos os modelos Apple, Samsung e Motorola.
- Preferir fabricante oficial, operadora ou varejista confiável.
- Quando houver autorização/licença adequada, armazenar as imagens localmente em `assets/img/phones/` para reduzir dependência de hotlink.
- Se as imagens permanecerem remotas, manter no mínimo duas fontes de fallback e `referrerpolicy="no-referrer"`.
- Não declarar a mídia concluída sem abrir o catálogo e verificar visualmente os 22 produtos.

Produtos obrigatórios: iPhone 15 256GB; iPhone 16 256GB; iPhone 17 256GB; iPhone 18 Pro 256/512GB; iPhone 18 Pro Max 256/512GB; Moto G37 5G 128GB; Moto G47 5G 128GB; Moto G67 5G 256GB; Moto G77 5G 256GB; Moto Edge 70 Fusion 5G 256GB; Moto Edge 70 5G 512GB; Galaxy A07 5G 128GB; A17 5G 128GB; A27 5G 256GB; A37 5G 256GB; A57 5G 256GB; S26 FE 5G 256GB; S26 5G 256/512GB; S26 Ultra 5G 512GB.

## 2. PRIMEIRA DOBRA / HOME

O layout atual deve ser preservado, mas a primeira dobra precisa caber corretamente em notebooks e monitores menores.

Obrigatório:
- Testar 1366x768, 1280x720, 1180x720, 1024x768, 390x844 e 360x800.
- O header + Hero + início/faixa de estatísticas devem ficar proporcionalmente encaixados.
- Não usar Hero exageradamente alto.
- Não usar `height:100vh` sem necessidade.
- Entre 1000 e ~1180 px, trocar para menu hambúrguer se o menu desktop não couber.
- Não esconder overflow para mascarar conteúdo cortado.
- Nenhum CTA ou texto deve ultrapassar a viewport.
- Preservar a composição em duas colunas no desktop e reorganizar em uma coluna no mobile.

## 3. TIPOGRAFIA

Usar Baskerville como fonte principal do projeto.

Stack recomendada:
`Baskerville, "Baskerville Old Face", "Hoefler Text", "Libre Baskerville", Georgia, "Times New Roman", serif`

Aplicar em títulos, textos, navegação, botões e formulários, preservando legibilidade. Não baixar/distribuir arquivos de fonte proprietários. Não depender de fonte externa quando o sistema já possuir Baskerville; usar fallbacks compatíveis.

## 4. PRESERVAR A IDENTIDADE ATUAL

Não clarear o site nem arredondar novamente os componentes.

Manter:
- azul-marinho profundo;
- branco e cinza como contraste;
- cards retos;
- botões retangulares;
- serviços em grid escuro;
- Jornada em 4 etapas;
- esteira de operadoras;
- esteira de clientes;
- avaliações;
- fotos institucionais contextuais;
- Portabilidade em destaque;
- loja de aparelhos B2B.

## 5. LOJA E FLUXO COMERCIAL

Preservar e testar:
- 22 produtos;
- busca;
- filtros por marca e memória;
- quantidade;
- adicionar ao carrinho;
- alterar quantidade;
- remover;
- localStorage apenas para carrinho não sensível;
- checkout;
- BrasilAPI para CNPJ;
- ViaCEP;
- geração dinâmica do pedido;
- WhatsApp `5511941451956`;
- alternativa de copiar mensagem;
- texto claro de que o WhatsApp não conclui a compra.

Não implementar pagamento fictício, estoque fictício ou preço não confirmado.

## 6. SEO, SEGURANÇA E PRODUÇÃO

Validar antes da entrega:
- `index.html` na raiz;
- `vercel.json` válido;
- CSP compatível com scripts, imagens, mapa e APIs realmente usados;
- HSTS em produção HTTPS;
- `X-Content-Type-Options`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- proteção de frame;
- nenhum segredo no frontend;
- canonical correto;
- title e meta description únicos;
- Open Graph;
- sitemap.xml;
- robots.txt;
- 404 com título e description;
- Privacidade e Termos acessíveis pelo footer.

## 7. DADOS COMERCIAIS

Não inventar números, cases ou avaliações. Manter apenas informações verificadas. Quando um dado não puder ser confirmado, neutralizar/remover.

Os dados institucionais atuais devem ser tratados como configuração revisável: telefone, WhatsApp, e-mail, endereço e horário. A condição de até 24x deve continuar acompanhada do aviso de oferta, elegibilidade, estoque e aprovação da operadora.

## 8. RESPONSIVIDADE E ACESSIBILIDADE

Testar 320, 360, 390, 430, 768, 1024, 1180, 1280, 1440 e 1920 px.

Validar:
- zero overflow horizontal;
- menu e submenus acessíveis;
- foco visível;
- Escape fecha overlays;
- foco preso em modais/drawers;
- `alt` contextual nas imagens;
- labels nos formulários;
- `prefers-reduced-motion`;
- áreas clicáveis adequadas;
- contraste suficiente.

## 9. PERFORMANCE

- Definir width/height em imagens para reduzir CLS.
- Lazy-load abaixo da dobra.
- Não carregar scripts desnecessários.
- Otimizar imagens institucionais em WebP/AVIF quando possível.
- Evitar imagens de produto gigantes sem dimensionamento.
- Não sacrificar a qualidade visual para atingir métrica artificial.

## 10. AUDITORIA FINAL OBRIGATÓRIA

Antes de dizer “pronto para publicação”, execute e reporte:
- quantidade de produtos renderizados;
- quantidade de produtos com imagem principal válida;
- quantos possuem segunda vista válida;
- links internos quebrados;
- recursos locais ausentes;
- erros JavaScript;
- filtros;
- busca;
- carrinho;
- checkout;
- WhatsApp;
- BrasilAPI;
- ViaCEP;
- responsividade 1440/1180/390/360;
- overflow horizontal;
- menu mobile;
- Privacidade/Termos;
- SEO principal;
- configuração Vercel.

Se uma imagem remota não puder ser confirmada, não finja que está resolvida. Liste o modelo e a pendência.

## 11. ENTREGÁVEIS

Entregar o mesmo projeto `prototipo2`, preservando o design atual, mais:
- ZIP pronto para Vercel;
- `PROGRESSO.md` atualizado;
- `CHECKPOINT.md` atualizado;
- relatório curto do que foi alterado;
- lista objetiva de pendências reais, caso reste alguma.

## INSTRUÇÃO FINAL

Não redesenhe o site. Não reinicie. Não simplifique o que já está pronto. Corrija especificamente as imagens de aparelhos, a proporção da primeira dobra, a responsividade intermediária, a tipografia Baskerville e qualquer falha de produção encontrada durante a auditoria. O resultado precisa continuar visualmente reconhecível como o `prototipo2` recebido, apenas mais estável, consistente e pronto para publicação.
