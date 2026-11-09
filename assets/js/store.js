/* Loja de aparelhos — catálogo, carrinho, checkout e validações. */
'use strict';
const WA_NUMBER='5511941451956';
const SEC=window.AtlysSecurity||null;
let cart={};
try{cart=JSON.parse(localStorage.getItem('atlys-cart')||'{}')||{}}catch(e){cart={}}
const validProductIds=new Set(PRODUCTS.map(p=>p.id));
if(!cart||typeof cart!=='object'||Array.isArray(cart))cart={};
cart=Object.fromEntries(Object.entries(cart).filter(([id,q])=>validProductIds.has(id)&&Number.isSafeInteger(q)&&q>0&&q<=999));
const grid=document.getElementById('phoneGrid');
const $=(s,r=document)=>r.querySelector(s);
let returnFocus=null;
const cartDrawer=document.getElementById('cartDrawer');
const checkoutModal=document.getElementById('checkoutModal');
function overlayOpen(el){return Boolean(el&&el.classList.contains('open'))}
function setOverlay(el,open){
  if(!el)return;el.classList.toggle('open',open);el.inert=!open;el.setAttribute('aria-hidden',String(!open));
  document.body.classList.toggle('overlay-open',overlayOpen(cartDrawer)||overlayOpen(checkoutModal));
}
function restoreFocus(){if(overlayOpen(cartDrawer)||overlayOpen(checkoutModal))return;const el=returnFocus;returnFocus=null;if(el&&el.isConnected)el.focus()}
function focusableIn(root){return [...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.getClientRects().length>0)}
function trapFocus(e,root){const els=focusableIn(root);if(!els.length)return;const first=els[0],last=els[els.length-1],active=document.activeElement;if(!root.contains(active)){e.preventDefault();(e.shiftKey?last:first).focus();return}if(e.shiftKey&&active===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&active===last){e.preventDefault();first.focus()}}
const esc=s=>SEC?SEC.escapeHTML(s):String(s).replace(/[&<>'"]/g,'');
function card(p){
  const hasSecond=Boolean(p.img2&&p.img2!==p.img);
  const second=hasSecond?`<img class="second" src="${esc(p.img2)}" data-fallback="${esc(p.fallbackImg2||'')}" alt="${esc(p.name)} ${esc(p.storage)} — outra vista" loading="lazy" width="700" height="700" referrerpolicy="no-referrer">`:'';
  return `<article class="phone-card" id="${esc(p.id)}" data-brand="${esc(p.brand)}" data-storage="${esc(p.storage.replace(/\D/g,''))}" data-search="${esc((p.name+' '+p.storage+' '+p.brand).toLowerCase())}">
  <div class="phone-media"><img class="first" src="${esc(p.img)}" data-fallback="${esc(p.fallbackImg||'')}" alt="${esc(p.name)} ${esc(p.storage)}" loading="lazy" width="700" height="700" referrerpolicy="no-referrer">${second}</div>
  <div class="phone-body"><div class="phone-meta"><span class="badge">${esc(p.brand)}</span><strong>${esc(p.storage)}</strong></div>
  <h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>
  <div class="specs">${p.specs.map(x=>`<span>${esc(x)}</span>`).join('')}</div>
  <div class="price-line"><strong>Consultar condições</strong><small>Possibilidade de até 24x* na fatura da operadora</small></div>
  <div class="phone-actions"><button class="btn primary small" type="button" data-add="${esc(p.id)}">Adicionar ao carrinho</button><button class="btn secondary small" type="button" data-buy="${esc(p.id)}">Solicitar proposta</button></div></div></article>`;
}
let swap=false;
function markImageFailure(img,name,isSecond=false){
  const fallback=img.dataset.fallback;
  if(fallback&&!img.dataset.fallbackUsed){img.dataset.fallbackUsed='1';img.src=fallback;return}
  const wrap=img.closest?.('.phone-media');
  // Se a segunda vista falhar, não alternar para um placeholder: mantenha a foto principal real.
  if(isSecond){
    img.remove();
    wrap?.closest('.phone-card')?.classList.remove('photo-ready','swap');
    return;
  }
  if(!img.dataset.placeholderUsed){img.dataset.placeholderUsed='1';img.src='assets/img/phones/unavailable.svg';img.removeAttribute('data-fallback');return}
  if(wrap){wrap.classList.add('image-missing');wrap.setAttribute('data-missing','Imagem temporariamente indisponível · '+name)}
}
function renderProducts(){
  if(!grid)return;grid.innerHTML=PRODUCTS.map(card).join('');
  const cards=[...grid.querySelectorAll('.phone-card')];
  cards.forEach(c=>{
    c.addEventListener('mouseenter',()=>c.dataset.hover='1');c.addEventListener('mouseleave',()=>delete c.dataset.hover);
    const first=$('.first',c),second=$('.second',c);
    first?.addEventListener('error',()=>markImageFailure(first,c.querySelector('h3')?.textContent||'aparelho',false));
    if(second){second.addEventListener('load',()=>c.classList.add('photo-ready'),{once:true});second.addEventListener('error',()=>markImageFailure(second,c.querySelector('h3')?.textContent||'aparelho',true))}
  });
  setInterval(()=>{swap=!swap;cards.forEach(c=>{if(c.classList.contains('photo-ready')&&!c.dataset.hover)c.classList.toggle('swap',swap)})},6000);
}
function save(){try{localStorage.setItem('atlys-cart',JSON.stringify(cart))}catch(e){}updateCartUI()}
function addToCart(id){if(!validProductIds.has(id))return;cart[id]=Math.min(999,(cart[id]||0)+1);save();openCart()}
function buyNow(id){if(!validProductIds.has(id))return;cart[id]=Math.min(999,(cart[id]||0)+1);save();openCheckout()}
function changeQty(id,d){if(!validProductIds.has(id))return;cart[id]=Math.min(999,(cart[id]||0)+Number(d));if(cart[id]<=0)delete cart[id];save()}
function removeItem(id){delete cart[id];save()}
const prod=id=>PRODUCTS.find(x=>x.id===id);
function updateCartUI(){
  const count=Object.values(cart).reduce((a,b)=>a+b,0),kinds=Object.keys(cart).length;
  document.querySelectorAll('.cart-count').forEach(x=>x.textContent=count);
  const sum=$('#cartSummary');if(sum)sum.innerHTML=`<span>${kinds} produto${kinds===1?'':'s'}</span><span>${count} aparelho${count===1?'':'s'}</span>`;
  const list=$('#cartList');if(!list)return;
  if(!count){list.innerHTML='<div class="empty">Seu carrinho está vazio.<br>Escolha os aparelhos no catálogo.</div>';return}
  list.innerHTML=Object.entries(cart).map(([id,q])=>{const p=prod(id);if(!p)return'';return `<div class="cart-item" data-cart-id="${esc(id)}"><img src="${esc(p.img)}" data-fallback="${esc(p.fallbackImg||'')}" alt="${esc(p.name)}" width="96" height="96" referrerpolicy="no-referrer"><div><h4>${esc(p.name)} ${esc(p.storage)}</h4><div class="qty"><button type="button" aria-label="Diminuir quantidade" data-qty="-1" data-id="${esc(id)}">−</button><strong>${q}</strong><button type="button" aria-label="Aumentar quantidade" data-qty="1" data-id="${esc(id)}">+</button></div></div><button class="remove" type="button" data-remove="${esc(id)}">Remover</button></div>`}).join('');
  list.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>markImageFailure(img,img.alt||'aparelho')));
}
function openCart(){if(!cartDrawer)return;if(!returnFocus)returnFocus=document.activeElement;setOverlay(cartDrawer,true);$('#cartBackdrop')?.classList.add('open');$('.cart-close',cartDrawer)?.focus()}
function closeCart(restore=true){setOverlay(cartDrawer,false);$('#cartBackdrop')?.classList.remove('open');if(restore)restoreFocus()}
function orderLines(){return Object.entries(cart).map(([id,q])=>{const p=prod(id);return p?{q,name:`${p.name} ${p.storage}`}:null}).filter(Boolean)}
function openCheckout(){
  const lines=orderLines();if(!lines.length)return openCart();if(!returnFocus)returnFocus=document.activeElement;closeCart(false);const tt=lines.reduce((a,l)=>a+l.q,0);
  $('#orderSummary').innerHTML=lines.map(l=>`<div><strong>${l.q}×</strong> ${esc(l.name)}</div>`).join('')+`<div class="order-total"><strong>Total: ${tt} aparelho${tt===1?'':'s'}</strong></div>`;
  setOverlay(checkoutModal,true);$('#checkoutForm input')?.focus();
}
function closeCheckout(){setOverlay(checkoutModal,false);restoreFocus()}
function clean(v,max=600){return SEC?SEC.normalizeText(v,max):String(v||'').trim().slice(0,max)}
function finalizeOrder(e){
  e.preventDefault();const form=e.target;
  const guard=SEC?SEC.guardForm(form):{ok:form.checkValidity(),message:'Confira os dados do formulário.'};
  const status=$('#checkoutStatus');
  if(!guard.ok){if(status){status.textContent=guard.message;status.dataset.state='error'};form.reportValidity();return}
  const f=new FormData(form),phone=f.get('whatsapp');
  if(SEC&&!SEC.validatePhone(phone)){if(status){status.textContent='Informe um WhatsApp válido com DDD.';status.dataset.state='error'};$('#c-wa')?.focus();return}
  const cnpj=f.get('cnpj');if(SEC&&!SEC.validateCNPJShape(cnpj)){if(status){status.textContent='Confira o CNPJ informado.';status.dataset.state='error'};$('#c-cnpj')?.focus();return}
  if(SEC&&!SEC.consumeRate()){if(status){status.textContent='Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';status.dataset.state='error'};return}
  const lines=orderLines(),total=lines.reduce((a,l)=>a+l.q,0),order='ATLYS-'+Date.now().toString().slice(-6);
  const text=`*PEDIDO DE APARELHOS — ATLYS*\nPedido: ${order}\n\n*Empresa:* ${clean(f.get('empresa'),160)}\n*CNPJ:* ${clean(f.get('cnpj'),30)}\n*Responsável:* ${clean(f.get('nome'),120)}\n*WhatsApp:* ${clean(f.get('whatsapp'),30)}\n*E-mail:* ${clean(f.get('email')||'-',160)}\n*CEP:* ${clean(f.get('cep')||'-',20)}\n*Endereço:* ${clean(f.get('endereco')||'-',180)}\n*Cidade/UF:* ${clean(f.get('cidade'),100)}/${clean(f.get('estado'),2)}\n*Operadora atual:* ${clean(f.get('operadora')||'-',80)}\n*Quantidade de linhas:* ${clean(f.get('linhas')||'-',8)}\n\n*Produtos*\n${lines.map(l=>`${l.q}x ${clean(l.name,100)}`).join('\n')}\n\n*Quantidade total:* ${total} aparelho${total===1?'':'s'}\n\n*Portabilidade:* ${f.get('portabilidade')?'Sim':'Não'}\n\n*Observações:* ${clean(f.get('obs')||'-',700)}\n\nSolicito confirmação de disponibilidade, valor, plano e eventual condição de parcelamento em até 24x, conforme oferta vigente, elegibilidade e aprovação.`;
  /* Dados pessoais do pedido não são persistidos em localStorage. */
  const orderUrl='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(text);
  window.open(orderUrl,'_blank','noopener,noreferrer');closeCheckout();
  if(status){status.textContent='Pedido preparado com segurança. Confira o WhatsApp para concluir.';status.dataset.state='success'}
  const note=$('#orderSent');if(note){note.classList.remove('hidden');note.querySelector('pre').textContent=text;$('#orderWhatsAppLink').href=orderUrl;note.scrollIntoView({block:'center'})}
}
function clearCart(){cart={};save();$('#orderSent')?.classList.add('hidden');$('#checkoutForm')?.reset()}
async function copyOrder(){const text=$('#orderSent pre')?.textContent||'',feedback=$('#copyOrderStatus');if(!text)return;try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);else{const tmp=document.createElement('textarea');tmp.value=text;tmp.style.position='fixed';tmp.style.opacity='0';document.body.append(tmp);tmp.select();const copied=document.execCommand('copy');tmp.remove();if(!copied)throw new Error('blocked')}feedback.textContent='Pedido copiado.'}catch(err){feedback.textContent='Selecione o texto acima e copie manualmente.'}}
function applyFilters(){const brand=document.querySelector('.filter-btn[data-brand].active')?.dataset.brand||'all';const gb=document.querySelector('.filter-btn[data-storage].active')?.dataset.storage||'all';const term=($('#phoneSearch')?.value||'').toLowerCase().trim();let shown=0;document.querySelectorAll('.phone-card').forEach(c=>{const ok=(brand==='all'||c.dataset.brand===brand)&&(gb==='all'||c.dataset.storage===gb)&&(!term||c.dataset.search.includes(term));c.classList.toggle('hidden',!ok);if(ok)shown++});let em=$('#emptyResults');if(!em&&grid){em=document.createElement('div');em.id='emptyResults';em.className='empty-results hidden';em.textContent='Nenhum aparelho encontrado para esse filtro.';grid.append(em)}em?.classList.toggle('hidden',shown>0)}

