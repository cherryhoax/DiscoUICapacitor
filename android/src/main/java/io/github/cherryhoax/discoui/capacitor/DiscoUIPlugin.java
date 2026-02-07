package io.github.cherryhoax.discoui.capacitor;

import android.app.Activity;
import android.content.res.AssetManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.splashscreen.SplashScreenViewProvider;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

@CapacitorPlugin(name = "DiscoUI")
public class DiscoUIPlugin extends Plugin {
    private static final String TAG = "DiscoUI";

    @Override
    public void load() {
        super.load();
        applyWindowBackgroundFromConfig();
        disableSplashExitAnimation();
        registerInsetsListener();
        registerBackHandler();
    }

    @Override
    protected void handleOnStart() {
        super.handleOnStart();
        applyWindowBackgroundFromConfig();
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        applyWindowBackgroundFromConfig();
    }

    public Boolean handleOnBackPressed() {
        WebView webView = getBridge().getWebView();
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }

        JSObject payload = new JSObject();
        notifyListeners("backButton", payload, true);
        // Consume back press to prevent app exit by default.
        return true;
    }

    private void registerBackHandler() {
        Activity activity = getActivity();
        if (activity == null) return;

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.setFocusableInTouchMode(true);
            webView.requestFocus();
            webView.setOnKeyListener((v, keyCode, event) -> {
                if (keyCode == KeyEvent.KEYCODE_BACK && event.getAction() == KeyEvent.ACTION_UP) {
                    handleOnBackPressed();
                    return true;
                }
                return false;
            });
        }

        if (!(activity instanceof AppCompatActivity)) return;
        AppCompatActivity compatActivity = (AppCompatActivity) activity;
        compatActivity.getOnBackPressedDispatcher().addCallback(new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                handleOnBackPressed();
            }
        });
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        call.resolve();
    }

    @PluginMethod
    public void getInsets(PluginCall call) {
        JSObject payload = getCurrentInsets();
        call.resolve(payload);
    }

    private void applyWindowBackgroundFromConfig() {
        Activity activity = getActivity();
        if (activity == null) return;

        String theme = readThemeFromConfig();
        applyNightMode(theme);
        int color = resolveThemeColor(theme, activity);
        activity.getWindow().setBackgroundDrawable(new ColorDrawable(color));
        activity.getWindow().getDecorView().setBackgroundColor(color);
    }

    private void registerInsetsListener() {
        Activity activity = getActivity();
        if (activity == null) return;

        View root = activity.getWindow().getDecorView();
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            dispatchInsets(insets);
            return insets;
        });

        WindowInsetsCompat current = ViewCompat.getRootWindowInsets(root);
        if (current != null) {
            dispatchInsets(current);
        }
    }

    private void dispatchInsets(WindowInsetsCompat insets) {
        JSObject payload = buildInsetsPayload(insets);
        notifyListeners("insetsChange", payload, true);
    }

    private JSObject getCurrentInsets() {
        Activity activity = getActivity();
        JSObject payload = new JSObject();
        if (activity == null) return payload;
        WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(activity.getWindow().getDecorView());
        if (insets == null) return payload;
        return buildInsetsPayload(insets);
    }

    private JSObject buildInsetsPayload(WindowInsetsCompat insets) {
        JSObject payload = new JSObject();
        int types = WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout();
        androidx.core.graphics.Insets sys = insets.getInsets(types);
        payload.put("top", sys.top);
        payload.put("right", sys.right);
        payload.put("bottom", sys.bottom);
        payload.put("left", sys.left);
        return payload;
    }

    private void applyNightMode(String theme) {
        if ("dark".equals(theme)) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
        } else if ("light".equals(theme)) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM);
        }
    }

    private void disableSplashExitAnimation() {
        Activity activity = getActivity();
        if (activity == null) return;
        try {
            SplashScreen splashScreen = SplashScreen.installSplashScreen(activity);
            splashScreen.setOnExitAnimationListener((SplashScreenViewProvider provider) -> {
                provider.remove();
            });
        } catch (Exception ignored) {
            // If the API isn't available, just skip.
        }
    }

    private String readThemeFromConfig() {
        String[] paths = new String[] { "disco.config.json", "public/disco.config.json" };
        AssetManager assets = getContext().getAssets();
        for (String path : paths) {
            try (InputStream input = assets.open(path);
                 BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                JSONObject json = new JSONObject(sb.toString());
                String theme = json.optString("theme", "auto");
                return theme == null ? "auto" : theme.toLowerCase();
            } catch (Exception ignored) {
                // try next path
            }
        }
        return "auto";
    }

    private int resolveThemeColor(String theme, Activity activity) {
        if ("dark".equals(theme)) return Color.BLACK;
        if ("light".equals(theme)) return Color.WHITE;

        int mode = activity.getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        return mode == Configuration.UI_MODE_NIGHT_YES ? Color.BLACK : Color.WHITE;
    }
}
