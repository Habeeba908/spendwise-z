import { inr } from '../lib/finance';

/** One before -> after line in the decision simulator. */
export default function ImpactRow({l,a,b,up,f=inr}:{l:string;a:number;b:number;up:boolean;f?:(n:number)=>string}){const d=b-a,g=up?d>=0:d<=0;
 return <div className="row sp"><span className="m">{l}</span><span>{f(a)} → <b>{f(b)}</b> <span className={Math.abs(d)<.5?'m':g?'g':'r'}>({d>0?'+':''}{f(d)})</span></span></div>}
