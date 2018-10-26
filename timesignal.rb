require 'yaml'
require "open-uri"
require "net/http"# not "https"
require 'optparse'
require 'date'

GUID = ""# your guid then send outer-url
AUTO_SEND_INTERVAL_MIN = 5
#######
# init
opt = {
    # jiho time
    :now => DateTime.now.strftime("%H:%M"),
    # if true, not jiho
    :no_jiho => false,
    # if true, not send url to heroku
    :no_send_url => (DateTime.now.min % AUTO_SEND_INTERVAL_MIN) != 0,
}
OptionParser.new do |_opt|
    _opt.on('-c', '--config=VALUE') {|v| opt[:config] = v }
    _opt.on('-n', '--now=VALUE') {|v| opt[:now] = v }
    _opt.on('-N', '--no-signal'){|v| opt[:no_jiho] = true }
    _opt.on('-S', '--no-send-outer-url') {|v| opt[:no_send_url] = true }
    _opt.parse!(ARGV)
end
p opt
INNER_URL = "http://localhost:8091"#
CONFIG = opt[:config] || File.expand_path("../timesignal.yaml", __FILE__)
yaml = YAML.load_file(CONFIG)

######
# jiho
unless opt[:no_jiho] then
    yaml.select{|line|
        line["at"] == opt[:now] ? !opt[:no_jiho] : false
    }.each{|line|
        p line
        res = Net::HTTP.post_form(
            URI.parse("#{INNER_URL}/google-home-notifier"),
            { 'text' => line['message'], 'names' => line['fn'] }
        )
    }
end

##################
# regist outer-url
unless opt[:no_send_url] && !GUID.empty? then
    OUTER_URL = open("#{INNER_URL}/google-home-outerurl", "r"){|response| 
        response.read
    }
    TUNNEL_URL = "https://gh-tunnel.herokuapp.com"
    unless OUTER_URL.empty? then
        res = Net::HTTP.post_form(
            URI.parse("#{TUNNEL_URL}/regist/#{GUID}"),
            { 'url' => OUTER_URL }
        )
    end
end
