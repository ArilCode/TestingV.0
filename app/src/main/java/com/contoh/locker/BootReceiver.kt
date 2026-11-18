package com.contoh.locker
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        val svc = Intent(c, LockService::class.java)
        if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(svc) else c.startService(svc)
        val lock = Intent(c, LockActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        c.startActivity(lock)
    }
}