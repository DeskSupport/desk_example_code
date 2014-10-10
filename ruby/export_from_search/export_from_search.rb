require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)

require 'yaml'
require 'csv'

# require stdlib modules here. added some common ones below that can just
# be uncommented.

# require 'yaml'
# require 'csv'
# require 'rexml'
# require 'fileutils'


BASE_PATH = Pathname.new(File.expand_path('../', __FILE__))
AUTH      = YAML.load_file(BASE_PATH.join('credentials.yml'))

DeskApi.configure do |config|
  AUTH.each { |k,v| config.send("#{k}=", v) }
end

def export_search
  puts "Normally this would be a custom script, but hey, this is just a template"
end

class Ticket
  attr_reader :resource, :data

  def initialize(resource)
    @resource = resource
  end

  def export
    {}.tap do |export_data|
      export_data.merge! TicketData.new(resource, ticket_custom_fields).export
      export_data.merge! CustomerData.new(resource.customer, customer_custom_fields).export
      export_data.merge! CompanyData.new(resource.customer.company, company_custom_fields).export
    end
  end

  def ticket_custom_fields
    @ticket_custom_fields ||= DeskApi.
                                custom_fields.
                                per_page(100).
                                entries.
                                select! { |f| f.type == 'ticket' }.
                                map!    { |f| f.name }
  end

  def customer_custom_fields
    @ticket_custom_fields ||= DeskApi.
                                custom_fields.
                                per_page(100).
                                entries.
                                select! { |f| f.type == 'customer' }.
                                map!    { |f| f.name }
  end

  def company_custom_fields
    @company_custom_fields ||= DeskApi.
                                 custom_fields.
                                 per_page(100).
                                 entries.
                                 select! { |f| f.type == 'company' }.
                                 map!    { |f| f.name }
  end


  TicketData = Struct.new(:ticket, :custom_fields) do

    def export
      {}.tap do |data|

        {
          'Case #'                 => '.id',
          'Case Subject'           => '.subject',
          'Case Description'       => '.description',
          'Priority'               => '.priority',
          'Channel'                => '.type',
          'Case Status'            => '.status',
          'Assigned Agent'         => '.assigned_user.name if ticket.assigned_user',
          'Assigned Group'         => '.assigned_group.name if ticket.assigned_group',
          'Created At'             => '.created_at',
          'Modified At'            => '.changed_at',
          'First Opened At'        => '.first_opened_at',
          'First Resolved At'      => '.first_resolved_at',
          'Resolved At'            => '.resolved_at',
          'Labels'                 => '.labels.entries.map { |l| l.name }.join(", ") if ticket.labels.entries.any?',
          'Language'               => '.language',
          'Body'                   => '.message.body'
        }.each do |field, op|
          data[field] = eval("ticket#{op}")
        end

        replies = []
        ticket.
          replies.
          per_page(100).
          all { |r| replies.push(r.to_hash) unless ['failed', 'draft'].include?(r.status) }

        {
          'Inbound Messages'       => '.count { |reply| reply["direction"] == "in" } || 0',
          'Outbound Messages'      => '.count { |reply| reply["direction"] == "out" } || 0',
          'Last In'                => '.select { |r| r["direction"] == "in" }.map { |r| r["updated_at"] }.max',
          'Last Out'               => '.select { |r| r["direction"] == "out" }.map { |r| r["updated_at"] }.max',
          'Last Message Direction' => '.max_by { |r| r["updated_at"] }["direction"]',
          'Time of First Response' => '.select { |r| r["direction"] == "out" }.map { |r| r["updated_at"] }.min'
        }.each do |field, op|
          data[field] = eval("replies#{op}") rescue nil
        end

        data['Last Message Direction'] ||= ticket.message.direction

        if ticket.message.direction == 'in'
          data['Inbound Messages'] += 1
          data['Last In'] ||= ticket.message.updated_at
        else
          data['Outbound Messages'] += 1
          data['Last Out'] ||= ticket.message.updated_at
          if data['Time of First Response'] > ticket.message.updated_at
            data['Time of First Response'] = ticket.message.updated_at
          end
        end

        data['Direct Case link'] = "https://#{AUTH[:subdomain]}.desk.com/agent/case/#{ticket.id}"

        custom_fields.each do |field, value|
          data["case_custom_#{field}"] = value
        end
      end
    end
  end

  CustomerData = Struct.new(:customer, :custom_fields) do

    def export
      {}.tap do |data|
        {
          'First Name'    => '.first_name',
          'Last Name'     => '.last_name',
          'Email Address' => '.emails.first["value"] if customer.emails.any?',
          'Phone Number'  => '.phone_numbers.first["value"] if customer.phone_numbers.any?',
          'Address'       => '.addresses.first["value"] if customer.addresses.any?'
        }.each do |field, op|
          data[field] = eval("customer#{op}")
        end

        custom_fields.each do |field, value|
          data["customer_custom_#{field}"] = value
        end
      end
    end
  end

  CompanyData = Struct.new(:company, :custom_fields) do

    def default_hash
      {'Company' => nil}.
        merge(Hash[custom_fields.map { |f| "company_custom_#{f}" }.zip([nil])])
    end

    def export
      if company.nil?
        return default_hash
      end

      {}.tap do |data|
        {
          'Company' => '.name'
        }.each do |field, op|
          data[field] = eval("company#{op}")
        end

        custom_fields.each do |field, value|
          data["company_custom_#{field}"] = value
        end
      end
    end
  end


end

class SearchExport
  attr_reader :query, :path, :data, :progress

  def initialize(query, filename)
    @query = query
    @path  = BASE_PATH.join('exports', filename)
    @data  = []
  end

  def search
    @search ||= DeskApi.
                  cases.
                  search(query).
                  embed(:message, :customer, :assigned_user, :assigned_group)
  end

  def run 
    puts "exporting cases"
    progress ||= ProgressBar.new(search.total_entries)
    begin
      search.
        entries.
        map  { |ticket| Ticket.new(ticket) }.
        each { |ticket| data.push(ticket.export) && progress.increment! }
    end while search.next!
  end

  def write
    puts "writing csv to #{path}"
    begin
      options = {
          headers:       :first_row,
          write_headers: :true,
          quote_char:    '"',
          force_quotes:  true,
          converters:    :all
        }

      CSV.open(path, 'w+', options) do |export|
        export << data.first.keys
        data.each { |datum| export << datum.values }
      end
    rescue Errno::ENOENT
      Dir.mkdir(BASE_PATH.join('exports'))
      retry
    end
  end
end

class Task < Thor
  namespace :export

  desc 'cases', 'export cases from a search'
  def cases(query, filename=nil)
    filename ||= Time.new.strftime("%Y%m%d_export.csv")
    export     = SearchExport.new(query, filename)
    export.run
    export.write
  end
end
