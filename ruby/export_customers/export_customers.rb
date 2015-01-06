require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)

require 'yaml'
require 'csv'

# require stdlib modules here. added some common ones below that can just
# be uncommented.

# require 'csv'
# require 'rexml'
# require 'fileutils'


BASE_PATH = Pathname.new(File.expand_path('../', __FILE__))
AUTH      = YAML.load_file(BASE_PATH.join('credentials.yml'))

# Configure DeskApi
DeskApi.configure do |config|
  AUTH.each { |k,v| config.send("#{k}=", v) }
end

def new_progress(title, total, starting_at=0)
  ProgressBar.create({
                       format:         ("%t".center(10) + "%a |%e %bᗧ%i %c/%C | %p%%"),
                       progress_mark:  ' ',
                       remainder_mark: '･',
                       starting_at:    starting_at,
                       total:          total,
                       title:          title
                     })
end

def warn_export_limit(total_entries)
  puts <<-EOT
  You have #{total_entries} customers
  
  Due to pagination limitations on the customers endpoint, only the first 50_000 customers will be included in the export.
  
  Please contact support@desk.com for information on what options are available to export greater than 50_000 customers.
  EOT
end

def row_from_customer(customer)
  customer.
    to_hash.
    reject { |k,v| k.start_with?('_') }.
    tap do |source|
      custom_fields = source.delete('custom_fields')
      source.merge!(Hash[custom_fields.map { |k,v| ["custom_#{k}", v] }]) if custom_fields.any?

      ['emails', 'phone_numbers', 'addresses'].each do |data|
        values     = source.delete(data).map { |entry| entry['value'] }
        entries    = (values + Array.new(10-values.size, ""))
        attributes = Hash[entries.map.with_index { |e, i| ["#{data}_#{i}", e] }]
        source.merge! attributes
      end
    end
end

def export_customers
  customers = DeskApi.customers.per_page(100)
  progress = new_progress('customers export', [customers.total_entries, 50_000].min)

  if customers.total_entries > 50_000
    warn_export_limit(customers.total_entries)
  end

  export_path    = "./#{Time.now.to_date}_customer_export.csv"
  export_headers = {
                     headers:      true,
                     quote_char:   '"',
                     force_quotes: true
                   }

  CSV.open(export_path, "w+", export_headers) do |export|
    customers.all do |customer|
      data = row_from_customer(customer)
      export << data.keys if export.lineno == 0
      export << data.values
      progress.increment
    end
  end
end

class Tasks < Thor
  namespace :export

  desc 'customers', 'export customers to CSV'
  def customers
    export_customers
  end

  desc 'console', 'start a pry console'
  def console
    Pry.start
  end
end
