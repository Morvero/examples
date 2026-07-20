// MorveroFeedback.swift — drop-in Morvero client for iOS/macOS. v1.0.0
//
// Single file, no dependencies, iOS 13+ / macOS 10.15+. Add this file to your
// app target, then:
//
//   MorveroFeedback.configure(origin: "https://morvero.com",
//                             key: "fbk_your_product_key",
//                             appId: "com.company.app")        // must match the key's allowed app IDs (if set)
//   MorveroFeedback.trackScreen("/invoices")                    // on screen appear
//   MorveroFeedback.trackAction("export-csv")                   // on feature use
//   MorveroFeedback.submitFeedback(rating: 4, comment: "…")     // from your feedback UI
//
// Privacy: the visitor id is a random, meaningless string stored only in
// UserDefaults — no device identifiers, no personal data. The optional cohort
// is a coarse group label (e.g. "finance"); never pass usernames or ids.
// Every call is fire-and-forget on a background queue and will never throw,
// block, or crash the host app.

import Foundation

public enum MorveroFeedback {
    private static var origin = ""
    private static var key = ""
    private static var appId = ""
    private static var cohort = ""
    private static let queue = DispatchQueue(label: "com.morvero.feedback", qos: .utility)

    private static var visitorId: String {
        let d = UserDefaults.standard
        if let v = d.string(forKey: "morvero_visitor") { return v }
        let v = "v_" + UUID().uuidString.lowercased().replacingOccurrences(of: "-", with: "")
        d.set(v, forKey: "morvero_visitor")
        return v
    }

    public static func configure(origin: String, key: String, appId: String = "", cohort: String = "") {
        self.origin = origin.hasSuffix("/") ? String(origin.dropLast()) : origin
        self.key = key
        self.appId = appId
        self.cohort = cohort
    }

    /// Record a screen view. Path is a stable route-like string ("/invoices").
    public static func trackScreen(_ path: String, title: String = "") {
        post("/api/collect/pageview", body: [
            "key": key, "path": path, "title": title, "visitorId": visitorId, "cohort": cohort,
        ])
    }

    /// Record a feature/function use; cost (USD) is for AI-agent telemetry.
    public static func trackAction(_ name: String, path: String = "/", cost: Double = 0) {
        var body: [String: Any] = ["key": key, "action": name, "path": path, "visitorId": visitorId]
        if cost > 0 { body["cost"] = cost }
        post("/api/collect/action", body: body)
    }

    /// Submit a 1–5 rating with an optional comment. Fetches the short-lived
    /// submission token for you and retries once on an expired token.
    public static func submitFeedback(rating: Int, comment: String = "", path: String = "/",
                                      completion: ((Bool) -> Void)? = nil) {
        queue.async {
            func attempt(_ retriesLeft: Int) {
                fetchToken { token in
                    guard let token = token else { completion?(false); return }
                    request("/api/collect/feedback", body: [
                        "key": key, "token": token, "rating": rating, "comment": comment,
                        "path": path, "visitorId": visitorId, "platform": platformName(),
                        "trigger": "manual", "cohort": cohort,
                    ]) { status in
                        if status == 401 && retriesLeft > 0 { attempt(retriesLeft - 1) }
                        else { completion?(status == 201) }
                    }
                }
            }
            attempt(1)
        }
    }

    // MARK: - internals

    private static func platformName() -> String {
        #if os(iOS)
        return "ios"
        #else
        return "api"
        #endif
    }

    private static func fetchToken(_ done: @escaping (String?) -> Void) {
        guard var comps = URLComponents(string: origin + "/api/widget-config") else { done(nil); return }
        comps.queryItems = [URLQueryItem(name: "key", value: key)]
        guard let url = comps.url else { done(nil); return }
        var req = URLRequest(url: url)
        if !appId.isEmpty { req.setValue(appId, forHTTPHeaderField: "X-Morvero-App-Id") }
        URLSession.shared.dataTask(with: req) { data, _, _ in
            let token = data.flatMap { try? JSONSerialization.jsonObject(with: $0) as? [String: Any] }?["token"] as? String
            done(token)
        }.resume()
    }

    private static func post(_ path: String, body: [String: Any]) {
        queue.async { request(path, body: body, done: { _ in }) }
    }

    private static func request(_ path: String, body: [String: Any], done: @escaping (Int) -> Void) {
        guard !origin.isEmpty, !key.isEmpty, let url = URL(string: origin + path) else { done(0); return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if !appId.isEmpty { req.setValue(appId, forHTTPHeaderField: "X-Morvero-App-Id") }
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: req) { _, resp, _ in
            done((resp as? HTTPURLResponse)?.statusCode ?? 0)
        }.resume()
    }
}
