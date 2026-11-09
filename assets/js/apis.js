/* Atlys — integrações de CEP e CNPJ para checkout. */
(function(){
  'use strict';
  const S=window.AtlysSecurity;if(!S)return;
  document.addEventListener('DOMContentLoaded',()=>{
    const form=document.getElementById('checkoutForm');if(!form)return;
    S.setupForm(form);
    const cnpj=document.getElementById('c-cnpj');
    const company=document.getElementById('c-emp');
    const cep=document.getElementById('c-cep');
    const city=document.getElementById('c-cid');
    const uf=document.getElementById('c-uf');
    const address=document.getElementById('c-end');
    const cnpjStatus=document.getElementById('cnpjStatus');
    const cepStatus=document.getElementById('cepStatus');
    const phone=document.getElementById('c-wa');

    phone?.addEventListener('input',()=>{phone.value=S.formatPhone(phone.value)});
    cep?.addEventListener('input',()=>{cep.value=S.formatCEP(cep.value)});
    cnpj?.addEventListener('input',()=>{
      const raw=S.cleanCNPJ(cnpj.value);
      if(!/[A-Z]/.test(raw))cnpj.value=S.formatNumericCNPJ(cnpj.value);
      else cnpj.value=raw.slice(0,14);
    });

    cnpj?.addEventListener('blur',async()=>{
      const value=S.cleanCNPJ(cnpj.value);if(!value)return;
      if(!S.validateCNPJShape(value)){S.setStatus(cnpjStatus,'CNPJ inválido. Confira os 14 caracteres.','error');cnpj.setAttribute('aria-invalid','true');return}
      S.setStatus(cnpjStatus,'Consultando dados cadastrais…','loading');
      try{
        const data=await S.api.cnpj(value);
        cnpj.removeAttribute('aria-invalid');
        const legal=data.razao_social||data.nome_fantasia||'';
        if(company&&!company.value&&legal)company.value=legal;
        if(cep&&!cep.value&&data.cep)cep.value=S.formatCEP(data.cep);
        if(city&&!city.value&&data.municipio)city.value=data.municipio;
        if(uf&&data.uf)uf.value=data.uf;
        if(address&&!address.value&&data.logradouro)address.value=[data.descricao_tipo_de_logradouro,data.logradouro,data.numero].filter(Boolean).join(' ');
        S.setStatus(cnpjStatus,legal?`Empresa encontrada: ${legal}`:'CNPJ encontrado na base pública.','success');
      }catch(err){S.setStatus(cnpjStatus,'Não foi possível validar o CNPJ agora. Você pode continuar preenchendo manualmente.','warning')}
    });

    cep?.addEventListener('blur',async()=>{
      const digits=S.onlyDigits(cep.value);if(!digits)return;
      if(digits.length!==8){S.setStatus(cepStatus,'CEP deve ter 8 dígitos.','error');cep.setAttribute('aria-invalid','true');return}
      S.setStatus(cepStatus,'Consultando endereço…','loading');
      try{
        const data=await S.api.cep(digits);cep.removeAttribute('aria-invalid');
        if(city)data.localidade&&(city.value=data.localidade);
        if(uf)data.uf&&(uf.value=data.uf);
        if(address&&!address.value)address.value=[data.logradouro,data.bairro].filter(Boolean).join(' — ');
        S.setStatus(cepStatus,'Endereço localizado. Confira os dados antes de enviar.','success');
      }catch(err){S.setStatus(cepStatus,'CEP não localizado. Preencha o endereço manualmente.','warning')}
    });
  });
})();
