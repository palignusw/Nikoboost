"use client";
import { useState, type PointerEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { chillstormFrames as frames } from "@/data/chillstorm-study";
import { tacticsPreview } from "@/data/tactics";
import styles from "./chillstorm.module.scss";
type Point = {
    x: number;
    y: number;
};
const allies = [{ x: 32, y: 48, label: "HEALER" }, { x: 43, y: 64, label: "DPS" }, { x: 45, y: 35, label: "TANK" }, { x: 57, y: 41, label: "DPS" }];
function assess(p: Point) {
    if (Math.hypot(p.x - 50, p.y - 22) < 14)
        return { ok: false, text: "That is the boss’s position. Choose clear space away from the players." };
    if (allies.some(a => Math.hypot(p.x - a.x, p.y - a.y) < 20) || Math.hypot(p.x - 51, p.y - 64) < 16)
        return { ok: false, text: "Too close to the group. Your storm would be beside teammates. Look for a clear patch farther away." };
    if (p.x < 9 || p.x > 91 || p.y < 12 || p.y > 88)
        return { ok: false, text: "That is outside this teaching arena. Pick clear space inside the floor." };
    return { ok: true, text: "Good separation. Drop the storm here, then move out and resist its pull. Other clear positions can work too." };
}
export default function ChillstormStudy() {
    const [step, setStep] = useState(0);
    const [mistake, setMistake] = useState(false);
    const [practice, setPractice] = useState(false);
    const [point, setPoint] = useState<Point | null>(null);
    const [cursor, setCursor] = useState<Point>({ x: 51, y: 64 });
    const frame = frames[step];
    const result = point ? assess(point) : null;
    const you = practice ? { x: 51, y: 64 } : mistake ? { x: 51, y: 64 } : step === 0 ? { x: 51, y: 64 } : step === 1 ? { x: 79, y: 63 } : step === 2 ? { x: 81, y: 84 } : { x: 62, y: 71 };
    const storm = mistake ? { x: 51, y: 64 } : { x: 79, y: 63 };
    const showStorm = !practice && step >= 2 && (step !== 3 || mistake);
    const coords = (p: Point) => ({ cx: p.x * 8, cy: p.y * 5 });
    function select(e: PointerEvent<SVGSVGElement>) {
        const box = e.currentTarget.getBoundingClientRect();
        const p = { x: (e.clientX - box.left) / box.width * 100, y: (e.clientY - box.top) / box.height * 100 };
        setPoint(p);
        setCursor(p);
    }
    function navigate(n: number) { setStep(n); setPoint(null); }
    function tryIt() { setPractice(true); setPoint(null); }
    return <div className={styles.shell}>
    <header className={styles.header}><Link href="/" aria-label="NikoBoost home"><Image src="/images/branding/nikoboost-logo-v2.png" width={145} height={40} alt="NikoBoost"/></Link><span>TACTICS LAB <b>NEW FORMAT</b></span><Link href="/tactics">All bosses ↗</Link></header>
    <main className={styles.main}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/tactics">All dungeons</Link><span>/</span><span>Ruby Life Pools</span></nav>
      <div className={styles.intro}><div><p className={styles.eyebrow}>MELIDRUSSA CHILLWORN · ONE MECHANIC</p><h1>Chillstorm.<br /><span>See it. Then move.</span></h1><p>A mark on you. A storm to place. A pull to escape.</p></div><div className={styles.boss}><Image src={tacticsPreview.image} width={76} height={76} alt="Ruby Life Pools"/><div>Melidrussa Chillworn<small>{tacticsPreview.seasonName}</small></div></div></div>
      <div className={styles.lesson}>
        <section className={styles.board} aria-label="Visual lesson">
          <div className={styles.boardTop}><span>{practice ? "YOUR TURN" : "WATCH THE SITUATION"}</span><span>{practice ? "NO TIMER" : `${step + 1} / 4`}</span></div>
          {!practice && <div className={styles.comparison} aria-label="Compare outcomes"><button aria-pressed={!mistake} onClick={() => setMistake(false)}>✓ Correct response</button><button aria-pressed={mistake} onClick={() => setMistake(true)}>× Common mistake</button></div>}
          <div className={styles.sceneLabel}>{practice ? "Where would you place your storm?" : frame.command}</div>
          <svg viewBox="0 0 800 500" className={`${styles.arena} ${practice ? styles.interactive : ""}`} role={practice ? "application" : "img"} aria-label={practice ? "Choose a storm position. Use arrow keys to move the cursor and Enter to confirm." : "Chillstorm scene: gold is you, blue is your party, shaded rings show the storm."} tabIndex={practice ? 0 : undefined} onPointerDown={practice ? select : undefined} onKeyDown={e => { if (!practice)
        return; const delta: Record<string, Point> = { ArrowLeft: { x: -4, y: 0 }, ArrowRight: { x: 4, y: 0 }, ArrowUp: { x: 0, y: -4 }, ArrowDown: { x: 0, y: 4 } }; if (delta[e.key]) {
        e.preventDefault();
        setCursor(c => ({ x: Math.max(0, Math.min(100, c.x + delta[e.key].x)), y: Math.max(0, Math.min(100, c.y + delta[e.key].y)) }));
    }
    else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setPoint(cursor);
    } }}>
            <defs><pattern id="chill-floor" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#222d42" strokeWidth="1"/></pattern><radialGradient id="chill-light"><stop stopColor="#202c42"/><stop offset="1" stopColor="#0c111a"/></radialGradient><marker id="chill-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#b7c2ff" strokeWidth="1.6"/></marker></defs>
            <rect x="24" y="25" width="752" height="450" rx="80" fill="url(#chill-light)" stroke="#35415a" strokeWidth="2"/><rect x="25" y="26" width="750" height="448" rx="80" fill="url(#chill-floor)"/>
            <g><path d="M400 62L425 80L417 112L400 124L383 112L375 80Z" fill="#b59b9c" fillOpacity=".3" stroke="#b59b9c"/><text x="400" y="53" className={styles.label}>BOSS</text></g>
            {showStorm && <g><circle {...coords(storm)} r="79" fill="#bb6a7e" fillOpacity=".15" stroke="#d48394" strokeWidth="2"/><circle {...coords(storm)} r="58" fill="none" stroke="#d48394" strokeDasharray="8 7"/><path d={`M${storm.x * 8 - 30} ${storm.y * 5}q30 -50 58 0q-28 50 -58 0`} fill="none" stroke="#e3a1af" strokeWidth="3"/><text x={storm.x * 8} y={storm.y * 5 + (mistake ? 112 : -93)} className={styles.dangerLabel}>ACTIVE STORM</text>{!mistake && <path d="M674 394L656 364" stroke="#e3a1af" strokeWidth="2" markerEnd="url(#chill-arrow)"/>}</g>}
            {allies.map(a => <g key={a.label + a.x}><circle {...coords(a)} r="19" fill="#17243c" stroke="#9aaeff" strokeWidth="2"/><text x={a.x * 8} y={a.y * 5 + 5} className={styles.symbol}>{a.label === "HEALER" ? "+" : a.label === "TANK" ? "T" : "D"}</text><text x={a.x * 8} y={a.y * 5 + 37} className={styles.partyLabel}>{a.label}</text></g>)}
            {!practice && !mistake && step === 1 && <><path d="M433 323Q510 365 603 323" fill="none" stroke="#b7c2ff" strokeWidth="3" strokeDasharray="9 6" markerEnd="url(#chill-arrow)"/><circle cx="408" cy="320" r="23" stroke="#d6bc84" fill="none" strokeDasharray="4 5" opacity=".4"/><text x="630" y="230" className={styles.label}>CLEAR SPACE</text></>}
            {!practice && !mistake && step === 2 && <path d="M646 337L648 394" fill="none" stroke="#b7c2ff" strokeWidth="3" markerEnd="url(#chill-arrow)"/>}
            <g><circle {...coords(you)} r="27" fill="#d9bc7e" fillOpacity=".18" stroke="#efce87" strokeWidth="3"/><text x={you.x * 8} y={you.y * 5 + 5} className={styles.youText}>YOU</text>{(practice || step < 2) && <><path d={`M${you.x * 8 - 10} ${you.y * 5 - 57}l10 -10 10 10 -10 10Z`} fill="#efce87"/><text x={practice || step === 0 ? 75 : you.x * 8} y={practice || step === 0 ? 100 : you.y * 5 - 79} style={{ textAnchor: practice || step === 0 ? "start" : "middle" }} className={styles.markLabel}>CHILLSTORM MARK</text>{(practice || step === 0) && <path d="M210 115L408 251" fill="none" stroke="#efce87" strokeWidth="1.5" strokeDasharray="5 5" opacity=".6"/>}</>}</g>
            {practice && <g><circle {...coords(point ?? cursor)} r="14" fill={result?.ok ? "#91cba8" : "#b7c2ff"} fillOpacity=".3" stroke="#e5e9ff" strokeWidth="2"/><path d={`M${(point ?? cursor).x * 8 - 21} ${(point ?? cursor).y * 5}h42M${(point ?? cursor).x * 8} ${(point ?? cursor).y * 5 - 21}v42`} stroke="#e5e9ff"/></g>}
          </svg>
          <div className={styles.legend}><span><i className={styles.gold}/>You / marked player</span><span><i />Your teammates</span><span><i className={styles.red}/>Active storm</span></div>
          <p className={styles.diagramNote}>Teaching diagram. Positions, size and timing are illustrative.</p>
          {practice ? <div className={styles.practiceHelp}><p>Tap any clear position on the floor. Keyboard: focus the arena, use arrow keys, then Enter.</p><button onClick={() => { setPoint(null); setCursor({ x: 51, y: 64 }); }}>Reset position</button></div> : <div className={styles.transport}><button disabled={step === 0} onClick={() => navigate(step - 1)}>← Back</button><span>No rush. One action at a time.</span><button onClick={() => step < 3 ? navigate(step + 1) : tryIt()}>{step < 3 ? "Next action →" : "Try it yourself →"}</button></div>}
        </section>
        <aside className={styles.explanation}>
          <p className={styles.eyebrow}>{practice ? "CHECK YOUR POSITION" : `STEP 0${step + 1} · ${frames[step].label.toUpperCase()}`}</p>
          <h2>{practice ? "You have the mark. Where do you go?" : frame.title}</h2>
          <p>{practice ? "Choose a place to leave the storm before it appears. The goal is separation, not one exact spot." : frame.text}</p>
          {practice ? (result ? <div role="status" className={`${styles.result} ${result.ok ? styles.success : styles.failure}`}><strong>{result.ok ? "Good separation." : "Look for more space."}</strong><p>{result.text}</p></div> : <div className={styles.takeaway}>Choose directly on the arena. You can try again at any time.</div>) : <div className={`${styles.takeaway} ${mistake ? styles.failure : ""}`}><strong>{mistake ? "WHY THIS FAILS" : "WHY THIS WORKS"}</strong><p>{mistake ? frame.mistake : frame.correct}</p></div>}
          <div className={styles.rule}><span>REMEMBER THIS</span><p>Mark → separate → storm appears → move out.</p></div>
          <button className={styles.primary} onClick={() => { if (practice) {
        setPractice(false);
        setPoint(null);
    }
    else
        tryIt(); }}>{practice ? "Back to the explanation" : "Show me where to move"}<span>↗</span></button>
        </aside>
      </div>
      <nav className={styles.storyboard} aria-label="Lesson steps">{frames.map((f, i) => <button key={f.label} aria-current={!practice && step === i ? "step" : undefined} onClick={() => { setPractice(false); navigate(i); }}><span>0{i + 1}</span><div>{f.label}<small>{i === 0 ? "Notice it" : i === 1 ? "Place it" : i === 2 ? "Escape it" : "Get ready again"}</small></div><b>→</b></button>)}</nav>
      <footer className={styles.footer}><div><strong>One mechanic, explained visually.</strong><p>This example follows one targeted DPS. Other roles can be targeted. Learn the full encounter before your run.</p></div><a href={tacticsPreview.source.url} target="_blank" rel="noreferrer">Method · full dungeon guide ↗</a></footer>
    </main>
  </div>;
}
