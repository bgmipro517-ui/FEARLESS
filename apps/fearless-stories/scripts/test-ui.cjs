const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const html=fs.readFileSync("www/index.html","utf8");
const inline=html.split("<script>")[1]?.split("</script>")[0];
assert.ok(inline,"inline app script missing");
new vm.Script(inline,{filename:"app-inline.js"});
const content={innerHTML:""};
const settings={onclick:null};
const tabs=["home","discover","saved","profile"].map(tab=>({dataset:{tab},classList:{toggle(){}},onclick:null}));
const document={
  getElementById(id){if(id==="content")return content;if(id==="settings")return settings;return null;},
  querySelectorAll(selector){return selector==="[data-tab]"?tabs:[];}
};
vm.runInNewContext(inline,{document,window:{scrollTo(){}},localStorage:{getItem(){return null},setItem(){}},URL,console});
assert.ok(content.innerHTML.includes("Big stories."),"home content blank");
tabs[1].onclick();assert.ok(content.innerHTML.includes("Find your next obsession."),"discover failed");
tabs[2].onclick();assert.ok(content.innerHTML.includes("Your watchlist."),"saved failed");
tabs[3].onclick();assert.ok(content.innerHTML.includes("Low-cost plans"),"profile failed");
settings.onclick();assert.ok(content.innerHTML.includes('id="update-panel"'),"Update Manager missing");
assert.ok(html.includes('src="./update.js"'),"update bundle not referenced");
assert.ok(fs.statSync("www/update.js").size>1000,"update script not bundled");
console.log("PASS: Home, Discover, Saved, Profile, Settings, Update Manager integration");
