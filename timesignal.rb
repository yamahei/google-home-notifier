require 'yaml'
require "open-uri"
require "net/http"# not "https"
require 'optparse'
require 'date'

#######
# init
opt = {
    # jiho time
    :now => DateTime.now.strftime("%H:%M"),
}
OptionParser.new do |_opt|
    _opt.on('-c', '--config=VALUE') {|v| opt[:config] = v }
    _opt.on('-n', '--now=VALUE') {|v| opt[:now] = v }
    _opt.parse!(ARGV)
end
p opt
INNER_URL = "http://localhost:8091"#
CONFIG = opt[:config] || File.expand_path("../timesignal.yaml", __FILE__)
yaml = YAML.load_file(CONFIG)

######
# jiho
yaml.select{|line|
    line["at"] == opt[:now]
}.each{|line|
    p line
    res = Net::HTTP.post_form(
        URI.parse("#{INNER_URL}/google-home-notifier"),
        { 'text' => line['message'], 'names' => line['fn'] }
    )
}
