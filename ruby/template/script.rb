require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)

require 'yaml'

# require stdlib modules here. added some common ones below that can just
# be uncommented.

# require 'yaml'
# require 'csv'
# require 'rexml'
# require 'fileutils'


BASE_PATH = Pathname.new(File.expand_path('../', __FILE__))
AUTH      = YAML.load_file(BASE_PATH.join('credentials.yml'))

# The 'desk' method below returns the client that we will use to issue requests
# to the Desk API
def desk
  @desk ||= DeskApi::Client.new(DESK_API)
end


def method_to_be_called_by_task
  puts "Normally this would be a custom script, but hey, this is just a template"
end

class Tasks < Thor
  namespace :script

  desc 'some_task', 'do something'
  def some_task
    method_to_be_called_by_task
  end
end