document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');if(add){addToCart(add.dataset.add);return}
  const buy=e.target.closest('[data-buy]');if(buy){buyNow(buy.dataset.buy);return}
  const qty=e.target.closest('[data-qty]');if(qty){changeQty(qty.dataset.id,Number(qty.dataset.qty));return}
  const rem=e.target.closest('[data-remove]');if(rem){removeItem(rem.dataset.remove);return}
  const act=e.target.closest('[data-store-action]');if(!act)return;
  ({openCart,closeCart,openCheckout,closeCheckout,copyOrder,clearCart}[act.dataset.storeAction]||(()=>{}))();
});
document.addEventListener('DOMContentLoaded',()=>{
  renderProducts();updateCartUI();SEC?.setupForm($('#checkoutForm'));
  document.querySelectorAll('.filter-btn[data-brand]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter-btn[data-brand]').forEach(x=>x.classList.remove('active'));b.classList.add('active');applyFilters()}));
  document.querySelectorAll('.filter-btn[data-storage]').forEach(b=>b.addEventListener('click',()=>{const was=b.classList.contains('active');document.querySelectorAll('.filter-btn[data-storage]').forEach(x=>x.classList.remove('active'));if(!was)b.classList.add('active');applyFilters()}));
  $('#phoneSearch')?.addEventListener('input',applyFilters);$('#checkoutForm')?.addEventListener('submit',finalizeOrder);$('#cartBackdrop')?.addEventListener('click',()=>closeCart());
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(overlayOpen(checkoutModal))closeCheckout();else if(overlayOpen(cartDrawer))closeCart()}else if(e.key==='Tab'){if(overlayOpen(checkoutModal))trapFocus(e,checkoutModal);else if(overlayOpen(cartDrawer))trapFocus(e,cartDrawer)}});
  if(new URLSearchParams(location.search).get('cart')==='1')openCart();if(location.hash){const el=document.querySelector(location.hash);if(el&&el.classList.contains('phone-card'))setTimeout(()=>el.scrollIntoView({block:'center'}),150)}
});
