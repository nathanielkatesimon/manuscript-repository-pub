require "minitest/autorun"
require "yaml"
require "erb"

class SolidCableConfigurationTest < Minitest::Test
  def test_development_action_cable_uses_solid_cable_database
    project_root = File.expand_path("../..", __dir__)
    cable_config = YAML.safe_load(ERB.new(File.read(File.join(project_root, "config/cable.yml"))).result)
    database_config = YAML.safe_load(ERB.new(File.read(File.join(project_root, "config/database.yml"))).result, aliases: true)

    assert_equal "solid_cable", cable_config.dig("development", "adapter")
    assert_equal "cable", cable_config.dig("development", "connects_to", "database", "writing")
    assert_equal "manuscript_respository_backend_development_cable", database_config.dig("development", "cable", "database")
  end
end
