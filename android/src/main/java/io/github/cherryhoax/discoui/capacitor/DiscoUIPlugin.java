package io.github.cherryhoax.discoui.capacitor;

import android.app.Activity;
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DiscoUI")
public class DiscoUIPlugin extends Plugin {

    private boolean splashHidden = false;

    @Override
    public void load() {
        super.load();
        // Enforce transparent bars on plugin load
        enforceTransparentBars();
        setupInsetsListener();
        setupBackButtonListener();
        setupSystemThemeListener();
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        call.resolve();
    }

    /**
     * Enforce edge-to-edge transparent status and navigation bars
     */
    private void enforceTransparentBars() {
        Activity activity = getActivity();
        if (activity == null) return;

        activity.runOnUiThread(() -> {
            Window window = activity.getWindow();
            if (window == null) return;

            // Enable edge-to-edge mode
            WindowCompat.setDecorFitsSystemWindows(window, false);

            // Make status bar transparent
            window.setStatusBarColor(Color.TRANSPARENT);

            // Make navigation bar transparent
            window.setNavigationBarColor(Color.TRANSPARENT);

            // Ensure navigation bar contrast is disabled for true transparency
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                window.setNavigationBarContrastEnforced(false);
            }
        });
    }

    /**
     * Get current window insets (safe area)
     */
    @PluginMethod
    public void getInsets(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        activity.runOnUiThread(() -> {
            View rootView = activity.getWindow().getDecorView();
            WindowInsetsCompat insets = ViewCompat.getRootWindowInsets(rootView);

            JSObject result = new JSObject();
            if (insets != null) {
                Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                result.put("top", systemBars.top);
                result.put("bottom", systemBars.bottom);
                result.put("left", systemBars.left);
                result.put("right", systemBars.right);
            } else {
                result.put("top", 0);
                result.put("bottom", 0);
                result.put("left", 0);
                result.put("right", 0);
            }
            call.resolve(result);
        });
    }

    /**
     * Setup listener for insets changes
     */
    private void setupInsetsListener() {
        Activity activity = getActivity();
        if (activity == null) return;

        activity.runOnUiThread(() -> {
            View rootView = activity.getWindow().getDecorView();
            ViewCompat.setOnApplyWindowInsetsListener(rootView, (v, insets) -> {
                Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());

                JSObject data = new JSObject();
                data.put("top", systemBars.top);
                data.put("bottom", systemBars.bottom);
                data.put("left", systemBars.left);
                data.put("right", systemBars.right);

                notifyListeners("insetsChanged", data);

                return insets;
            });
        });
    }

    /**
     * Setup back button listener
     */
    private void setupBackButtonListener() {
        // Back button is handled via handleOnBackPressed override
    }

    @Override
    public Boolean shouldOverrideLoad(String url) {
        return false;
    }

    @Override
    protected void handleOnBackPressed() {
        JSObject data = new JSObject();
        notifyListeners("backButton", data);
    }

    /**
     * Setup system theme change listener
     */
    private void setupSystemThemeListener() {
        Activity activity = getActivity();
        if (activity == null) return;

        // This would be called on configuration change
        // In a real implementation, you'd override onConfigurationChanged in the activity
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);

        int nightMode = newConfig.uiMode & Configuration.UI_MODE_NIGHT_MASK;
        String theme = (nightMode == Configuration.UI_MODE_NIGHT_YES) ? "dark" : "light";

        JSObject data = new JSObject();
        data.put("theme", theme);
        notifyListeners("systemThemeChanged", data);
    }

    /**
     * Hide native splash screen with fade animation
     */
    @PluginMethod
    public void hideSplash(PluginCall call) {
        if (splashHidden) {
            call.resolve();
            return;
        }

        Integer fadeOutDuration = call.getInt("fadeOutDuration", 0);

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        // Hide splash via Capacitor's built-in splash screen
        activity.runOnUiThread(() -> {
            // In a real implementation, you'd interact with SplashScreen plugin
            // For now, we just mark it as hidden
            splashHidden = true;
            call.resolve();
        });
    }

    /**
     * Set status bar style (light/dark)
     */
    @PluginMethod
    public void setStatusBarStyle(PluginCall call) {
        String style = call.getString("style", "dark");
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        activity.runOnUiThread(() -> {
            Window window = activity.getWindow();
            if (window == null) {
                call.reject("Window not available");
                return;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController controller = window.getInsetsController();
                if (controller != null) {
                    if ("light".equals(style)) {
                        controller.setSystemBarsAppearance(
                            WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
                            WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                        );
                    } else {
                        controller.setSystemBarsAppearance(0, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
                    }
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                View decorView = window.getDecorView();
                int flags = decorView.getSystemUiVisibility();
                if ("light".equals(style)) {
                    flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                } else {
                    flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                }
                decorView.setSystemUiVisibility(flags);
            }
            call.resolve();
        });
    }

    /**
     * Set navigation bar style (light/dark)
     */
    @PluginMethod
    public void setNavigationBarStyle(PluginCall call) {
        String style = call.getString("style", "dark");
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        activity.runOnUiThread(() -> {
            Window window = activity.getWindow();
            if (window == null) {
                call.reject("Window not available");
                return;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController controller = window.getInsetsController();
                if (controller != null) {
                    if ("light".equals(style)) {
                        controller.setSystemBarsAppearance(
                            WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
                            WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
                        );
                    } else {
                        controller.setSystemBarsAppearance(0, WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
                    }
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                View decorView = window.getDecorView();
                int flags = decorView.getSystemUiVisibility();
                if ("light".equals(style)) {
                    flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                } else {
                    flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                }
                decorView.setSystemUiVisibility(flags);
            }
            call.resolve();
        });
    }

    /**
     * Set navigation bar color
     */
    @PluginMethod
    public void setNavigationBarColor(PluginCall call) {
        String colorString = call.getString("color");
        if (colorString == null) {
            call.reject("Color is required");
            return;
        }

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        activity.runOnUiThread(() -> {
            Window window = activity.getWindow();
            if (window == null) {
                call.reject("Window not available");
                return;
            }

            try {
                int color = Color.parseColor(colorString);
                window.setNavigationBarColor(color);
                call.resolve();
            } catch (IllegalArgumentException e) {
                call.reject("Invalid color format: " + colorString);
            }
        });
    }
}
