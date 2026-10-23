package com.fearlessstories.ott;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

@CapacitorPlugin(name = "FearlessUpdater")
public class FearlessUpdaterPlugin extends Plugin {
    private static final long MAX_SIZE = 160L * 1024L * 1024L;
    private static final String REPO = "https://github.com/bgmipro517-ui/FEARLESS/releases/download/";
    private final AtomicBoolean active = new AtomicBoolean(false);
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private volatile File verifiedApk;

    @PluginMethod
    public void downloadApk(PluginCall call) {
        final String url = call.getString("url");
        final String expected = call.getString("sha256");
        if (url == null || expected == null || !expected.matches("(?i)[a-f0-9]{64}") ||
            !url.startsWith(REPO) ||
            !url.matches("(?i)^https://github\\.com/bgmipro517-ui/FEARLESS/releases/download/fearless-stories-v[\\w.-]+/[^/?#]+\\.apk$")) {
            call.reject("Invalid official release or checksum.");
            return;
        }
        if (!active.compareAndSet(false, true)) {
            call.reject("Another update is downloading.");
            return;
        }
        worker.execute(() -> {
            File target = null;
            try {
                verifiedApk = null;
                URL location = new URL(url);
                HttpURLConnection conn = null;
                for (int redirects = 0; redirects <= 6; redirects++) {
                    if (!"https".equalsIgnoreCase(location.getProtocol())) throw new Exception("HTTPS required.");
                    String host = location.getHost().toLowerCase(Locale.US);
                    if (!host.equals("github.com") && !host.equals("release-assets.githubusercontent.com") &&
                        !host.equals("objects.githubusercontent.com") && !host.equals("github-releases.githubusercontent.com")) {
                        throw new Exception("Untrusted download host.");
                    }
                    conn = (HttpURLConnection) location.openConnection();
                    conn.setInstanceFollowRedirects(false);
                    conn.setConnectTimeout(15000);
                    conn.setReadTimeout(30000);
                    conn.setRequestProperty("User-Agent", "FearlessStoriesUpdater/4.2");
                    int response = conn.getResponseCode();
                    if (response >= 300 && response < 400) {
                        String next = conn.getHeaderField("Location");
                        conn.disconnect();
                        if (next == null || redirects == 6) throw new Exception("Invalid download redirect.");
                        location = new URL(location, next);
                        continue;
                    }
                    if (response != 200) throw new Exception("HTTP " + response);
                    break;
                }
                if (conn == null) throw new Exception("Download unavailable.");
                long total = conn.getContentLengthLong();
                if (total > MAX_SIZE) throw new Exception("APK is too large.");
                File dir = new File(getContext().getCacheDir(), "updates");
                if (!dir.exists() && !dir.mkdirs()) throw new Exception("Cannot create update directory.");
                target = new File(dir, "update-" + System.currentTimeMillis() + ".apk");
                MessageDigest checksum = MessageDigest.getInstance("SHA-256");
                byte[] buffer = new byte[32768];
                long bytes = 0;
                int previousPercent = -1;
                try (InputStream in = conn.getInputStream();
                     FileOutputStream out = new FileOutputStream(target)) {
                    int read;
                    while ((read = in.read(buffer)) != -1) {
                        bytes += read;
                        if (bytes > MAX_SIZE) throw new Exception("APK exceeded download limit.");
                        checksum.update(buffer, 0, read);
                        out.write(buffer, 0, read);
                        int percent = total > 0 ? (int)Math.min(100L, bytes * 100L / total) : 0;
                        if (percent != previousPercent || bytes % (512*1024) < buffer.length) {
                            JSObject progress = new JSObject();
                            progress.put("percent", percent);
                            progress.put("bytes", bytes);
                            progress.put("total", total);
                            notifyListeners("downloadProgress", progress);
                            previousPercent = percent;
                        }
                    }
                    out.getFD().sync();
                } finally { conn.disconnect(); }
                if (total > 0 && total != bytes) throw new Exception("Incomplete APK.");
                StringBuilder resultHash = new StringBuilder();
                for (byte b : checksum.digest()) resultHash.append(String.format(Locale.US, "%02x", b & 0xff));
                if (!resultHash.toString().equalsIgnoreCase(expected)) throw new Exception("SHA-256 mismatch.");
                verifiedApk = target;
                JSObject result = new JSObject();
                result.put("verified", true);
                result.put("bytes", bytes);
                call.resolve(result);
            } catch (Exception error) {
                if (target != null && target.exists()) target.delete();
                call.reject(error.getMessage() == null ? "Update download failed." : error.getMessage());
            } finally {
                active.set(false);
            }
        });
    }

    @PluginMethod
    public void installApk(PluginCall call) {
        File apk = verifiedApk;
        if (apk == null || !apk.isFile()) {
            call.reject("Download and verify the APK first.");
            return;
        }
        try {
            if (Build.VERSION.SDK_INT >= 26 && !getContext().getPackageManager().canRequestPackageInstalls()) {
                Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + getContext().getPackageName()));
                getActivity().startActivity(settings);
                JSObject result = new JSObject();
                result.put("needsPermission", true);
                call.resolve(result);
                return;
            }
            Uri uri = FileProvider.getUriForFile(getContext(),
                getContext().getPackageName() + ".fileprovider", apk);
            Intent install = new Intent(Intent.ACTION_VIEW);
            install.setDataAndType(uri, "application/vnd.android.package-archive");
            install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().startActivity(install);
            JSObject result = new JSObject();
            result.put("needsPermission", false);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Cannot open installer: " + error.getMessage());
        }
    }
}
