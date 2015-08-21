package com.example.i35_2013;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

@SuppressLint("JavascriptInterface")
public class MainActivity extends Activity implements LocationListener {
	private static final String TAG = "i35_2013";
	private WebView webview;
	private long exitTime = 0;
	private double lng=0,lat=0;
	private LocationManager lms;
	private String choiceProvider;
	private boolean getService = false;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.result);
		
		SetView();
		lms = (LocationManager) getSystemService(LOCATION_SERVICE);	//取得系統定位服務
		
	}
	
	private void SetView() {
		webview = (WebView)findViewById(R.id.webview);
		WebViewSet();
	}

	private void WebViewSet() {
		WebSettings webSettings = webview.getSettings();
		webSettings.setJavaScriptEnabled(true); //啟用JavaScript執行功能
		webSettings.setSupportZoom(true);
		webSettings.setBuiltInZoomControls(true);
		webview.setWebChromeClient(new WebChromeClient());
		webview.addJavascriptInterface(new webobj(),"inwcall");
		webview.loadUrl("file:///android_asset/index.html");
	}
	
	class webobj {
		//exit app
		public void ExitApp() {
			android.os.Process.killProcess(android.os.Process.myPid());
		}
		//得到經度
		public double GetLocationLng() {
			return lng;
		}
		//得到緯度
		public double GetLocationLat() {
			return lat;
		}
	}
	
	//處理webview back與app 的問題
	public boolean onKeyDown(int KeyCode,KeyEvent event){
		if(KeyCode == KeyEvent.KEYCODE_BACK && event.getAction() == KeyEvent.ACTION_DOWN){
			if(webview.canGoBack()){
				webview.goBack();
			} else {
				if((System.currentTimeMillis()-exitTime) > 2000) {
			        Toast.makeText(getApplicationContext(), "再按一次退出程式", Toast.LENGTH_SHORT).show();
			        exitTime = System.currentTimeMillis();  
			    } else {
			        finish();  
			        System.exit(0);  
			    }
			}
			return true;
		}
		return super.onKeyDown(KeyCode,event);
	}
	
	private void locationServiceInitial() {
		if(lms.isProviderEnabled(LocationManager.GPS_PROVIDER))//有GPS就設定以gps來定位
			choiceProvider=LocationManager.GPS_PROVIDER;
		else if(lms.isProviderEnabled(LocationManager.NETWORK_PROVIDER))//如果沒gps有網路就以網路來定位
			choiceProvider=LocationManager.NETWORK_PROVIDER;
		Location lo = lms.getLastKnownLocation(choiceProvider);
		getLocation(lo);
	}
	
	private void getLocation(Location location) {	//將定位資訊顯示在畫面中
		if(location != null) {
			lat= 23.945154695027593;
			lng= 120.98384857177734;
			//lng = location.getLongitude();	//取得經度
			//lat = location.getLatitude();	//取得緯度
			Log.i(TAG,"經度:"+lng+"緯度:"+lat);
		} else {
			Toast.makeText(this, "無法定位座標", Toast.LENGTH_LONG).show();
		}
	}
	
	@Override
	protected void onResume() {
		super.onResume();
		if (lms.isProviderEnabled(LocationManager.GPS_PROVIDER) || lms.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
  			//如果GPS或網路定位開啟，呼叫locationServiceInitial()更新位置
  			getService = true;	//確認開啟定位服務
  			locationServiceInitial();
  		} else {
  			Toast.makeText(MainActivity.this, "請開啟定位服務", Toast.LENGTH_LONG).show();
  			AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);
  		    builder.setTitle("警告訊息");
  			builder.setMessage("您尚未開啟定位服務，要前往設定嗎？");
  			builder.setPositiveButton("是", new DialogInterface.OnClickListener() {
  		        @Override
  		        public void onClick(DialogInterface dialog, int which) {
  		        	startActivity(new Intent(android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS));	//開啟設定頁面
  		        }
  		    });
  		    builder.setNegativeButton("否", new DialogInterface.OnClickListener() {
  		        @Override
  		        public void onClick(DialogInterface dialog, int which) {
  		           Toast.makeText(getApplicationContext(),"定位服務尚未開啟...", Toast.LENGTH_SHORT).show();
  		        }
  		    });
  		    AlertDialog alert = builder.create();
  		    alert.show();
  			
  		}
		
		if(getService) {
			//服務提供者、更新頻率60000毫秒=1分鐘、最短距離、地點改變時呼叫物件
			lms.requestLocationUpdates(choiceProvider, 1000, 1, this);
		}
	}
	
	@Override
	protected void onPause() {
		super.onPause();
		lms.removeUpdates(MainActivity.this);
	}
	
	@Override
	public void onLocationChanged(Location location) {
		// TODO Auto-generated method stub
		getLocation(location);
	}
	@Override
	public void onProviderDisabled(String provider) {
		// TODO Auto-generated method stub
		
	}
	@Override
	public void onProviderEnabled(String provider) {
		// TODO Auto-generated method stub
		
	}
	@Override
	public void onStatusChanged(String provider, int status, Bundle extras) {
		// TODO Auto-generated method stub
		
	}
}
