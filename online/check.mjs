import assert from 'node:assert/strict';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
if(!fs.existsSync('dist/server/index.js'))throw Error('Run npm run build first.');
const {default:worker}=await import('../dist/server/index.js?test='+Date.now());
class FakeDB{vaults=new Map();usage=new Map();prepare(sql){let args=[];const db=this;return {bind(...values){args=values;return this;},async first(){if(sql.startsWith('SELECT 1'))return {ready:1};if(sql.startsWith('SELECT document'))return db.vaults.get(args[0])||null;if(sql.startsWith('INSERT INTO aura_vaults')){if(db.vaults.has(args[0]))return null;db.vaults.set(args[0],{document:args[1],revision:1});return {revision:1};}if(sql.startsWith('UPDATE aura_vaults')){const row=db.vaults.get(args[2]);if(!row||row.revision!==args[3])return null;row.document=args[0];row.revision++;return {revision:row.revision};}if(sql.startsWith('INSERT INTO aura_usage')){const previous=db.usage.get(args[0]),requests=previous?.window===args[1]?previous.requests+1:1;db.usage.set(args[0],{window:args[1],requests});return {requests};}throw Error('Unexpected test query');}};}}
const env={DB:new FakeDB(),GEMINI_API_KEY:'synthetic-test-key',AURA_SESSION_SECRET:'synthetic-private-session-secret'};
const origin='https://aura.example',req=(path,user,token,body,requestOrigin=origin)=>new Request(origin+path,{method:body?'POST':'GET',headers:{...(user?{'oai-authenticated-user-id':user}:{}),...(token?{'X-Aura-Token':token}:{}),...(body?{'Content-Type':'application/json','Origin':requestOrigin}:{} )},...(body?{body:JSON.stringify(body)}:{})});
assert.equal((await worker.fetch(req('/api/config'),env)).status,401);
const configA=await (await worker.fetch(req('/api/config','user-a'),env)).json(),configB=await (await worker.fetch(req('/api/config','user-b'),env)).json();
assert.equal(configA.storage,'cloud');assert.notEqual(configA.token,configB.token);
const record={version:1,kdf:'PBKDF2-SHA256',iterations:600000,salt:btoa('s'.repeat(16)),iv:btoa('i'.repeat(12)),data:btoa('synthetic-ciphertext-fixture-12345')};
const saved=await worker.fetch(req('/api/vault','user-a',configA.token,{expectedRevision:0,vault:record}),env);assert.equal(saved.status,200);
const own=await (await worker.fetch(req('/api/vault','user-a',configA.token),env)).json();assert.equal(own.vault.revision,1);
assert.equal((await (await worker.fetch(req('/api/vault','user-b',configB.token),env)).json()).exists,false,'Vaults must be isolated per identity');
assert.equal((await worker.fetch(req('/api/vault','user-b',configA.token),env)).status,403,'Cross-user token rejected');
assert.equal((await worker.fetch(req('/api/vault','user-a',configA.token,{expectedRevision:0,vault:record}),env)).status,409,'Stale revision rejected');
assert.equal((await worker.fetch(req('/api/vault','user-a',configA.token,{expectedRevision:1,vault:record},'https://untrusted.example'),env)).status,403);
assert.equal((await worker.fetch(req('/api/vault','user-a',configA.token,{expectedRevision:1,vault:{journal:'plaintext'}}),env)).status,400);
assert.equal((await worker.fetch(req('/','user-a'),env)).status,200);assert.equal((await worker.fetch(req('/server.py','user-a'),env)).status,404);
const originalFetch=globalThis.fetch;let sent;
globalThis.fetch=async(_url,options)=>{sent=JSON.parse(options.body);return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({reply:'A short synthetic reply.',memoryIds:['journal:one','invented']})}]},finishReason:'STOP'}]}),{headers:{'Content-Type':'application/json'}});};
try{const response=await worker.fetch(req('/api/chat','user-a',configA.token,{messages:[{role:'user',text:'Synthetic test'}],journal:[{id:'journal:one',title:'Test',date:'2026-11-17',text:'Synthetic entry'}],weekly:[{id:'weekly:one',week:'2026-11-16',answers:{avoidance:2}}]}),env);assert.equal(response.status,200);const data=await response.json();assert.deepEqual(data.memoryIds,['journal:one']);assert.equal(data.text,'A short synthetic reply.');assert.match(sent.contents.at(-1).parts[0].text,/3–4 days/);for(let i=0;i<20;i++)await worker.fetch(req('/api/chat','user-a',configA.token,{messages:[{role:'user',text:'Synthetic rate-limit test'}]}),env);assert.equal((await worker.fetch(req('/api/chat','user-a',configA.token,{messages:[{role:'user',text:'Over limit'}]}),env)).status,429);}finally{globalThis.fetch=originalFetch;}
console.log('PASS: hosted identity isolation, per-user CSRF, encrypted-only vaults, atomic conflicts, assets, chat memory filtering and rate limits.');
