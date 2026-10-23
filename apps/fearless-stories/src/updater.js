import { Capacitor, registerPlugin } from "@capacitor/core";

const CURRENT = "4.2.0";
const RELEASES = "https://api.github.com/repos/bgmipro517-ui/FEARLESS/releases?per_page=30";
const TRUSTED = /^https:\/\/github\.com\/bgmipro517-ui\/FEARLESS\/releases\/download\/fearless-stories-v[\w.-]+\/[^/]+\.apk$/i;
const bridge = registerPlugin("FearlessUpdater");
let latest = null;
let busy = false;
let verified = false;
const $ = id => document.getElementById(id);
function version(tag) {
  const m = /^fearless-stories-v(\d+)-(\d+)(?:-(\d+))?(?:-|$)/i.exec(tag || "");
  return m ? [Number(m[1]), Number(m[2]), Number(m[3] || 0)] : null;
}
function compare(a, b) {
  for (let i=0;i<3;i++) if(a[i]!==b[i]) return a[i]-b[i];
  return 0;
}
function info(text, error=false) {
  const n=$("update-status");
  if(n) {n.textContent=text;n.style.color=error?"#ffb7c4":"#bdb6d1";}
}
function setProgress(number, text) {
  const bar=$("update-progress-bar"), label=$("update-progress-text");
  if(bar) bar.style.width=number+"%";
  if(label) label.textContent=text;
}
function attach() {
  const panel=$("update-panel");
  if(!panel) return;
  panel.innerHTML=[
    '<div><strong>App Update Manager · V',CURRENT,'</strong><p>GitHub Releases · verified downloads · Android approval</p></div>',
    '<div class="row"><button type="button" class="btn" id="update-check">Check for updates</button>',
    '<button type="button" class="btn alt" id="update-download" hidden>Download update</button>',
    '<button type="button" class="btn alt" id="update-install" hidden>Install update</button></div>',
    '<div id="update-progress-wrap" hidden><div class="update-progress-outer"><div id="update-progress-bar"></div></div><p class="small" id="update-progress-text">0%</p></div>',
    '<p class="small" id="update-status" role="status">Tap Check for updates. No automatic download.</p>',
    '<a id="update-page" href="#" target="_blank" rel="noopener noreferrer" hidden>View official release ↗</a>',
    '<p class="small">Update installation always needs your permission. A different APK signing certificate can require uninstalling the old test build, which deletes local app data.</p>'
  ].join("");
  $("update-check").addEventListener("click", check);
  $("update-download").addEventListener("click", download);
  $("update-install").addEventListener("click", install);
}
async function check() {
  if(busy)return;
  busy=true; verified=false;latest=null;
  $("update-check").disabled=true;
  $("update-download").hidden=true;
  $("update-install").hidden=true;
  $("update-page").hidden=true;
  $("update-progress-wrap").hidden=true;
  info("Checking official GitHub releases…");
  try{
    const r=await fetch(RELEASES,{headers:{Accept:"application/vnd.github+json"},cache:"no-store"});
    if(!r.ok)throw Error("Could not reach GitHub: HTTP "+r.status);
    const data=await r.json();
    if(!Array.isArray(data))throw Error("Unexpected release list");
    const candidates=data.filter(x=>!x.draft&&version(x.tag_name)&&compare(version(x.tag_name),[4,2,0])>0)
      .sort((a,b)=>compare(version(b.tag_name),version(a.tag_name)));
    for(const release of candidates){
      const asset=(release.assets||[]).find(a=>a.name?.toLowerCase().endsWith(".apk")&&TRUSTED.test(a.browser_download_url||""));
      if(!asset)continue;
      latest={page:release.html_url,url:asset.browser_download_url,
        sha:asset.digest?.replace(/^sha256:/i,"")||"",version:version(release.tag_name).join(".")};
      break;
    }
    if(!latest){info("Your app is up to date (V"+CURRENT+").");return;}
    const link=$("update-page");link.href=latest.page;link.hidden=false;
    $("update-download").hidden=false;
    info("Version "+latest.version+" is available. Review and download the verified APK.");
    if(!/^[a-f0-9]{64}$/i.test(latest.sha))info("The release has no SHA-256 digest: open GitHub in browser instead of in-app download.");
  }catch(e){info((e.message||"Update check failed")+". Check internet and try again.",true)}
  finally{busy=false;const btn=$("update-check");if(btn)btn.disabled=false}
}
async function download() {
  if(busy||!latest)return;
  if(!Capacitor.isNativePlatform()||!/^[a-f0-9]{64}$/i.test(latest.sha)){
    window.open(latest.page,"_blank","noopener,noreferrer");return;
  }
  busy=true;
  $("update-download").disabled=true;
  $("update-progress-wrap").hidden=false;
  setProgress(0,"Connecting…");
  info("Downloading update. SHA-256 will be verified.");
  let listener;
  try{
    listener=await bridge.addListener("downloadProgress",p=>{
      const percent=Math.min(100,Math.max(0,Number(p.percent)||0));
      setProgress(percent,p.total>0?percent+"%":(Math.round((p.bytes||0)/104857.6)/10)+" MB");
    });
    const result=await bridge.downloadApk({url:latest.url,sha256:latest.sha});
    if(!result.verified)throw Error("Could not verify download.");
    verified=true;
    setProgress(100,"100% · SHA-256 verified");
    info("Verified APK downloaded. Tap Install update to open Android system installer.");
    $("update-install").hidden=false;
  }catch(e){info(e?.message||"Download failed",true)}
  finally{await listener?.remove();busy=false;const btn=$("update-download");if(btn)btn.disabled=false;}
}
async function install() {
  if(!verified||busy)return;
  try{
    const result=await bridge.installApk();
    info(result.needsPermission
      ?"Allow installation from Fearless Stories in Android settings, then return and tap Install update again."
      :"Android installer opened. Confirm the update on your phone.");
  }catch(e){info(e.message||"Could not launch installer",true)}
}
window.FearlessUpdates={attach,check};
