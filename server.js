const http=require("http"),fs=require("fs"),path=require("path");
const PORT=process.env.PORT||10000, URL=process.env.SUPABASE_URL, KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
async function db(t,opt={}){if(!URL||!KEY)throw Error("Variables Supabase manquantes");const r=await fetch(`${URL}/rest/v1/${t}`,{...opt,headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,"Content-Type":"application/json",Prefer:"return=representation"}});const x=await r.text();if(!r.ok)throw Error(x);return x?JSON.parse(x):[]}
const tables=["clients","vehicles","washes","cash","employees","services"];
const srv=http.createServer(async(req,res)=>{res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Headers","Content-Type");try{
if(req.method==="OPTIONS")return res.end();
if(req.url==="/api/data"){const o={};for(const t of tables)o[t]=await db(t+"?select=*&order=created_at.desc");res.setHeader("Content-Type","application/json");return res.end(JSON.stringify(o))}
if(req.method==="POST"&&req.url.startsWith("/api/")){const t=req.url.split("/")[2];if(!tables.includes(t))throw Error("Route inconnue");let b="";for await(const c of req)b+=c;const out=await db(t,{method:"POST",body:b});res.writeHead(201,{"Content-Type":"application/json"});return res.end(JSON.stringify(out))}
let p=req.url.split("?")[0];if(p==="/")p="/index.html";const f=path.join(__dirname,"public",p);if(fs.existsSync(f))return res.end(fs.readFileSync(f));res.writeHead(404);res.end("Not found")
}catch(e){res.writeHead(500,{"Content-Type":"application/json"});res.end(JSON.stringify({error:e.message}))}});
srv.listen(PORT,"0.0.0.0",()=>console.log("Answer Car Wash sur port "+PORT));