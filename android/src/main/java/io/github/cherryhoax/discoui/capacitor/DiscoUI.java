package io.github.cherryhoax.discoui.capacitor;

import com.getcapacitor.Logger;

public class DiscoUI {

    public String echo(String value) {
        Logger.info("Echo", value);
        return value;
    }
}
