/** Circular financial-health score (0-100). */
export default function HealthRing({v}:{v:number}){const c=v>66?'#34d399':v>40?'#fbbf24':'#fb7185';
 return <svg width="84" height="84" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="#1d2233" strokeWidth="4"/>
 <circle cx="18" cy="18" r="15" fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${v*0.942} 100`} transform="rotate(-90 18 18)" style={{transition:'.6s'}}/>
 <text x="18" y="21" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">{v}</text></svg>}
