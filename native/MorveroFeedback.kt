// MorveroFeedback.kt — drop-in Morvero client for Android. v1.0.0
//
// Single file, no dependencies beyond the Android SDK (HttpURLConnection +
// org.json). minSdk 21. Add this file to your app module, then:
//
//   MorveroFeedback.configure(context, origin = "https://morvero.com",
//                             key = "fbk_your_product_key",
//                             appId = "com.company.app")   // must match the key's allowed app IDs (if set)
//   MorveroFeedback.trackScreen("/invoices")                // on screen shown
//   MorveroFeedback.trackAction("export-csv")               // on feature use
//   MorveroFeedback.submitFeedback(4, "Love it")            // from your feedback UI
//
// Privacy: the visitor id is a random, meaningless string stored only in the
// app's SharedPreferences — no device identifiers, no personal data. The
// optional cohort is a coarse group label (e.g. "finance"); never pass
// usernames or ids. Every call runs fire-and-forget on a single background
// thread and will never throw, block, or crash the host app.

package com.morvero.feedback

import android.content.Context
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID
import java.util.concurrent.Executors

object MorveroFeedback {
    private var origin = ""
    private var key = ""
    private var appId = ""
    private var cohort = ""
    private var visitorId = ""
    private val executor = Executors.newSingleThreadExecutor { r -> Thread(r, "morvero-feedback").apply { isDaemon = true } }

    @JvmStatic
    @JvmOverloads
    fun configure(context: Context, origin: String, key: String, appId: String = "", cohort: String = "") {
        this.origin = origin.trimEnd('/')
        this.key = key
        this.appId = appId
        this.cohort = cohort
        val prefs = context.applicationContext.getSharedPreferences("morvero", Context.MODE_PRIVATE)
        visitorId = prefs.getString("visitor", null) ?: ("v_" + UUID.randomUUID().toString().replace("-", "")).also {
            prefs.edit().putString("visitor", it).apply()
        }
    }

    /** Record a screen view. Path is a stable route-like string ("/invoices"). */
    @JvmStatic
    @JvmOverloads
    fun trackScreen(path: String, title: String = "") = post("/api/collect/pageview", JSONObject()
        .put("key", key).put("path", path).put("title", title)
        .put("visitorId", visitorId).put("cohort", cohort))

    /** Record a feature/function use; cost (USD) is for AI-agent telemetry. */
    @JvmStatic
    @JvmOverloads
    fun trackAction(name: String, path: String = "/", cost: Double = 0.0) = post("/api/collect/action", JSONObject()
        .put("key", key).put("action", name).put("path", path).put("visitorId", visitorId)
        .apply { if (cost > 0) put("cost", cost) })

    /**
     * Submit a 1–5 rating with an optional comment. Fetches the short-lived
     * submission token for you and retries once on an expired token.
     */
    @JvmStatic
    @JvmOverloads
    fun submitFeedback(rating: Int, comment: String = "", path: String = "/", callback: ((Boolean) -> Unit)? = null) {
        executor.execute {
            var ok = false
            try {
                var attempts = 0
                while (attempts < 2) {
                    attempts++
                    val token = fetchToken() ?: break
                    val status = request("/api/collect/feedback", JSONObject()
                        .put("key", key).put("token", token).put("rating", rating).put("comment", comment)
                        .put("path", path).put("visitorId", visitorId).put("platform", "android")
                        .put("trigger", "manual").put("cohort", cohort))
                    if (status == 401) continue
                    ok = status == 201
                    break
                }
            } catch (_: Exception) { /* never break the host app */ }
            callback?.invoke(ok)
        }
    }

    // --- internals ---

    private fun fetchToken(): String? = try {
        val conn = URL("$origin/api/widget-config?key=$key").openConnection() as HttpURLConnection
        if (appId.isNotEmpty()) conn.setRequestProperty("X-Morvero-App-Id", appId)
        conn.connectTimeout = 8000; conn.readTimeout = 8000
        val body = conn.inputStream.bufferedReader().readText()
        conn.disconnect()
        JSONObject(body).optString("token").ifEmpty { null }
    } catch (_: Exception) { null }

    private fun post(path: String, body: JSONObject) {
        if (origin.isEmpty() || key.isEmpty()) return
        executor.execute { try { request(path, body) } catch (_: Exception) { /* fire and forget */ } }
    }

    private fun request(path: String, body: JSONObject): Int {
        val conn = URL(origin + path).openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.doOutput = true
        conn.setRequestProperty("Content-Type", "application/json")
        if (appId.isNotEmpty()) conn.setRequestProperty("X-Morvero-App-Id", appId)
        conn.connectTimeout = 8000; conn.readTimeout = 8000
        conn.outputStream.use { it.write(body.toString().toByteArray()) }
        val status = conn.responseCode
        conn.disconnect()
        return status
    }
}
