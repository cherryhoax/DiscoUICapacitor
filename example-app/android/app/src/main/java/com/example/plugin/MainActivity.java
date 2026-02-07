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
		
		if (BuildConfig.DEBUG) {
			WebView.setWebContentsDebuggingEnabled(true);
		}
	}
}
