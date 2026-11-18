package com.contoh.locker

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var dpm: DevicePolicyManager
    private lateinit var admin: ComponentName

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        admin = ComponentName(this, AdminReceiver::class.java)

        findViewById<View>(R.id.btnAdmin).setOnClickListener {
            if (!dpm.isAdminActive(admin)) {
                startActivity(Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN)
                    .putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, admin)
                    .putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                        "Diperlukan untuk perlindungan data perangkat"))
            }
        }

        findViewById<View>(R.id.btnOverlay).setOnClickListener {
            startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")))
        }

        findViewById<View>(R.id.btnNotif).setOnClickListener {
            if (Build.VERSION.SDK_INT >= 33)
                requestPermissions(arrayOf("android.permission.POST_NOTIFICATIONS"), 10)
        }

        findViewById<View>(R.id.btnStart).setOnClickListener {
            startService(Intent(this, LockService::class.java))
            startActivity(Intent(this, LockActivity::class.java))
            finish()
        }
    }
}