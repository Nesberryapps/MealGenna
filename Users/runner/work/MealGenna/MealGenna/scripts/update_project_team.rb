
require 'xcodeproj'

project_path = 'ios/App/App.xcodeproj'
team_id = ENV['DEVELOPMENT_TEAM']

unless team_id
  puts "DEVELOPMENT_TEAM environment variable not set."
  exit 1
end

project = Xcodeproj::Project.open(project_path)

project.targets.each do |target|
  puts "Updating target: #{target.name}"
  target.build_configurations.each do |config|
    config.build_settings['DEVELOPMENT_TEAM'] = team_id
  end
end

project.save
puts "Successfully updated project with Development Team ID: #{team_id}"
