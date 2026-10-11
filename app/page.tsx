'use client';
import { useEffect, useMemo, useState } from 'react';
import { S, Sim, D, KEY, CATS, seed, sum, inr, pc, num, calc, apply, SHOCKS, PRE, TABS, isValidState, sanitizeText, sanitizeAmount } from '../lib/finance';
import ImpactRow from '../components/ImpactRow';
import ForecastChart from '../components/ForecastChart';
import HealthRing from '../components/HealthRing';

export default function Page(){
 const [s,setS]=useState<S>(seed),[ok,setOk]=useState(false),[tab,setTab]=useState('home'),[toast,setToast]=useState('');
 const [sim,setSim]=useState<Sim>({kind:'spend',amt:1500,ref:1,cat:'Shopping'});
 const [f,setF]=useState({a:'',b:'',c:'Food'});
 useEffect(()=>{try{const v=localStorage.getItem(KEY);if(v){const parsed:unknown=JSON.parse(v);if(isValidState(parsed))setS(parsed)}}catch(e){}setOk(true)},[]);
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
 const add=(k:string)=>{const a=sanitizeAmount(+f.b);if(!a||a<=0)return say('Enter a valid amount');const n=sanitizeText(f.a)||k,id=Date.now();
  if(k==='tx')up({txs:[...s.txs,{id,day:s.day,amt:a,cat:f.c,label:n}]});
  if(k==='sub')up({subs:[...s.subs,{id,name:n,amt:a,on:true}]});
  if(k==='com')up({coms:[...s.coms,{id,name:n,amt:a,paid:false}]});
  if(k==='goal')up({goals:[...s.goals,{id,name:n,target:a,saved:0}]});
  setF({...f,a:'',b:''});say('Added ✔')};
 const shock=()=>{const [n,a]=SHOCKS[Math.floor(Math.random()*SHOCKS.length)];up({txs:[...s.txs,{id:Date.now(),day:s.day,amt:a,cat:'Unexpected',label:n}]});say(`💥 Unexpected: ${n} ${inr(a)}`)};
 const form=(k:string[])=><div className="row"><input aria-label="Name" maxLength={40} placeholder="Name" value={f.a} onChange={e=>setF({...f,a:e.target.value})} style={{flex:1}}/>
  <input aria-label="Amount" placeholder="₹" type="number" value={f.b} onChange={e=>setF({...f,b:e.target.value})} style={{width:90}}/>
  {k.includes('tx')&&<select aria-label="Category" value={f.c} onChange={e=>setF({...f,c:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>}</div>;
 return <main id="main-content" tabIndex={-1}>
 {toast&&<div className="toast" role="status">{toast}</div>}
 <header className="row sp"><div><h1><span className="logo" aria-hidden="true">₹</span>SpendWise <span className="g">Z</span></h1><div className="m">₹{s.income.toLocaleString('en-IN')} budget · Day {s.day}/{D} · {now.left} days left</div></div>
  <div className="row"><button onClick={()=>s.day<D&&up({day:s.day+1})}>Next day ▶</button><button onClick={shock}>💥 Surprise</button><button onClick={()=>{setS(seed);say('Reset to start')}}>Reset</button></div></header>
 <nav className="tabs" role="tablist" aria-label="Sections" onKeyDown={e=>{const i=TABS.findIndex(t=>t[0]===tab);if(e.key==='ArrowRight')setTab(TABS[(i+1)%TABS.length][0]);if(e.key==='ArrowLeft')setTab(TABS[(i+TABS.length-1)%TABS.length][0])}}>{TABS.map(([k,l])=><button key={k} id={'tab-'+k} role="tab" aria-controls="panel" tabIndex={tab===k?0:-1} aria-selected={tab===k} className={tab===k?'pri':''} onClick={()=>setTab(k)}>{l}</button>)}</nav>
 <div id="panel" role="tabpanel" aria-labelledby={'tab-'+tab}>{tab==='home'&&<>
  <section className="hero card" aria-label="Safe to spend today"><div><div className="m">Safe to spend today</div><div className="hero-num">{inr(Math.max(0,now.allowance))}</div><div className="m">{now.left} days left · {now.end>=0?'on track to finish with '+inr(now.end):'projected shortfall of '+inr(-now.end)}</div></div><HealthRing v={now.health}/></section>
  <div className="grid">
   <div className="card"><div className="m">Balance</div><div className="big">{inr(now.balance)}</div><div className="m">after spend, bills & savings</div></div>
   <div className="card"><div className="m">Free to spend</div><div className={'big '+(now.free<0?'r':'g')}>{inr(now.free)}</div><div className="m">after {inr(now.reserved)} reserved</div></div>
   <div className="card"><div className="m">Daily allowance</div><div className={'big '+(now.allowance<now.avg?'y':'g')}>{inr(now.allowance)}</div><div className="m">you spend ~{inr(now.avg)}/day</div></div>
   <div className="card row"><HealthRing v={now.health}/><div><div className="m">Financial health</div><div className={'big '+rc(100-now.health)}>{now.health>66?'Great':now.health>40?'Okay':'Weak'}</div></div></div>
   <div className="card"><div className="m">Financial risk</div><div className={'big '+rc(now.risk)}>{now.risk}%</div><div className="bar"><i style={{width:now.risk+'%',background:'var(--r)'}}/></div></div>
   <div className="card"><div className="m">Day-30 forecast</div><div className={'big '+(now.end<0?'r':'g')}>{inr(now.end)}</div><div className="m">at current pace</div></div>
  </div>
  <div className="two"><div className="card"><h2>💡 Insights</h2>{ins.map((t,i)=><p key={i} className="ins">{t}</p>)}</div>
   <div className="card"><h2>Where it went</h2>{byCat.map(([k,v])=><div key={k} style={{marginBottom:8}}><div className="row sp"><span>{k}</span><span className="m">{inr(v)}</span></div><div className="bar"><i style={{width:v/mx*100+'%'}}/></div></div>)}</div></div>
  <div className="card"><h2>🗓 30-day spending timeline</h2><div className="timeline" role="img" aria-label="Daily spending across the 30-day budget period">{Array.from({length:D},(_,i)=>{const day=i+1,spentToday=sum(s.txs.filter(t=>t.day===day).map(t=>t.amt));return <div key={day} className={'tl'+(day===s.day?' now':'')+(spentToday>Math.max(0,now.allowance)?' over':'')} title={`Day ${day}: ${inr(spentToday)}`}><i style={{height:Math.min(100,spentToday/8)+'%'}}/><span>{day}</span></div>})}</div><div className="m">Bars above your daily allowance turn red. Today is highlighted.</div></div>
  <div className="card"><h2>📈 Cash forecast to day 30</h2><ForecastChart a={now} sa={s}/><div className="m">Red dashed line = out of money. Run-out day: <b>{now.end>=0?'none 🎉':'Day '+now.runout}</b></div></div>
 </>}
 {tab==='sim'&&<div className="two">
  <div className="card sim"><h2>🔮 Decision simulator</h2>
   <div className="row">{PRE.map(p=><button key={p.l} onClick={()=>setSim({kind:p.k,amt:p.a||sim.amt,ref:p.k==='cancel'?3:sim.ref,cat:p.c})}>{p.l}</button>)}</div>
   <div className="row"><select aria-label="Decision type" value={sim.kind} onChange={e=>setSim({...sim,kind:e.target.value})}><option value="spend">Spend on…</option><option value="save">Save to goal</option><option value="income">Extra income</option><option value="unexp">Unexpected hit</option><option value="cancel">Cancel subscription</option></select>
   {sim.kind!=='cancel'&&<input aria-label="Amount" type="number" value={sim.amt} onChange={e=>setSim({...sim,amt:sanitizeAmount(+e.target.value)})} style={{width:100}}/>}
   {sim.kind==='spend'&&<select aria-label="Category" value={sim.cat} onChange={e=>setSim({...sim,cat:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>}
   {sim.kind==='save'&&<select aria-label="Goal" value={sim.ref} onChange={e=>setSim({...sim,ref:+e.target.value})}>{s.goals.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>}
   {sim.kind==='cancel'&&<select aria-label="Subscription" value={sim.ref} onChange={e=>setSim({...sim,ref:+e.target.value})}>{s.subs.filter(x=>x.on).map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>}</div>
   {sim.kind!=='cancel'&&<input aria-label="Amount slider" type="range" min={0} max={5000} step={50} value={sim.amt} onChange={e=>setSim({...sim,amt:+e.target.value})} style={{width:'100%'}}/>}
   <ImpactRow l="Balance" a={now.balance} b={af.balance} up/><ImpactRow l="Free to spend" a={now.free} b={af.free} up/><ImpactRow l="Daily allowance" a={now.allowance} b={af.allowance} up/>
   <ImpactRow l="Day-30 forecast" a={now.end} b={af.end} up/><ImpactRow l="Risk" a={now.risk} b={af.risk} up={false} f={pc}/><ImpactRow l="Health" a={now.health} b={af.health} up f={num}/><ImpactRow l="Goals funded" a={now.goalPct} b={af.goalPct} up f={pc}/>
   <p style={{margin:'10px 0'}}>{verdict}</p>
   <div className="row"><button className="pri" onClick={()=>{setS(ns);say('Decision committed ✔')}}>Commit decision</button><button onClick={()=>setSim({...sim,amt:0})}>Discard</button></div></div>
  <div className="card"><h2>📈 Now vs if you commit</h2><ForecastChart a={now} sa={s} b={af} sb={ns}/><div className="m"><span className="g">━</span> now · <span style={{color:'#a78bfa'}}>╍</span> if you commit · <span className="r">╍</span> zero</div></div>
 </div>}
 {tab==='plan'&&<><div className="two">
  <div className="card"><h2>Income & quick add</h2><div className="row"><label className="m" htmlFor="inc">Monthly income ₹</label><input id="inc" type="number" value={s.income} onChange={e=>up({income:sanitizeAmount(+e.target.value)})} style={{width:110}}/></div>
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
 </div><footer className="m" style={{textAlign:'center',margin:'18px 0'}}>Your data stays in this browser. Every decision updates balance, allowance, forecast, risk and health together.</footer></main>}
