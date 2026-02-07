package com.example.plugin;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

import com.example.plugin.BuildConfig;

public class MainActivity extends BridgeActivity {
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		// Disable predictive back gesture
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
			getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(null);
		}
		
		if (BuildConfig.DEBUG) {
			WebView.setWebContentsDebuggingEnabled(true);
		}
	}
}
