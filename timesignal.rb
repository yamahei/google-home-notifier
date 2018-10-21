require 'yaml'
require "open-uri"
require "net/https"
require 'optparse'

#######
# init
opt = {
    # jiho time
    :now => DateTime.now.strftime("%H:%M"),
    # if true, not jiho
    :no_jiho => false,
    # if true, not send url to heroku
    :no_send_url => false,
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

##################
# regist outer-url
unless opt[:no_send_url] then
    OUTER_URL = open("#{INNER_URL}/google-home-outerurl", "r"){|response| 
        response.read
    }
    #TODO: regist
end

######
# jiho
unless opt[:no_jiho] then
    yaml.select{|line|
        line["at"] == opt[:now] ? !option[:no_jiho] : false
    }.each{|line|
        p line
        uri = URI.parse("#{INNER_URL}/google-home-notifier")
        http = Net::HTTP.new(uri.host, uri.port)
        http.use_ssl = true
        http.verify_mode = OpenSSL::SSL::VERIFY_NONE

        req = Net::HTTP::Post.new(uri.path)
        req.set_form_data({
            'text' => line['message'], 
            'names' => line['fn']
        })
        res = http.request(req)
    }
end
