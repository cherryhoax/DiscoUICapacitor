package io.github.cherryhoax.discoui.capacitor;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DiscoUI")
public class DiscoUIPlugin extends Plugin {
    @PluginMethod
    public void initialize(PluginCall call) {
        call.resolve();
    }
}
