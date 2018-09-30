require 'yaml'
require "open-uri"
require "net/https"

# init
INNER_URL = "http://localhost:8091/google-home-outerurl"
CONFIG = File.expand_path("../timesignal.yaml", __FILE__)
yaml = YAML.load_file(CONFIG)
now = DateTime.now.strftime("%H:%M")

# search lines
lines = yaml.select{|line|
    line["at"] == now ? true : false
}
exit if lines.length <= 0

# request
p now
outer_url = open(url, "r"){|response| 
    response.read
}
lines.each{|line|
    p line
    uri = URI.parse("#{outer_url}/google-home-notifier")
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
