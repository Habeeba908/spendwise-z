'use client';
import { useEffect, useMemo, useState } from 'react';
type Tx={id:number;day:number;amt:number;cat:string;label:string};
type S={income:number;day:number;txs:Tx[];subs:{id:number;name:string;amt:number;on:boolean}[];coms:{id:number;name:string;amt:number;paid:boolean}[];goals:{id:number;name:string;target:number;saved:number}[]};
type Sim={kind:string;amt:number;ref:number;cat:string};
const D=30,KEY='spendwise-z-v2',CATS=['Food','Transport','Fun','Shopping','Study','Other'];
const seed:S={income:10000,day:8,
 txs:[{id:1,day:2,amt:320,cat:'Food',label:'Canteen + chai'},{id:2,day:4,amt:400,cat:'Transport',label:'Metro pass'},{id:3,day:6,amt:250,cat:'Fun',label:'Movie'},{id:4,day:7,amt:230,cat:'Shopping',label:'Earphones case'}],
 subs:[{id:1,name:'Netflix',amt:199,on:true},{id:2,name:'Spotify',amt:119,on:true},{id:3,name:'Gym',amt:499,on:true},{id:4,name:'Cloud storage',amt:75,on:true}],
 coms:[{id:1,name:'Phone recharge',amt:299,paid:true},{id:2,name:'Rent share',amt:2500,paid:false}],
 goals:[{id:1,name:'Emergency fund',target:3000,saved:600},{id:2,name:'Sneakers',target:4000,saved:800}]};
const sum=(a:number[])=>a.reduce((x,y)=>x+y,0),cl=(n:number)=>Math.max(0,Math.min(100,n));
const inr=(n:number)=>(n<0?'-':'')+'₹'+Math.abs(Math.round(n)).toLocaleString('en-IN');
const pc=(n:number)=>Math.round(n)+'%',num=(n:number)=>Math.round(n)+'';
function calc(s:S){
 const spent=sum(s.txs.map(t=>t.amt)),paid=sum(s.coms.filter(c=>c.paid).map(c=>c.amt)),saved=sum(s.goals.map(g=>g.saved));
 const subs=sum(s.subs.filter(x=>x.on).map(x=>x.amt)),due=sum(s.coms.filter(c=>!c.paid).map(c=>c.amt));
 const balance=s.income-spent-paid-saved,reserved=subs+due,free=balance-reserved,left=D-s.day;
 const avg=spent/Math.max(s.day,1),allowance=left>0?free/left:free,end=free-avg*left;
 const risk=Math.round(100/(1+Math.exp(end/2500)));
 const goalPct=saved/Math.max(1,sum(s.goals.map(g=>g.target)))*100;
 const fixedPct=(subs+sum(s.coms.map(c=>c.amt)))/Math.max(1,s.income)*100;
 const runout=free<=0?s.day:avg>0?Math.min(D,Math.floor(s.day+free/avg)):D;
 const health=cl(Math.round(100-risk*0.6-Math.max(0,fixedPct-40)*0.4+goalPct*0.15));
 return {spent,balance,reserved,free,left,avg,allowance,end,risk,health,goalPct,fixedPct,runout,subs};
}
function apply(s:S,m:Sim):S{
 if(m.kind==='save')return {...s,goals:s.goals.map(g=>g.id===m.ref?{...g,saved:Math.min(g.target,g.saved+m.amt)}:g)};
 if(m.kind==='income')return {...s,income:s.income+m.amt};
 if(m.kind==='cancel')return {...s,subs:s.subs.map(x=>x.id===m.ref?{...x,on:false}:x)};
 return {...s,txs:[...s.txs,{id:Date.now(),day:s.day,amt:m.amt,cat:m.kind==='unexp'?'Unexpected':m.cat,label:m.kind==='unexp'?'Surprise expense':'Planned spend'}]};
}
const SHOCKS:[string,number][]=[['Phone screen repair',1800],['Doctor visit',650],['Friend’s birthday gift',500],['Laptop charger',900]];
const PRE=[{l:'🍕 Takeaway week',k:'spend',a:900,c:'Food'},{l:'👟 New sneakers',k:'spend',a:3500,c:'Shopping'},{l:'🎉 Weekend trip',k:'spend',a:1800,c:'Fun'},{l:'💼 Freelance +₹1500',k:'income',a:1500,c:'Other'},{l:'✂️ Cancel Gym',k:'cancel',a:0,c:'Other'}];
const TABS=[['home','🏠 Overview'],['sim','🔮 Simulator'],['plan','🧩 Plan'],['log','🧾 Ledger']];
function Row({l,a,b,up,f=inr}:{l:string;a:number;b:number;up:boolean;f?:(n:number)=>string}){const d=b-a,g=up?d>=0:d<=0;
 return <div className="row sp"><span className="m">{l}</span><span>{f(a)} → <b>{f(b)}</b> <span className={Math.abs(d)<.5?'m':g?'g':'r'}>({d>0?'+':''}{f(d)})</span></span></div>}
