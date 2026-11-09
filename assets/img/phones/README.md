# Imagens dos celulares — pendente

Esta pasta foi mantida vazia de propósito: o checkpoint recebido apontava para imagens externas e o ambiente atual não permite baixar arquivos de sites externos. **Nenhuma foto real foi acrescentada ou certificada nesta etapa.**

Para concluir esta etapa:
1. Obter, com autorização de uso, pelo menos duas fotografias reais e distintas do mesmo modelo (frente e traseira, ou dois ângulos) em fontes verificáveis; registrar a origem.
2. Salvar os arquivos otimizados nesta pasta, por exemplo `ip15-256-01.webp` e `ip15-256-02.webp`.
3. Substituir os endereços remotos pelos caminhos `assets/img/phones/...` nos campos `img` e `img2` em `assets/js/products.js`.
4. Rodar `node tests/check_product_images.mjs --strict` (ele também confere conteúdo duplicado entre as duas vistas).
5. Abrir a loja em navegador com internet, confirmar visualmente modelo, cor, carregamento, rotatividade e responsive.

**Atenção:** Dois links diferentes não garantem duas fotos visualmente distintas. A checagem visual e a licença de uso continuam necessárias; o verificador automático detecta apenas duplicidade exata de arquivos.
