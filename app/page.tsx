'use client';
import { useMemo, useState } from 'react';
type Tx={id:number;day:number;amt:number;cat:string;label:string};
type S={income:number;day:number;txs:Tx[];subs:{id:number;name:string;amt:number;on:boolean}[];coms:{id:number;name:string;amt:number;paid:boolean}[];goals:{id:number;name:string;target:number;saved:number}[]};
type Sim={kind:string;amt:number;goal:number;cat:string};
const D=30,CATS=['Food','Transport','Fun','Shopping','Study','Other'];
const seed:S={income:10000,day:8,
 txs:[{id:1,day:2,amt:320,cat:'Food',label:'Canteen + chai'},{id:2,day:4,amt:400,cat:'Transport',label:'Metro pass'},{id:3,day:6,amt:250,cat:'Fun',label:'Movie'},{id:4,day:7,amt:230,cat:'Shopping',label:'Earphones case'}],
 subs:[{id:1,name:'Netflix',amt:199,on:true},{id:2,name:'Spotify',amt:119,on:true},{id:3,name:'Gym',amt:499,on:true},{id:4,name:'Cloud storage',amt:75,on:true}],
 coms:[{id:1,name:'Phone recharge',amt:299,paid:true},{id:2,name:'Rent share',amt:2500,paid:false}],
 goals:[{id:1,name:'Emergency fund',target:3000,saved:600},{id:2,name:'Sneakers',target:4000,saved:800}]};
