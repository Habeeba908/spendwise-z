import { D } from '../lib/finance';
import type { S, FinancialSummary } from '../lib/finance';

/** SVG cash forecast to day 30; optional second line shows a simulated decision. */
export default function ForecastChart({a,sa,b,sb}:{a:FinancialSummary;sa:S;b?:FinancialSummary;sb?:S}){
 const pts=(c:FinancialSummary,x:S)=>Array.from({length:D-x.day+1},(_,i)=>c.free-c.avg*i);
 const A=pts(a,sa),B=b?pts(b,sb as S):[],all=[...A,...B,0],mn=Math.min(...all),mx=Math.max(...all),W=300,H=110;
 const X=(i:number)=>(i/Math.max(1,A.length-1))*W,Y=(v:number)=>H-((v-mn)/Math.max(1,mx-mn))*H;
 const P=(r:number[])=>r.map((v,i)=>`${X(i)},${Y(v)}`).join(' ');
 return <svg viewBox={`0 0 ${W} ${H+4}`} width="100%" role="img" aria-label="Forecast chart"><line x1="0" x2={W} y1={Y(0)} y2={Y(0)} stroke="#fb7185" strokeDasharray="4"/>
 <polyline points={P(A)} fill="none" stroke="#34d399" strokeWidth="2.5"/>{b&&<polyline points={P(B)} fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="5"/>}</svg>}
