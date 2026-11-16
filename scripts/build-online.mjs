import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),assets={};
for(const name of fs.readdirSync(path.join(root,'dist'))){
  const file=path.join(root,'dist',name);
  if(fs.statSync(file).isFile()&&/\.(?:html|css|js)$/.test(name))assets['/'+name]=fs.readFileSync(file,'utf8');
}
if(!assets['/index.html'])throw Error('Missing Aura frontend.');
const python=fs.readFileSync('server.py','utf8'),system=python.match(/SYSTEM = '''([\s\S]*?)'''/);
if(!system)throw Error('Missing shared conversational instructions.');
const worker=fs.readFileSync('online/worker.mjs','utf8');
fs.mkdirSync('dist/server',{recursive:true});
fs.writeFileSync('dist/server/index.js','// Generated. Edit online/worker.mjs or frontend sources.\nconst STATIC_ASSETS='+JSON.stringify(assets)+';\nconst SYSTEM='+JSON.stringify(system[1])+';\n'+worker);
if(fs.existsSync('.openai/hosting.json')){
  const hosting=JSON.parse(fs.readFileSync('.openai/hosting.json','utf8').replace(/^\uFEFF/,''));
  if(hosting.static)throw Error('Online Aura requires a Worker manifest without static configuration.');
  fs.mkdirSync('dist/.openai',{recursive:true});fs.writeFileSync('dist/.openai/hosting.json',JSON.stringify(hosting,null,2)+'\n');
}
console.log('Built Aura Worker with '+Object.keys(assets).length+' frontend assets.');
