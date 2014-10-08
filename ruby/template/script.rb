require 'rubygems'
require 'bundler'
Bundler.setup(:default)

require 'yaml'

# require stdlib modules here. added some common ones below that can just
# be uncommented.

# require 'yaml'
# require 'csv'
# require 'rexml'
# require 'fileutils'


BASE_PATH = Pathname.new(File.expand_path('../', __FILE__))
AUTH      = YAML.load_file(BASE_PATH.join('credentials.yml'))

# The 'desk' method returns the client that we will use to issue requests to the
# Desk API
def desk
  @desk ||= DeskApi::Client.new(DESK_API)
end
