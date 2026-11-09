# CHECKPOINT — PROTOTIPO2

## Concluído
- Baskerville aplicada globalmente.
- Primeira dobra compactada e breakpoint intermediário corrigido.
- Catálogo mantém 22 produtos.
- Imagens principais migradas para fontes reais diretas por modelo.
- Segunda vista com falha não substitui mais a imagem principal por placeholder.
- Fluxos de loja e segurança preservados.

## Testado
- 32 verificações funcionais.
- 7 verificações de segurança/API.
- 22 produtos com imagem principal e segunda fonte distinta cadastradas.
- Sem overflow horizontal em index/aparelhos/portabilidade em 1440 e 390 px no teste automatizado.

## Pendente
- Validação visual pós-deploy de cada host remoto de imagem.
- Localização definitiva das imagens de produto após validação de licença/autorização.

## Próxima ação
Publicar em preview Vercel, abrir todos os filtros do catálogo e substituir qualquer host que ainda bloqueie hotlink no ambiente real.

## Checkpoint 2026-11-08 (noite)
- Estado: site estável. Auditoria de layout/responsividade/segurança/SEO sem pendências técnicas. Apenas `tests/` foi alterado.
- Próximo passo: abrir aparelhos.html em navegador com internet (ou na Vercel de homologação) e conferir os 22 cards; substituir por arquivo local autorizado qualquer foto que falhe ou seja de modelo errado.
