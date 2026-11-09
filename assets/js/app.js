/* Atlys — comportamento compartilhado: menu, intro, reveal, formulários, contador do carrinho, clientes, destaques e chatbot */
(function(){
const WA='5511941451956';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const safeGet=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const SEC=window.AtlysSecurity||null;

document.addEventListener('DOMContentLoaded',()=>{
  /* intro (máx. ~1,8s, só na primeira visita da sessão, só na home) */
  const intro=$('#intro');
  if(intro){
    let seen=false;try{seen=sessionStorage.getItem('atlys-intro')}catch(e){}
    if(seen||matchMedia('(prefers-reduced-motion: reduce)').matches){intro.remove()}
    else{setTimeout(()=>{intro.classList.add('done');setTimeout(()=>intro.remove(),600)},1500);try{sessionStorage.setItem('atlys-intro','1')}catch(e){}}
  }

  /* menu mobile */
  const menu=$('#menuBtn'),mob=$('#mobileMenu');
  if(menu&&mob){
    menu.addEventListener('click',()=>{const o=mob.classList.toggle('open');menu.setAttribute('aria-expanded',o)});
    $$('a',mob).forEach(a=>a.addEventListener('click',()=>{mob.classList.remove('open');menu.setAttribute('aria-expanded',false)}));
  }

  /* reveal */
  const items=$$('.reveal');
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    items.forEach(el=>io.observe(el));
  }else items.forEach(el=>el.classList.add('in'));

  /* formulários → WhatsApp, com validação, honeypot e limite básico de tentativas */
  $$('form[data-whatsapp]').forEach(form=>{
    SEC?.setupForm(form);
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const guard=SEC?SEC.guardForm(form):{ok:form.checkValidity(),message:'Confira os dados do formulário.'};
      let feedback=form.querySelector('.form-feedback');
      if(!feedback){feedback=document.createElement('div');feedback.className='form-feedback full';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');form.append(feedback)}
      if(!guard.ok){feedback.textContent=guard.message;feedback.dataset.state='error';form.reportValidity();return}
      const entries=SEC?SEC.safeFormEntries(form):[...new FormData(form).entries()];
      const phoneEntry=entries.find(([k])=>/telefone|whatsapp/i.test(k));
      if(SEC&&phoneEntry&&!SEC.validatePhone(phoneEntry[1])){feedback.textContent='Informe um telefone/WhatsApp válido com DDD.';feedback.dataset.state='error';return}
      if(SEC&&!SEC.consumeRate()){feedback.textContent='Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';feedback.dataset.state='error';return}
      const txt='*Contato pelo site — Atlys*\n'+entries.map(([k,v])=>`${k}: ${v}`).join('\n');
      feedback.textContent='Dados validados. Abrindo o WhatsApp para concluir o contato…';feedback.dataset.state='success';
      window.open('https://wa.me/'+WA+'?text='+encodeURIComponent(txt),'_blank','noopener,noreferrer');
    });
  });

  /* contador do carrinho (todas as páginas) */
  const cart=safeGet('atlys-cart',{});
  const total=Object.values(cart).reduce((a,b)=>a+b,0);
  $$('.cart-count').forEach(x=>x.textContent=total);

  /* clientes — esteira infinita (logos já existentes na pasta) */
  const track=$('#brandTrack');
  if(track){
    const logos=[
      ['acciaio.png','ACCIAIO','https://www.acciaio.com.br/'],
      ['alq.png','ALQ Beauty','https://www.alqbeauty.com.br/'],
      ['canal.png','Canal',''],
      ['gcom.jpg','GCOM','https://www.gcom.com.br/Cloud/Home/About.aspx'],
      ['images.png','Images',''],
      ['interlub.png','Interlub','https://interlub.com/pt/'],
      ['logo-ibiza.jpg','Ibiza',''],
      ['logo-tumkus.jpg','Tumkus','https://www.tumkus.com.br/'],
      ['mamuth.jpg','Mamuth',''],
      ['mavi.jpg','Mavi',''],
      ['monte-life.jpg','Monte Life',''],
      ['omega.png','Omega',''],
      ['sinarmas.png','Sinarmas',''],
      ['solupack.png','Solupack','https://www.solupack.com.br/pt/'],
      ['vera-cruz.png','Vera Cruz',''],
      ['vortex.png','Vortex',''],
      ['logo-ams.jpg','AMS',''],
      ['logo-livre.png','Livre',''],
      ['logo-everton-35-anos.png','Everton',''],
      ['logo-luporini.png','Luporini','https://luporini.com.br/'],
      ['logo-sodie.png','Sodiê Doces','https://www.sodiedoces.com.br/'],
      ['logo.png','Cliente Atlys','']
    ];
    track.innerHTML=[...logos,...logos].map(([file,name,url])=>url
      ? `<a class="logo-card" href="${url}" target="_blank" rel="noopener" aria-label="Abrir site de ${name}"><img src="assets/img/clients/${file}" alt="${name}" loading="lazy"></a>`
      : `<div class="logo-card" aria-label="${name}"><img src="assets/img/clients/${file}" alt="${name}" loading="lazy"></div>`
    ).join('');
  }

  /* aparelhos em destaque na home (usa o catálogo compartilhado) */
  const feat=$('#featPhones');
  if(feat&&window.PRODUCTS){
    const ids=['ip17-256','s26-256','edge70f','a57'];
    feat.innerHTML=ids.map(id=>window.PRODUCTS.find(p=>p.id===id)).filter(Boolean).map(p=>`<a class="feat-phone reveal in" href="aparelhos.html#${p.id}"><div class="ph"><img src="${p.img}" data-fallback="${p.fallbackImg||''}" alt="${p.name} ${p.storage}" loading="lazy" width="640" height="640" referrerpolicy="no-referrer"></div><div class="tx"><small>${p.brand}</small><h3>${p.name}</h3><p>${p.storage} · Consultar condições</p></div></a>`).join('');
    $$('img',feat).forEach(img=>img.addEventListener('error',()=>{if(img.dataset.fallback&&!img.dataset.fallbackUsed){img.dataset.fallbackUsed='1';img.src=img.dataset.fallback}else{img.src='assets/img/phones/unavailable.svg';img.removeAttribute('data-fallback')} }));
  }

  /* chatbot de pré-atendimento — uma pergunta por vez */
  buildChat()
});

