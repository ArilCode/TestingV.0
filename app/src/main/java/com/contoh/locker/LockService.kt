package com.contoh.locker
import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder

class LockService : Service() {
    override fun onCreate() {
        super.onCreate()
        val ch = NotificationChannel("lk","Locker",NotificationManager.IMPORTANCE_MIN)
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(ch)
        val n = Notification.Builder(this,"lk")
            .setContentTitle("Sistem berjalan")
            .setSmallIcon(android.R.drawable.ic_lock_lock).build()
        startForeground(1, n)
    }
    override fun onStartCommand(i: Intent?, f: Int, s: Int): Int {
        try {
            val it = Intent(this, LockActivity::class.java)
            it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            startActivity(it)
        } catch (_: Exception) {}
        return START_STICKY
    }
    override fun onBind(i: Intent?): IBinder? = null
}