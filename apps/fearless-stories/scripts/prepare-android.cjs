const fs=require("node:fs");
const path=require("node:path");
const NL=String.fromCharCode(10);
const root=path.resolve(__dirname,"..");
const android=path.join(root,"android");
const java=path.join(android,"app/src/main/java/com/fearlessstories/ott");
const manifestPath=path.join(android,"app/src/main/AndroidManifest.xml");
const gradlePath=path.join(android,"app/build.gradle");
if(!fs.existsSync(manifestPath)||!fs.existsSync(gradlePath))throw Error("Run npx cap add android first");
fs.mkdirSync(java,{recursive:true});
fs.copyFileSync(path.join(root,"native/FearlessUpdaterPlugin.java"),path.join(java,"FearlessUpdaterPlugin.java"));
fs.writeFileSync(path.join(java,"MainActivity.java"),[
"package com.fearlessstories.ott;",
"import android.os.Bundle;",
"import com.getcapacitor.BridgeActivity;",
"public class MainActivity extends BridgeActivity {",
"  @Override public void onCreate(Bundle savedInstanceState) {",
"    registerPlugin(FearlessUpdaterPlugin.class);",
"    super.onCreate(savedInstanceState);",
"  }",
"}",""
].join(NL));
const xmlDir=path.join(android,"app/src/main/res/xml");
fs.mkdirSync(xmlDir,{recursive:true});
fs.writeFileSync(path.join(xmlDir,"fearless_update_paths.xml"),[
'<?xml version="1.0" encoding="utf-8"?>',
'<paths xmlns:android="http://schemas.android.com/apk/res/android">',
'  <cache-path name="verified-apks" path="updates/" />',
'</paths>',''
].join(NL));
let xml=fs.readFileSync(manifestPath,"utf8");
if(!xml.includes("android.permission.REQUEST_INSTALL_PACKAGES")){
  xml=xml.replace("<application",'<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />'+NL+"    <application");
}
if(!xml.includes("com.fearlessstories.ott.fileprovider")){
  xml=xml.replace("</application>",[
  '<provider android:name="androidx.core.content.FileProvider"',
  '  android:authorities="com.fearlessstories.ott.fileprovider"',
  '  android:exported="false" android:grantUriPermissions="true">',
  '  <meta-data android:name="android.support.FILE_PROVIDER_PATHS"',
  '    android:resource="@xml/fearless_update_paths" />',
  '</provider>','</application>'
  ].join(NL));
}
fs.writeFileSync(manifestPath,xml);
let gradle=fs.readFileSync(gradlePath,"utf8");
const codePattern=/versionCode[ ]+[0-9]+/;
const namePattern=/versionName[ ]+["][^"]+["]/;
if(!codePattern.test(gradle)||!namePattern.test(gradle))throw Error("Gradle version fields not found");
gradle=gradle.replace(codePattern,"versionCode 42").replace(namePattern,'versionName "4.2.0"');
fs.writeFileSync(gradlePath,gradle);
console.log("Native updater and Android V4.2 configured");