function buildChat(){
  const steps=[
    {k:'Nome',q:'Olá! Eu sou o assistente da Atlys. Qual é o seu nome?'},
    {k:'WhatsApp',q:'Prazer, {Nome}! Qual o seu WhatsApp com DDD?',type:'tel'},
    {k:'E-mail',q:'E o seu e-mail profissional?',type:'email'},
    {k:'Necessidade',q:'Qual a sua principal necessidade?',opts:['Portabilidade','Telefonia móvel','Internet / Fibra','PABX','Aparelhos celulares','Outro']},
    {k:'Melhor horário',q:'Qual o melhor horário para falarmos?',opts:['Manhã','Tarde','Noite','Qualquer horário']}
  ];
  const data={};let i=0;
  const btn=document.createElement('button');btn.className='chat-btn';btn.setAttribute('aria-label','Abrir atendimento');
  btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.5A8 8 0 1 1 21 12z"/></svg>Fale conosco';
  const box=document.createElement('section');box.className='chat';box.setAttribute('role','dialog');box.setAttribute('aria-label','Atendimento Atlys');
  box.innerHTML='<div class="chat-privacy">Ao continuar, seus dados serão usados para retorno comercial. <a href="privacidade.html" target="_blank">Privacidade</a></div><div class="chat-head"><div><strong>Atlys Consultoria</strong><small>Pré-atendimento</small></div><button type="button" aria-label="Fechar">×</button></div><div class="chat-body" aria-live="polite"></div><form class="chat-form"><label class="sr-only" for="chatIn">Sua resposta</label><input id="chatIn" autocomplete="off" placeholder="Digite aqui..."><button>Enviar</button></form>';
  document.body.append(btn,box);
  const body=box.querySelector('.chat-body'),form=box.querySelector('form'),input=box.querySelector('input');
  let started=false;
  const say=(t,c)=>{const d=document.createElement('div');d.className='msg '+c;d.textContent=t;body.append(d);body.scrollTop=body.scrollHeight;return d};
  const open=()=>{box.classList.add('open');if(!started){started=true;ask()}setTimeout(()=>input.focus(),50)};
  const close=()=>{box.classList.remove('open');btn.focus()};
  btn.onclick=()=>box.classList.contains('open')?close():open();
  box.querySelector('.chat-head button').onclick=close;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&box.classList.contains('open'))close()});
  function ask(){
    const s=steps[i];if(!s)return finish();
    say(s.q.replace('{Nome}',(data.Nome||'').split(' ')[0]),'bot');
    form.style.display=s.opts?'none':'flex';input.type=s.type||'text';input.value='';
    if(s.opts){const w=document.createElement('div');w.className='chat-opts';s.opts.forEach(o=>{const b=document.createElement('button');b.type='button';b.textContent=o;b.onclick=()=>{w.remove();answer(o)};w.append(b)});body.append(w);body.scrollTop=body.scrollHeight}
    else input.focus();
  }
  function answer(v){const value=SEC?SEC.normalizeText(v,300):String(v).trim();data[steps[i].k]=value;say(value,'me');i++;ask()}
  form.addEventListener('submit',e=>{e.preventDefault();const v=input.value.trim();if(!v)return;if(!input.checkValidity()){input.reportValidity();return}if(steps[i]?.k==='WhatsApp'&&SEC&&!SEC.validatePhone(v)){input.setCustomValidity('Informe um WhatsApp válido com DDD.');input.reportValidity();input.setCustomValidity('');return}answer(v)});
  function finish(){
    form.style.display='none';say('Obrigado! Vou abrir o WhatsApp da Atlys com os seus dados para continuarmos o atendimento.','bot');
    const txt='*Pré-atendimento pelo site — Atlys*\n'+Object.entries(data).map(([k,v])=>`${k}: ${v}`).join('\n');
    const a=document.createElement('a');a.className='btn primary small';a.style.margin='4px 0';a.target='_blank';a.rel='noopener';a.href='https://wa.me/'+WA+'?text='+encodeURIComponent(txt);a.textContent='Continuar no WhatsApp';body.append(a);body.scrollTop=body.scrollHeight;
  }
}
})();