const sum=(a:number[])=>a.reduce((x,y)=>x+y,0),cl=(n:number)=>Math.max(0,Math.min(100,n));
const inr=(n:number)=>(n<0?'-':'')+'₹'+Math.abs(Math.round(n)).toLocaleString('en-IN');
function calc(s:S){
 const spent=sum(s.txs.map(t=>t.amt)),paid=sum(s.coms.filter(c=>c.paid).map(c=>c.amt)),saved=sum(s.goals.map(g=>g.saved));
 const balance=s.income-spent-paid-saved;
 const reserved=sum(s.coms.filter(c=>!c.paid).map(c=>c.amt))+sum(s.subs.filter(x=>x.on).map(x=>x.amt));
 const free=balance-reserved,left=D-s.day,avg=spent/Math.max(s.day,1);
 const allowance=left>0?free/left:free,end=free-avg*left;
 const risk=Math.round(100/(1+Math.exp(end/2500)));
 const goalPct=(saved/Math.max(1,sum(s.goals.map(g=>g.target))))*100;
 const health=cl(Math.round(100-risk*0.75+goalPct*0.15));
 return {spent,balance,reserved,free,left,avg,allowance,end,risk,health,goalPct};
}
function apply(s:S,m:Sim):S{
 if(m.kind==='save')return {...s,goals:s.goals.map(g=>g.id===m.goal?{...g,saved:Math.min(g.target,g.saved+m.amt)}:g)};
 return {...s,txs:[...s.txs,{id:Date.now(),day:s.day,amt:m.amt,cat:m.kind==='unexp'?'Unexpected':m.cat,label:m.kind==='unexp'?'Surprise expense':'Planned spend'}]};
}
const SHOCKS=[['Phone screen repair',1800],['Doctor visit',650],['Friend’s birthday gift',500],['Laptop charger',900]] as const;
function Chart({a,b,s,sa,sb}:{a:any;b:any;s:S;sa:any;sb:any}){
 const pts=(c:any,ss:S)=>Array.from({length:D-ss.day+1},(_,i)=>c.free-c.avg*i);
 const A=pts(a,s),B=b?pts(b,sa):[],all=[...A,...B,0],mn=Math.min(...all),mx=Math.max(...all),W=300,H=110;
 const X=(i:number)=>(i/Math.max(1,A.length-1))*W,Y=(v:number)=>H-((v-mn)/Math.max(1,mx-mn))*H;
 const P=(arr:number[])=>arr.map((v,i)=>`${X(i)},${Y(v)}`).join(' ');
 return <svg viewBox={`0 0 ${W} ${H+4}`} width="100%"><line x1="0" x2={W} y1={Y(0)} y2={Y(0)} stroke="#fb7185" strokeDasharray="4"/>
 <polyline points={P(A)} fill="none" stroke="#34d399" strokeWidth="2.5"/>{b&&<polyline points={P(B)} fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="5"/>}</svg>;
}
function Ring({v}:{v:number}){const c=v>66?'#34d399':v>40?'#fbbf24':'#fb7185';
 return <svg width="84" height="84" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="#1d2233" strokeWidth="4"/>
 <circle cx="18" cy="18" r="15" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${v*0.942} 100`} transform="rotate(-90 18 18)" style={{transition:'.6s'}}/>
 <text x="18" y="21" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">{v}</text></svg>}
export default function Page(){
 const [s,setS]=useState<S>(seed);const [toast,setToast]=useState('');
 const [sim,setSim]=useState<Sim>({kind:'spend',amt:1500,goal:1,cat:'Shopping'});
 const [f,setF]=useState({label:'',amt:'',cat:'Food'});
 const now=useMemo(()=>calc(s),[s]);
 const ns=useMemo(()=>apply(s,sim),[s,sim]);const after=useMemo(()=>calc(ns),[ns]);
 const say=(t:string)=>{setToast(t);setTimeout(()=>setToast(''),3500)};
 const rc=(r:number)=>r>66?'r':r>40?'y':'g';
 const D2=({l,a,b,up,fmt=inr}:{l:string;a:number;b:number;up:boolean;fmt?:(n:number)=>string})=>{const d=b-a,good=up?d>=0:d<=0;
  return <div className="row sp"><span className="m">{l}</span><span>{fmt(a)} → <b>{fmt(b)}</b> <span className={Math.abs(d)<.5?'m':good?'g':'r'}>({d>0?'+':''}{fmt(d)})</span></span></div>};
 const verdict=after.end<0?`⚠️ Red zone: you'd run out ~₹${Math.round(-after.end)} short before day 30.`:after.risk>now.risk+10?'😬 Risky — risk jumps noticeably.':after.risk<=now.risk?'✅ Safe move — no added risk.':'👍 Affordable, but your cushion shrinks.';
 const addTx=()=>{const a=+f.amt;if(!a||a<=0)return say('Enter a valid amount');setS({...s,txs:[...s.txs,{id:Date.now(),day:s.day,amt:a,cat:f.cat,label:f.label||f.cat}]});setF({...f,label:'',amt:''});};
 const shock=()=>{const [n,a]=SHOCKS[Math.floor(Math.random()*SHOCKS.length)];setS({...s,txs:[...s.txs,{id:Date.now(),day:s.day,amt:a,cat:'Unexpected',label:n}]});say(`💥 Unexpected: ${n} — ${inr(a)}`)};
 const cancelAll=sum(s.subs.filter(x=>x.on).map(x=>x.amt));
 return <main>
 {toast&&<div className="toast">{toast}</div>}
 <div className="row sp"><div><h1>SpendWise <span className="g">Z</span></h1><div className="m">₹{s.income.toLocaleString('en-IN')} · 30 days · Day {s.day}/{D}</div></div>
  <div className="row"><button onClick={()=>s.day<D&&setS({...s,day:s.day+1})}>Next day ▶</button><button onClick={shock}>💥 Surprise</button><button onClick={()=>{setS(seed);say('Reset')}}>Reset</button></div></div>
 <div className="grid">
  <div className="card"><div className="m">Balance</div><div className="big">{inr(now.balance)}</div><div className="m">after spend, bills & savings</div></div>
  <div className="card"><div className="m">Free to spend</div><div className={'big '+(now.free<0?'r':'g')}>{inr(now.free)}</div><div className="m">after {inr(now.reserved)} reserved</div></div>
  <div className="card"><div className="m">Daily allowance</div><div className={'big '+(now.allowance<now.avg?'y':'g')}>{inr(now.allowance)}</div><div className="m">you spend ~{inr(now.avg)}/day</div></div>
  <div className="card row"><Ring v={now.health}/><div><div className="m">Health</div><div className={'big '+rc(100-now.health)}>{now.health>66?'Great':now.health>40?'Okay':'Weak'}</div></div></div>
  <div className="card"><div className="m">Financial risk</div><div className={'big '+rc(now.risk)}>{now.risk}%</div><div className="bar"><i style={{width:now.risk+'%',background:'var(--r)'}}/></div></div>
  <div className="card"><div className="m">Day-30 forecast</div><div className={'big '+(now.end<0?'r':'g')}>{inr(now.end)}</div><div className="m">at current pace</div></div>
 </div>
 <div className="two">
  <div className="card sim"><h2>🔮 Decision simulator</h2>
   <div className="row"><select value={sim.kind} onChange={e=>setSim({...sim,kind:e.target.value})}><option value="spend">Spend on…</option><option value="save">Save to goal</option><option value="unexp">Unexpected hit</option></select>
   <input type="number" value={sim.amt} onChange={e=>setSim({...sim,amt:Math.max(0,+e.target.value)})} style={{width:100}}/>
   {sim.kind==='spend'&&<select value={sim.cat} onChange={e=>setSim({...sim,cat:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select>}
   {sim.kind==='save'&&<select value={sim.goal} onChange={e=>setSim({...sim,goal:+e.target.value})}>{s.goals.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select>}</div>
   <input type="range" min={0} max={5000} step={50} value={sim.amt} onChange={e=>setSim({...sim,amt:+e.target.value})} style={{width:'100%'}}/>
   <D2 l="Balance" a={now.balance} b={after.balance} up/><D2 l="Daily allowance" a={now.allowance} b={after.allowance} up/>
   <D2 l="Day-30 forecast" a={now.end} b={after.end} up/><D2 l="Risk" a={now.risk} b={after.risk} up={false} fmt={n=>Math.round(n)+'%'}/>
   <D2 l="Health" a={now.health} b={after.health} up fmt={n=>Math.round(n)+''}/><D2 l="Goals progress" a={now.goalPct} b={after.goalPct} up fmt={n=>Math.round(n)+'%'}/>
   <p style={{margin:'10px 0'}}>{verdict}</p>
   <div className="row"><button className="pri" onClick={()=>{setS(ns);say('Decision committed ✔')}}>Commit decision</button><button onClick={()=>setSim({...sim,amt:0})}>Discard</button></div></div>
  <div className="card"><h2>📈 Spendable cash forecast</h2><Chart a={now} b={after} s={s} sa={ns} sb={null}/>
   <div className="m"><span className="g">━</span> now &nbsp;<span style={{color:'#a78bfa'}}>╍</span> if you commit &nbsp;<span className="r">╍</span> zero line</div></div>
 </div>
 <div className="two">
  <div className="card"><h2>Subscriptions · {inr(cancelAll)}/mo</h2>{s.subs.map(x=><div className="row sp" key={x.id}><span>{x.name} <span className="m">{inr(x.amt)}</span></span>
   <button className={'tog '+(x.on?'on':'')} onClick={()=>{setS({...s,subs:s.subs.map(y=>y.id===x.id?{...y,on:!y.on}:y)});say(x.on?`Cancelled ${x.name}: +${inr(x.amt)} free`:`Resumed ${x.name}`)}}/></div>)}</div>
  <div className="card"><h2>Commitments</h2>{s.coms.map(c=><div className="row sp" key={c.id}><span>{c.name} <span className="m">{inr(c.amt)}</span></span>
   <button onClick={()=>setS({...s,coms:s.coms.map(y=>y.id===c.id?{...y,paid:!y.paid}:y)})}>{c.paid?'✅ Paid':'Mark paid'}</button></div>)}</div>
 </div>
 <div className="two">
  <div className="card"><h2>🎯 Savings goals</h2>{s.goals.map(g=><div key={g.id} style={{marginBottom:12}}><div className="row sp"><span>{g.name}</span><span className="m">{inr(g.saved)} / {inr(g.target)}</span></div>
   <div className="bar"><i style={{width:g.saved/g.target*100+'%'}}/></div>
   <div className="m">{g.saved>=g.target?'Goal reached 🎉':`Needs ${inr((g.target-g.saved)/Math.max(1,now.left))}/day to finish by day 30`}</div></div>)}</div>
  <div className="card"><h2>Log expense</h2><div className="row"><input placeholder="What for?" value={f.label} onChange={e=>setF({...f,label:e.target.value})} style={{flex:1}}/>
   <input placeholder="₹" type="number" value={f.amt} onChange={e=>setF({...f,amt:e.target.value})} style={{width:80}}/>
   <select value={f.cat} onChange={e=>setF({...f,cat:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select><button className="pri" onClick={addTx}>Add</button></div>
   <div className="tx">{[...s.txs].reverse().map(t=><div className="row sp" key={t.id}><span>D{t.day} · {t.label} <span className="m">{t.cat}</span></span><b className={t.cat==='Unexpected'?'r':''}>-{inr(t.amt)}</b></div>)}</div></div>
 </div></main>}