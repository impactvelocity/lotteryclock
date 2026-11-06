Pod::Spec.new do |s|
  s.name           = 'LotteryAlarm'
  s.version        = '1.0.0'
  s.summary        = 'AlarmKit bridge for LotteryClock'
  s.description    = 'Schedules real iOS alarms (AlarmKit, iOS 26+) for LotteryClock.'
  s.author         = 'LotteryClock'
  s.homepage       = 'https://github.com/'
  s.license        = 'MIT'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  # Weak, so the app still launches on iOS versions without AlarmKit.
  s.weak_frameworks = 'AlarmKit'

  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
