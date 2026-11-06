import ExpoModulesCore
import SwiftUI
#if canImport(AlarmKit)
import AlarmKit
#endif

/// What JS sends to schedule one alarm.
struct AlarmOptions: Record {
  /// A UUID string; generated in JS so the app can store it before scheduling.
  @Field var id: String = ""
  /// When it rings, epoch milliseconds.
  @Field var fireDateMs: Double = 0
  /// Shown on the Lock Screen / Dynamic Island while it rings.
  @Field var title: String = "Wake up"
  /// Rang early: the snooze lasts this long and ends exactly at the target time.
  @Field var snoozeSeconds: Double? = nil
  @Field var snoozeLabel: String = "Snooze"
  /// While snoozing, the countdown's title.
  @Field var countdownTitle: String = "Snoozing"
  /// The theme colour, "#RRGGBB".
  @Field var tintHex: String = "#FFC03D"
}

#if canImport(AlarmKit)
@available(iOS 26.0, *)
struct LotteryAlarmMetadata: AlarmMetadata {}
#endif

/// Bridges AlarmKit (iOS 26+) so LotteryClock can schedule real alarms: they ring through
/// Silent mode and Focus, show on the Lock Screen, and survive the app being killed.
public class LotteryAlarmModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LotteryAlarm")

    /// Whether this OS has AlarmKit at all.
    Function("isSupported") { () -> Bool in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) { return true }
      #endif
      return false
    }

    /// "authorized" | "denied" | "notDetermined" | "unsupported"
    Function("authorizationState") { () -> String in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) {
        return Self.describe(AlarmManager.shared.authorizationState)
      }
      #endif
      return "unsupported"
    }

    AsyncFunction("requestAuthorization") { () async throws -> String in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) {
        let state = try await AlarmManager.shared.requestAuthorization()
        return Self.describe(state)
      }
      #endif
      return "unsupported"
    }

    AsyncFunction("schedule") { (options: AlarmOptions) async throws -> String in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) {
        return try await Self.schedule(options)
      }
      #endif
      throw Exception(name: "Unsupported", description: "AlarmKit needs iOS 26 or later")
    }

    AsyncFunction("cancel") { (id: String) throws in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) {
        guard let uuid = UUID(uuidString: id) else { return }
        // Already gone (rang and stopped, or never scheduled) is fine.
        try? AlarmManager.shared.cancel(id: uuid)
      }
      #endif
    }

    /// The app's alarms that AlarmKit still knows about: [{ id, state }].
    Function("list") { () -> [[String: String]] in
      #if canImport(AlarmKit)
      if #available(iOS 26.0, *) {
        let alarms = (try? AlarmManager.shared.alarms) ?? []
        return alarms.map { ["id": $0.id.uuidString, "state": Self.describe($0.state)] }
      }
      #endif
      return []
    }
  }

  #if canImport(AlarmKit)
  @available(iOS 26.0, *)
  private static func describe(_ state: AlarmManager.AuthorizationState) -> String {
    switch state {
    case .authorized: return "authorized"
    case .denied: return "denied"
    case .notDetermined: return "notDetermined"
    @unknown default: return "notDetermined"
    }
  }

  @available(iOS 26.0, *)
  private static func describe(_ state: Alarm.State) -> String {
    switch state {
    case .scheduled: return "scheduled"
    case .countdown: return "countdown"
    case .paused: return "paused"
    case .alerting: return "alerting"
    @unknown default: return "unknown"
    }
  }

  @available(iOS 26.0, *)
  private static func schedule(_ o: AlarmOptions) async throws -> String {
    let manager = AlarmManager.shared
    if manager.authorizationState == .notDetermined {
      _ = try await manager.requestAuthorization()
    }
    guard manager.authorizationState == .authorized else {
      throw Exception(name: "NotAuthorized", description: "Alarms are not allowed for LotteryClock")
    }

    let id = UUID(uuidString: o.id) ?? UUID()
    let tint = Color(hex: o.tintHex)
    let fireDate = Date(timeIntervalSince1970: o.fireDateMs / 1000)
    let snooze = (o.snoozeSeconds ?? 0) > 0 ? o.snoozeSeconds : nil

    // Rang early: a Snooze button whose countdown ends exactly at the target time.
    // Rang late or on time: no snooze, just Stop.
    let snoozeButton = snooze.map { _ in
      AlarmButton(text: LocalizedStringResource(stringLiteral: o.snoozeLabel), textColor: .white, systemImageName: "zzz")
    }
    let title = LocalizedStringResource(stringLiteral: o.title)
    let alert: AlarmPresentation.Alert
    if #available(iOS 26.1, *) {
      alert = AlarmPresentation.Alert(
        title: title,
        secondaryButton: snoozeButton,
        secondaryButtonBehavior: snooze == nil ? nil : .countdown
      )
    } else {
      alert = AlarmPresentation.Alert(
        title: title,
        stopButton: AlarmButton(text: "Stop", textColor: .white, systemImageName: "stop.circle"),
        secondaryButton: snoozeButton,
        secondaryButtonBehavior: snooze == nil ? nil : .countdown
      )
    }
    let presentation = AlarmPresentation(
      alert: alert,
      countdown: snooze == nil ? nil : AlarmPresentation.Countdown(title: LocalizedStringResource(stringLiteral: o.countdownTitle))
    )
    let attributes = AlarmAttributes<LotteryAlarmMetadata>(
      presentation: presentation,
      metadata: LotteryAlarmMetadata(),
      tintColor: tint
    )
    let config = AlarmManager.AlarmConfiguration<LotteryAlarmMetadata>(
      countdownDuration: snooze.map { Alarm.CountdownDuration(preAlert: nil, postAlert: $0) },
      schedule: .fixed(fireDate),
      attributes: attributes
    )
    let alarm = try await manager.schedule(id: id, configuration: config)
    return alarm.id.uuidString
  }
  #endif
}

private extension Color {
  init(hex: String) {
    let s = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
    var v: UInt64 = 0
    Scanner(string: s).scanHexInt64(&v)
    self.init(
      red: Double((v >> 16) & 0xFF) / 255,
      green: Double((v >> 8) & 0xFF) / 255,
      blue: Double(v & 0xFF) / 255
    )
  }
}
