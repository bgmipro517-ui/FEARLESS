'use client';

import { ChangeEvent, useMemo, useState } from 'react';

type Activity = { id: number; text: string; time: string };

const initialActivities: Activity[] = [
  { id: 1, text: 'Control Center initialized', time: 'Now' },
  { id: 2, text: 'Customer privacy masking enabled', time: 'Now' },
];

export default function AdminControlCenter() {
  const [accent, setAccent] = useState('#2997ff');
  const [blur, setBlur] = useState(28);
  const [animation, setAnimation] = useState(1);
  const [privacyLock, setPrivacyLock] = useState(true);
  const [aiAssistant, setAiAssistant] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [brandName, setBrandName] = useState('FEARLESS SHOPS');
  const [adminEmail, setAdminEmail] = useState('owner@fearless.example');
  const [logo, setLogo] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  const previewStyle = useMemo(() => ({
    '--preview-accent': accent,
    '--preview-blur': `${blur}px`,
    '--preview-speed': `${animation}s`,
  }) as React.CSSProperties, [accent, blur, animation]);

  function log(text: string) {
    setActivities((current) => [
      { id: Date.now(), text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...current,
    ].slice(0, 8));
  }

  function chooseImage(event: ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'logo') setLogo(url);
    else setBanner(url);
    log(`${type === 'logo' ? 'Logo' : 'Banner'} preview updated`);
  }

  return (
    <main className="adminShell">
      <div className="adminGlow adminGlowOne" />
      <div className="adminGlow adminGlowTwo" />

      <header className="glass adminTopbar">
        <a href="/" className="brand"><span className="brandOrb">F</span><span>FEARLESS <b>SHOPS</b></span></a>
        <div className="adminTopActions">
          <span className="secureBadge">● Protected session</span>
          <a href="/" className="glassButton">View Store</a>
        </div>
      </header>

      <section className="adminIntro">
        <div>
          <span className="pill">MASTER ADMIN CONTROL CENTER</span>
          <h1>Customize everything.<br/><span>Keep security non-bypassable.</span></h1>
          <p>Control the storefront, branding, product experience, AI maintenance and future feature modules from one Liquid Glass dashboard.</p>
        </div>
        <div className="glass adminStatus">
          <span>Platform status</span><strong>All systems healthy</strong>
          <small>Privacy lock, payment verification and audit logging are protected.</small>
        </div>
      </section>

      <section className="adminGrid">
        <aside className="glass adminNav">
          {['Overview','Website Designer','Products & Bulk Listing','Media & Ads','AI Assistant','Privacy & Security','Maintenance History','Feature Manager','Updates'].map((item, index) => (
            <button key={item} className={index === 1 ? 'active' : ''} onClick={() => log(`Opened ${item}`)}>
              <span>{['◫','✦','◇','◉','✧','⊙','↻','＋','↑'][index]}</span>{item}
            </button>
          ))}
        </aside>

        <div className="adminWorkspace">
          <article className="glass controlPanel">
            <div className="panelHead"><div><small>LIVE DESIGN SYSTEM</small><h2>Website Designer</h2></div><button className="primary compact" onClick={() => log('Design settings published')}>Publish Changes</button></div>

            <div className="controlRows">
              <label className="field"><span>Brand name</span><input value={brandName} onChange={(e) => setBrandName(e.target.value)} /></label>
              <label className="field"><span>Admin email</span><input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} /><small>Production change requires re-authentication + verification.</small></label>
              <div className="field"><span>Accent</span><div className="swatches">{['#2997ff','#7c5cff','#00c7be','#ff375f'].map(color => <button key={color} aria-label={color} className={accent===color?'selected':''} style={{background:color}} onClick={() => {setAccent(color);log('Accent color changed')}} />)}</div></div>
              <label className="field"><span>Glass blur <b>{blur}px</b></span><input type="range" min="10" max="44" value={blur} onChange={(e)=>setBlur(Number(e.target.value))}/></label>
              <label className="field"><span>Animation speed <b>{animation.toFixed(1)}s</b></span><input type="range" min=".3" max="2" step=".1" value={animation} onChange={(e)=>setAnimation(Number(e.target.value))}/></label>
              <div className="uploadRow">
                <label className="uploadButton">Upload Logo<input type="file" accept="image/*" onChange={(e)=>chooseImage(e,'logo')} /></label>
                <label className="uploadButton">Upload Banner<input type="file" accept="image/*" onChange={(e)=>chooseImage(e,'banner')} /></label>
              </div>
            </div>
          </article>

          <article className="glass livePreview" style={previewStyle}>
            <div className="previewBar"><span>LIVE PREVIEW</span><div><i/><i/><i/></div></div>
            <div className="previewHero" style={banner ? {backgroundImage:`linear-gradient(135deg,rgba(2,10,24,.66),rgba(8,50,106,.36)),url(${banner})`} : undefined}>
              <div className="previewBrand">{logo ? <img src={logo} alt="Logo preview"/> : <span>F</span>}<b>{brandName}</b></div>
              <small>YOUR TRUST • OUR PRIORITY</small>
              <h3>Crystal-clear shopping,<br/>built around you.</h3>
              <button>Shop Collection →</button>
            </div>
          </article>

          <div className="miniGrid">
            <article className="glass miniPanel"><div className="miniHead"><div><small>SECURITY</small><h3>Privacy Lock</h3></div><button className={'switch '+(privacyLock?'on':'')} onClick={()=>{setPrivacyLock(v=>!v);log(`Privacy Lock ${privacyLock?'disabled':'enabled'}`)}}><span/></button></div><p>Require an additional protected check before sensitive customer data, exports and security settings.</p></article>
            <article className="glass miniPanel"><div className="miniHead"><div><small>AI MAINTENANCE</small><h3>AI Assistant</h3></div><button className={'switch '+(aiAssistant?'on':'')} onClick={()=>{setAiAssistant(v=>!v);log(`AI Assistant ${aiAssistant?'paused':'enabled'}`)}}><span/></button></div><p>Uses sanitized diagnostics only. Raw secrets and unrestricted customer data remain blocked.</p></article>
            <article className="glass miniPanel"><div className="miniHead"><div><small>OPERATIONS</small><h3>Maintenance Mode</h3></div><button className={'switch '+(maintenance?'on':'')} onClick={()=>{setMaintenance(v=>!v);log(`Maintenance mode ${maintenance?'disabled':'enabled'}`)}}><span/></button></div><p>Prepare controlled maintenance while keeping admin access and status monitoring available.</p></article>
          </div>

          <article className="glass quickActions">
            <div className="panelHead"><div><small>FAST ACTIONS</small><h2>Manage your store</h2></div></div>
            <div className="actionGrid">
              {[
                ['＋','Add Product','Create a new listing'],
                ['⇧','Bulk Listing','Import CSV/XLSX'],
                ['▶','Product Video','Manage product media'],
                ['▣','Banners & Ads','Schedule promotions'],
                ['✦','Add Feature','Open Feature Manager'],
                ['↻','Maintenance','View complete history'],
              ].map(([icon,title,desc])=><button key={title} onClick={()=>log(`Opened ${title}`)}><span>{icon}</span><div><strong>{title}</strong><small>{desc}</small></div><b>›</b></button>)}
            </div>
          </article>

          <article className="glass activityPanel">
            <div className="panelHead"><div><small>AUDIT PREVIEW</small><h2>Recent activity</h2></div></div>
            <div className="activityList">{activities.map(item=><div key={item.id}><span>✓</span><p><strong>{item.text}</strong><small>{item.time}</small></p></div>)}</div>
          </article>
        </div>
      </section>
    </main>
  );
}
