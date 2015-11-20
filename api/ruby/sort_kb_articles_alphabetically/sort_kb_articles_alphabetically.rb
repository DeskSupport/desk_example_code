require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)

require 'yaml'

BASE_PATH = Pathname.new(File.expand_path('../', __FILE__))
AUTH      = YAML.load_file(BASE_PATH.join('credentials.yml'))

# Configure DeskApi
DeskApi.configure do |config|
  AUTH.each { |k,v| config.send("#{k}=", v) }
end

class Tasks < Thor

  desc 'sort_articles', 'sort articles alphabetically by subject'
  def sort_articles
    topics = []
    DeskApi.topics.per_page(100).all { |t| topics << t }
    
    (topics.map { |topic|
      Thread.new do
        articles = []
        topic.articles.per_page(100).all { |a| articles << [a.subject, a.id] }
        Hash[articles.sort].values.each_with_index { |id,index| DeskApi.articles.find(id).update({position: index.succ}) }
      end
    }).each(&:join)
  end
end
