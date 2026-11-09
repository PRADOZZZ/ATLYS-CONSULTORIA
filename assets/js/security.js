/* Atlys — segurança e integrações públicas sem segredos no frontend. */
(function(){
  'use strict';
  const submissionTimes=new WeakMap();
  const now=()=>Date.now();
  const onlyDigits=v=>String(v||'').replace(/\D/g,'');
  const cleanCNPJ=v=>String(v||'').toUpperCase().replace(/[^0-9A-Z]/g,'');
  const normalizeText=(value,max=500)=>String(value??'')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'')
    .replace(/\s{3,}/g,'  ')
    .trim().slice(0,max);
  const escapeHTML=value=>String(value??'').replace(/[&<>'"]/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  })[ch]);
  const formatCEP=v=>{
    const d=onlyDigits(v).slice(0,8);return d.length>5?`${d.slice(0,5)}-${d.slice(5)}`:d;
  };
  const formatPhone=v=>{
    const d=onlyDigits(v).slice(0,11);
    if(d.length<=2)return d;
    if(d.length<=6)return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if(d.length<=10)return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  };
  const formatNumericCNPJ=v=>{
    const d=onlyDigits(v).slice(0,14);
    return d.replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2');
  };
  const validateNumericCNPJ=v=>{
    const c=onlyDigits(v);if(c.length!==14||/^(\d)\1{13}$/.test(c))return false;
    const calc=(base,weights)=>{const sum=base.split('').reduce((s,n,i)=>s+Number(n)*weights[i],0);const r=sum%11;return r<2?0:11-r};
    const d1=calc(c.slice(0,12),[5,4,3,2,9,8,7,6,5,4,3,2]);
    const d2=calc(c.slice(0,12)+d1,[6,5,4,3,2,9,8,7,6,5,4,3,2]);
    return c.endsWith(`${d1}${d2}`);
  };
  const validateCNPJShape=v=>{
    const c=cleanCNPJ(v);return c.length===14&&/^[0-9A-Z]{12}[0-9]{2}$/.test(c)&&( /[A-Z]/.test(c) || validateNumericCNPJ(c) );
  };
  const validatePhone=v=>{const d=onlyDigits(v);return d.length===10||d.length===11};
  const fetchJSON=async(url,{timeout=7000}={})=>{
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
    try{
      const res=await fetch(url,{headers:{Accept:'application/json'},signal:controller.signal,cache:'no-store',referrerPolicy:'no-referrer'});
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }finally{clearTimeout(timer)}
  };
  const api={
    async cep(value){
      const cep=onlyDigits(value);if(cep.length!==8)throw new Error('CEP inválido');
      const data=await fetchJSON(`https://viacep.com.br/ws/${encodeURIComponent(cep)}/json/`);
      if(data.erro)throw new Error('CEP não encontrado');return data;
    },
    async cnpj(value){
      const cnpj=cleanCNPJ(value);if(!validateCNPJShape(cnpj))throw new Error('CNPJ inválido');
      return fetchJSON(`https://brasilapi.com.br/api/cnpj/v1/${encodeURIComponent(cnpj)}`);
    }
  };
  const setupForm=form=>{
    if(!form||submissionTimes.has(form))return;
    submissionTimes.set(form,now());
    form.setAttribute('novalidate','');
    if(!form.querySelector('[name="website"]')){
      const hp=document.createElement('input');hp.type='text';hp.name='website';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');hp.className='hp-field';form.append(hp);
    }
  };
  const rateKey='atlys-submit-log';
  const rateAllowed=()=>{
    let log=[];try{log=JSON.parse(localStorage.getItem(rateKey)||'[]')}catch(e){}
    const cutoff=now()-10*60*1000;log=Array.isArray(log)?log.filter(t=>Number(t)>cutoff):[];
    if(log.length>=5)return false;log.push(now());try{localStorage.setItem(rateKey,JSON.stringify(log))}catch(e){}return true;
  };
  const guardForm=form=>{
    setupForm(form);
    const hp=form.querySelector('[name="website"]');if(hp&&hp.value)return {ok:false,message:'Não foi possível enviar este formulário.'};
    const started=submissionTimes.get(form)||now();if(now()-started<1200)return {ok:false,message:'Revise os dados antes de enviar.'};
    if(!form.checkValidity())return {ok:false,message:'Preencha corretamente os campos obrigatórios.'};
    return {ok:true};
  };
  const safeFormEntries=form=>{
    const out=[];new FormData(form).forEach((v,k)=>{if(k!=='website')out.push([normalizeText(k,80),normalizeText(v,900)])});return out;
  };
  const setStatus=(el,msg,type='info')=>{if(!el)return;el.textContent=msg;el.dataset.state=type;};
  window.AtlysSecurity={onlyDigits,cleanCNPJ,normalizeText,escapeHTML,formatCEP,formatPhone,formatNumericCNPJ,validateCNPJShape,validatePhone,api,setupForm,guardForm,consumeRate:rateAllowed,safeFormEntries,setStatus};
})();