function Chart({a,sa,b,sb}:{a:any;sa:S;b?:any;sb?:S}){
 const pts=(c:any,x:S)=>Array.from({length:D-x.day+1},(_,i)=>c.free-c.avg*i);
 const A=pts(a,sa),B=b?pts(b,sb as S):[],all=[...A,...B,0],mn=Math.min(...all),mx=Math.max(...all),W=300,H=110;
 const X=(i:number)=>(i/Math.max(1,A.length-1))*W,Y=(v:number)=>H-((v-mn)/Math.max(1,mx-mn))*H;
 const P=(r:number[])=>r.map((v,i)=>`${X(i)},${Y(v)}`).join(' ');
 return <svg viewBox={`0 0 ${W} ${H+4}`} width="100%" role="img" aria-label="Forecast chart"><line x1="0" x2={W} y1={Y(0)} y2={Y(0)} stroke="#fb7185" strokeDasharray="4"/>
 <polyline points={P(A)} fill="none" stroke="#34d399" strokeWidth="2.5"/>{b&&<polyline points={P(B)} fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="5"/>}</svg>}
function Ring({v}:{v:number}){const c=v>66?'#34d399':v>40?'#fbbf24':'#fb7185';
 return <svg width="84" height="84" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="#1d2233" strokeWidth="4"/>
 <circle cx="18" cy="18" r="15" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${v*0.942} 100`} transform="rotate(-90 18 18)" style={{transition:'.6s'}}/>
 <text x="18" y="21" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">{v}</text></svg>}
export default function Page(){
 const [s,setS]=useState<S>(seed),[ok,setOk]=useState(false),[tab,setTab]=useState('home'),[toast,setToast]=useState('');
 const [sim,setSim]=useState<Sim>({kind:'spend',amt:1500,ref:1,cat:'Shopping'});
 const [f,setF]=useState({a:'',b:'',c:'Food'});
 useEffect(()=>{try{const v=localStorage.getItem(KEY);if(v)setS(JSON.parse(v))}catch(e){}setOk(true)},[]);
 useEffect(()=>{if(ok)try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}},[s,ok]);
 const now=useMemo(()=>calc(s),[s]);
 const ns=useMemo(()=>apply(s,sim),[s,sim]);const af=useMemo(()=>calc(ns),[ns]);
 const say=(t:string)=>{setToast(t);setTimeout(()=>setToast(''),3500)};
 const up=(p:Partial<S>)=>setS({...s,...p});
 const rc=(r:number)=>r>66?'r':r>40?'y':'g';
 const byCat=[...CATS,'Unexpected'].map(k=>[k,sum(s.txs.filter(t=>t.cat===k).map(t=>t.amt))] as [string,number]).filter(x=>x[1]>0);
 const mx=Math.max(1,...byCat.map(x=>x[1]));
 const big=[...s.subs.filter(x=>x.on)].sort((a,b)=>b.amt-a.amt)[0];
 const ins:string[]=[];
 ins.push(now.end<0?`🚨 At ~${inr(now.avg)}/day you run out of money on day ${now.runout}. Cut ${inr(-now.end/Math.max(1,now.left))}/day to survive.`:`✅ On track: you finish day 30 with about ${inr(now.end)} spare.`);
 if(now.allowance<now.avg)ins.push(`⚠️ Your safe daily allowance is ${inr(now.allowance)} but you spend ${inr(now.avg)}/day.`);
 if(now.fixedPct>40)ins.push(`📺 Fixed costs (bills + subscriptions) take ${pc(now.fixedPct)} of your income.`);
 if(big)ins.push(`✂️ Cancelling ${big.name} would free ${inr(big.amt)} this month.`);
 if(byCat[0])ins.push(`📊 Biggest category: ${[...byCat].sort((a,b)=>b[1]-a[1])[0][0]}.`);
 ins.push(`🎯 Goals are ${pc(now.goalPct)} funded.`);
 const verdict=af.end<0?`⚠️ Red zone: you'd run out ~${inr(-af.end)} short before day 30.`:af.risk>now.risk+10?'😬 Risky: your risk jumps noticeably.':af.risk<=now.risk?'✅ Safe move: no added risk.':'👍 Affordable, but your cushion shrinks.';
 const add=(k:string)=>{const a=+f.b;if(!a||a<=0)return say('Enter a valid amount');const n=f.a||k,id=Date.now();
  if(k==='tx')up({txs:[...s.txs,{id,day:s.day,amt:a,cat:f.c,label:n}]});
  if(k==='sub')up({subs:[...s.subs,{id,name:n,amt:a,on:true}]});
  if(k==='com')up({coms:[...s.coms,{id,name:n,amt:a,paid:false}]});
  if(k==='goal')up({goals:[...s.goals,{id,name:n,target:a,saved:0}]});
  setF({...f,a:'',b:''});say('Added ✔')};
 const shock=()=>{const [n,a]=SHOCKS[Math.floor(Math.random()*SHOCKS.length)];up({txs:[...s.txs,{id:Date.now(),day:s.day,amt:a,cat:'Unexpected',label:n}]});say(`💥 Unexpected: ${n} ${inr(a)}`)};
 const form=(k:string[])=><div className="row"><input aria-label="Name" placeholder="Name" value={f.a} onChange={e=>setF({...f,a:e.target.value})} style={{flex:1}}/>
  <input aria-label="Amount" placeholder="₹" type="number" value={f.b} onChange={e=>setF({...f,b:e.target.value})} style={{width:90}}/>
  {k.includes('tx')&&<select aria-label="Category" value={f.c} onChange={e=>setF({...f,c:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>}</div>;
 return <main><style>{css}</style>
 {toast&&<div className="toast" role="status">{toast}</div>}
 <header className="row sp"><div><h1>SpendWise <span className="g">Z</span></h1><div className="m">₹{s.income.toLocaleString('en-IN')} budget · Day {s.day}/{D} · {now.left} days left</div></div>
  <div className="row"><button onClick={()=>s.day<D&&up({day:s.day+1})}>Next day ▶</button><button onClick={shock}>💥 Surprise</button><button onClick={()=>{setS(seed);say('Reset to start')}}>Reset</button></div></header>
 <nav className="tabs" role="tablist">{TABS.map(([k,l])=><button key={k} role="tab" aria-selected={tab===k} className={tab===k?'pri':''} onClick={()=>setTab(k)}>{l}</button>)}</nav>
 {tab==='home'&&<>
  <div className="grid">
   <div className="card"><div className="m">Balance</div><div className="big">{inr(now.balance)}</div><div className="m">after spend, bills & savings</div></div>
   <div className="card"><div className="m">Free to spend</div><div className={'big '+(now.free<0?'r':'g')}>{inr(now.free)}</div><div className="m">after {inr(now.reserved)} reserved</div></div>
   <div className="card"><div className="m">Daily allowance</div><div className={'big '+(now.allowance<now.avg?'y':'g')}>{inr(now.allowance)}</div><div className="m">you spend ~{inr(now.avg)}/day</div></div>
   <div className="card row"><Ring v={now.health}/><div><div className="m">Financial health</div><div className={'big '+rc(100-now.health)}>{now.health>66?'Great':now.health>40?'Okay':'Weak'}</div></div></div>
   <div className="card"><div className="m">Financial risk</div><div className={'big '+rc(now.risk)}>{now.risk}%</div><div className="bar"><i style={{width:now.risk+'%',background:'var(--r)'}}/></div></div>
   <div className="card"><div className="m">Day-30 forecast</div><div className={'big '+(now.end<0?'r':'g')}>{inr(now.end)}</div><div className="m">at current pace</div></div>
  </div>
  <div className="two"><div className="card"><h2>💡 Insights</h2>{ins.map((t,i)=><p key={i} className="ins">{t}</p>)}</div>
   <div className="card"><h2>Where it went</h2>{byCat.map(([k,v])=><div key={k} style={{marginBottom:8}}><div className="row sp"><span>{k}</span><span className="m">{inr(v)}</span></div><div className="bar"><i style={{width:v/mx*100+'%'}}/></div></div>)}</div></div>
  <div className="card"><h2>📈 Cash forecast to day 30</h2><Chart a={now} sa={s}/><div className="m">Red dashed line = out of money. Run-out day: <b>{now.end>=0?'none 🎉':'Day '+now.runout}</b></div></div>
 </>}
 {tab==='sim'&&<div className="two">
  <div className="card sim"><h2>🔮 Decision simulator</h2>
   <div className="row">{PRE.map(p=><button key={p.l} onClick={()=>setSim({kind:p.k,amt:p.a||sim.amt,ref:p.k==='cancel'?3:sim.ref,cat:p.c})}>{p.l}</button>)}</div>
   <div className="row"><select aria-label="Decision type" value={sim.kind} onChange={e=>setSim({...sim,kind:e.target.value})}><option value="spend">Spend on…</option><option value="save">Save to goal</option><option value="income">Extra income</option><option value="unexp">Unexpected hit</option><option value="cancel">Cancel subscription</option></select>
   {sim.kind!=='cancel'&&<input aria-label="Amount" type="number" value={sim.amt} onChange={e=>setSim({...sim,amt:Math.max(0,+e.target.value)})} style={{width:100}}/>}
   {sim.kind==='spend'&&<select aria-label="Category" value={sim.cat} onChange={e=>setSim({...sim,cat:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>}
   {sim.kind==='save'&&<select aria-label="Goal" value={sim.ref} onChange={e=>setSim({...sim,ref:+e.target.value})}>{s.goals.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>}
   {sim.kind==='cancel'&&<select aria-label="Subscription" value={sim.ref} onChange={e=>setSim({...sim,ref:+e.target.value})}>{s.subs.filter(x=>x.on).map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>}</div>
   {sim.kind!=='cancel'&&<input aria-label="Amount slider" type="range" min={0} max={5000} step={50} value={sim.amt} onChange={e=>setSim({...sim,amt:+e.target.value})} style={{width:'100%'}}/>}
   <Row l="Balance" a={now.balance} b={af.balance} up/><Row l="Free to spend" a={now.free} b={af.free} up/><Row l="Daily allowance" a={now.allowance} b={af.allowance} up/>
   <Row l="Day-30 forecast" a={now.end} b={af.end} up/><Row l="Risk" a={now.risk} b={af.risk} up={false} f={pc}/><Row l="Health" a={now.health} b={af.health} up f={num}/><Row l="Goals funded" a={now.goalPct} b={af.goalPct} up f={pc}/>
   <p style={{margin:'10px 0'}}>{verdict}</p>
   <div className="row"><button className="pri" onClick={()=>{setS(ns);say('Decision committed ✔')}}>Commit decision</button><button onClick={()=>setSim({...sim,amt:0})}>Discard</button></div></div>
  <div className="card"><h2>📈 Now vs if you commit</h2><Chart a={now} sa={s} b={af} sb={ns}/><div className="m"><span className="g">━</span> now · <span style={{color:'#a78bfa'}}>╍</span> if you commit · <span className="r">╍</span> zero</div></div>
 </div>}
 {tab==='plan'&&<><div className="two">
  <div className="card"><h2>Income & quick add</h2><div className="row"><label className="m" htmlFor="inc">Monthly income ₹</label><input id="inc" type="number" value={s.income} onChange={e=>up({income:Math.max(0,+e.target.value)})} style={{width:110}}/></div>
   <div className="m" style={{marginBottom:10}}>Everything recalculates instantly.</div>{form([])}
   <div className="row"><button onClick={()=>add('sub')}>+ Subscription</button><button onClick={()=>add('com')}>+ Bill</button><button onClick={()=>add('goal')}>+ Goal (target)</button></div></div>
  <div className="card"><h2>Subscriptions · {inr(now.subs)}/mo</h2>{s.subs.map(x=><div className="row sp" key={x.id}><span>{x.name} <span className="m">{inr(x.amt)}</span></span><span className="row">
   <button aria-label={'Toggle '+x.name} className={'tog '+(x.on?'on':'')} onClick={()=>{up({subs:s.subs.map(y=>y.id===x.id?{...y,on:!y.on}:y)});say(x.on?`Cancelled ${x.name}: +${inr(x.amt)} free`:`Resumed ${x.name}`)}}/>
   <button aria-label="Delete" onClick={()=>up({subs:s.subs.filter(y=>y.id!==x.id)})}>✕</button></span></div>)}</div></div>
  <div className="two"><div className="card"><h2>Commitments & bills</h2>{s.coms.map(c=><div className="row sp" key={c.id}><span>{c.name} <span className="m">{inr(c.amt)}</span></span><span className="row">
   <button onClick={()=>up({coms:s.coms.map(y=>y.id===c.id?{...y,paid:!y.paid}:y)})}>{c.paid?'✅ Paid':'Mark paid'}</button><button aria-label="Delete" onClick={()=>up({coms:s.coms.filter(y=>y.id!==c.id)})}>✕</button></span></div>)}</div>
   <div className="card"><h2>🎯 Savings goals</h2>{s.goals.map(g=><div key={g.id} style={{marginBottom:12}}><div className="row sp"><span>{g.name}</span><span className="m">{inr(g.saved)} / {inr(g.target)}</span></div>
    <div className="bar"><i style={{width:g.saved/g.target*100+'%'}}/></div><div className="row sp"><span className="m">{g.saved>=g.target?'Goal reached 🎉':`Needs ${inr((g.target-g.saved)/Math.max(1,now.left))}/day to finish by day 30`}</span>
    <span className="row"><button onClick={()=>up({goals:s.goals.map(y=>y.id===g.id?{...y,saved:Math.min(y.target,y.saved+200)}:y)})}>+₹200</button><button aria-label="Delete" onClick={()=>up({goals:s.goals.filter(y=>y.id!==g.id)})}>✕</button></span></div></div>)}</div></div></>}
 {tab==='log'&&<div className="card"><h2>Log expense</h2>{form(['tx'])}<button className="pri" onClick={()=>add('tx')}>Add expense</button>
  <div className="tx" style={{marginTop:12}}>{[...s.txs].reverse().map(t=><div className="row sp" key={t.id}><span>D{t.day} · {t.label} <span className="m">{t.cat}</span></span><span className="row"><b className={t.cat==='Unexpected'?'r':''}>-{inr(t.amt)}</b><button aria-label="Delete" onClick={()=>up({txs:s.txs.filter(y=>y.id!==t.id)})}>✕</button></span></div>)}</div></div>}
 <footer className="m" style={{textAlign:'center',margin:'18px 0'}}>Your data stays in this browser. Every decision updates balance, allowance, forecast, risk and health together.</footer></main>}
const css=`:root{--bg:#0b0d14;--c:#151925;--c2:#1d2233;--t:#eef0f7;--m:#8d93aa;--g:#34d399;--r:#fb7185;--y:#fbbf24;--p:#8b5cf6}
*{box-sizing:border-box;margin:0}body{background:radial-gradient(900px 500px at 80% -10%,#2a1b5c55,transparent),var(--bg);color:var(--t);font-family:Inter,system-ui,sans-serif;padding:16px;max-width:1100px;margin:auto}
h1{font-size:24px}h2{font-size:13px;color:var(--m);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
.card{background:var(--c);border:1px solid #ffffff12;border-radius:18px;padding:16px;animation:in .4s both}@keyframes in{from{opacity:0;transform:translateY(8px)}}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin:12px 0;align-items:start}
.two{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));margin-bottom:12px;align-items:start}
.big{font-size:24px;font-weight:700}.m{color:var(--m);font-size:12px}.g{color:var(--g)}.r{color:var(--r)}.y{color:var(--y)}
input,select,button{background:var(--c2);color:var(--t);border:1px solid #ffffff1a;border-radius:10px;padding:9px 10px;font:inherit;font-size:14px;min-width:0}
button{cursor:pointer;transition:.15s}button:hover{background:#2a3150}button:active{transform:scale(.96)}
.pri{background:linear-gradient(135deg,var(--p),#6366f1);border:0;font-weight:600}.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0}.sp{justify-content:space-between}
.bar{height:8px;border-radius:9px;background:var(--c2);overflow:hidden}.bar>i{display:block;height:100%;background:linear-gradient(90deg,var(--p),var(--g));transition:width .5s}
.sim{border-color:#8b5cf666;box-shadow:0 0 40px #8b5cf622}.tog{width:42px;height:24px;border-radius:20px;padding:0;position:relative}.tog.on{background:var(--g)}
.tog:after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.2s}.tog.on:after{left:21px}
.toast{position:sticky;top:8px;z-index:9;background:#312e81;padding:10px 14px;border-radius:12px;margin-bottom:10px}
.tabs{display:flex;gap:6px;overflow-x:auto;margin:10px 0}.tabs button{white-space:nowrap}.ins{margin-bottom:8px;font-size:14px;line-height:1.4}.tx{max-height:340px;overflow:auto;font-size:13px}`;