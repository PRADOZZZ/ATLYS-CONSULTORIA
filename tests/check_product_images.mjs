import fs from 'node:fs';
const text=fs.readFileSync(new URL('../assets/js/products.js', import.meta.url),'utf8');
const matches=[...text.matchAll(/\{id:"([^"]+)"[\s\S]*?img:"([^"]+)"[\s\S]*?img2:"([^"]+)"[\s\S]*?fallbackImg:"([^"]+)"[\s\S]*?fallbackImg2:"([^"]+)"\}/g)];
if(matches.length!==22){console.error(`Esperados 22 produtos; encontrados ${matches.length}`);process.exit(1)}
const problems=[];
for(const m of matches){
  const [_,id,img,img2,f1,f2]=m;
  if(!/^https:\/\//.test(img)) problems.push(`${id}: imagem principal remota válida ausente`);
  if(img2 && !/^https:\/\//.test(img2)) problems.push(`${id}: segunda vista inválida`);
  if(img2 && img===img2) problems.push(`${id}: vistas duplicadas`);
  if(!/^https:\/\//.test(f1)||!/^https:\/\//.test(f2)) problems.push(`${id}: fallback remoto ausente`);
}
if(problems.length){console.error(problems.join('\n'));process.exit(1)}
if(!fs.existsSync(new URL('../assets/img/phones/unavailable.svg', import.meta.url))){console.error('fallback local ausente');process.exit(1)}
console.log('22/22 produtos com imagem principal real, segunda vista distinta cadastrada e fallback local de segurança.');
