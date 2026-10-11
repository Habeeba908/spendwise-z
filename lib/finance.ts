/**
 * Core finance domain for SpendWise Z (₹10,000 budget over 30 days).
 * Pure functions only: no React, no side effects, fully unit-tested.
 * calc  -> income, balance, spending, commitments, subscriptions, savings goals,
 *          daily allowance, monthly forecast, financial risk and health.
 * apply -> simulates a decision (spend, save, income, unexpected, cancel).
 */
export type Tx={id:number;day:number;amt:number;cat:string;label:string};
export type S={income:number;day:number;txs:Tx[];subs:{id:number;name:string;amt:number;on:boolean}[];coms:{id:number;name:string;amt:number;paid:boolean}[];goals:{id:number;name:string;target:number;saved:number}[]};
export type Sim={kind:string;amt:number;ref:number;cat:string};
export const D=30,KEY='spendwise-z-v2',CATS=['Food','Transport','Fun','Shopping','Study','Other'];
export const seed:S={income:10000,day:8,
 txs:[{id:1,day:2,amt:320,cat:'Food',label:'Canteen + chai'},{id:2,day:4,amt:400,cat:'Transport',label:'Metro pass'},{id:3,day:6,amt:250,cat:'Fun',label:'Movie'},{id:4,day:7,amt:230,cat:'Shopping',label:'Earphones case'}],
 subs:[{id:1,name:'Netflix',amt:199,on:true},{id:2,name:'Spotify',amt:119,on:true},{id:3,name:'Gym',amt:499,on:true},{id:4,name:'Cloud storage',amt:75,on:true}],
 coms:[{id:1,name:'Phone recharge',amt:299,paid:true},{id:2,name:'Rent share',amt:2500,paid:false}],
 goals:[{id:1,name:'Emergency fund',target:3000,saved:600},{id:2,name:'Sneakers',target:4000,saved:800}]};
export const sum=(a:number[])=>a.reduce((x,y)=>x+y,0),cl=(n:number)=>Math.max(0,Math.min(100,n));
export const inr=(n:number)=>(n<0?'-':'')+'₹'+Math.abs(Math.round(n)).toLocaleString('en-IN');
export const pc=(n:number)=>Math.round(n)+'%',num=(n:number)=>Math.round(n)+'';
export function calc(s:S){
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
export function apply(s:S,m:Sim):S{
 if(m.kind==='save')return {...s,goals:s.goals.map(g=>g.id===m.ref?{...g,saved:Math.min(g.target,g.saved+m.amt)}:g)};
 if(m.kind==='income')return {...s,income:s.income+m.amt};
 if(m.kind==='cancel')return {...s,subs:s.subs.map(x=>x.id===m.ref?{...x,on:false}:x)};
 return {...s,txs:[...s.txs,{id:Date.now(),day:s.day,amt:m.amt,cat:m.kind==='unexp'?'Unexpected':m.cat,label:m.kind==='unexp'?'Surprise expense':'Planned spend'}]};
}
export const SHOCKS:[string,number][]=[['Phone screen repair',1800],['Doctor visit',650],['Friend’s birthday gift',500],['Laptop charger',900]];
export const PRE=[{l:'🍕 Takeaway week',k:'spend',a:900,c:'Food'},{l:'👟 New sneakers',k:'spend',a:3500,c:'Shopping'},{l:'🎉 Weekend trip',k:'spend',a:1800,c:'Fun'},{l:'💼 Freelance +₹1500',k:'income',a:1500,c:'Other'},{l:'✂️ Cancel Gym',k:'cancel',a:0,c:'Other'}];
export const TABS=[['home','🏠 Overview'],['sim','🔮 Simulator'],['plan','🧩 Plan'],['log','🧾 Ledger']];

export const calculateFinancialSummary = calc;
export const applyDecision = apply;

export type FinancialSummary = ReturnType<typeof calc>;
export const MAX_AMOUNT = 1_000_000;

/** Input sanitization: strips control characters and angle brackets, trims, limits length. */
export const sanitizeText = (value: string, max = 40): string =>
  value.replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, max);

/** Clamps any numeric input to a finite whole rupee amount between 0 and MAX_AMOUNT. */
export const sanitizeAmount = (value: number): number =>
  Number.isFinite(value) ? Math.min(MAX_AMOUNT, Math.max(0, Math.round(value))) : 0;

/** Runtime guard for untrusted data read back from localStorage. */
export function isValidState(value: unknown): value is S {
  const state = value as S;
  return (
    !!state && typeof state.income === 'number' && typeof state.day === 'number' &&
    state.day >= 1 && state.day <= D &&
    Array.isArray(state.txs) && Array.isArray(state.subs) && Array.isArray(state.coms) && Array.isArray(state.goals)
  );
}
