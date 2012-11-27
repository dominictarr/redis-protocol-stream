//
var through = require('through')
var Buffer  = require('buffer').Buffer
var Parser = require('redis/lib/parser/javascript').Parser

exports.stringify = function () {

  return through(function (ary) {
    var self = this
    self.queue(new Buffer('*'+ary.length+'\r\n'))
    ary.forEach(function (chunk) {
      if(Buffer.isBuffer(chunk)) {
        //avoid turning a buffer into a string unnecessarily.
        self.queue(new Buffer('$'+chunk.length + '\r\n')).queue(chunk).queue(new Buffer('\r\n'))
      } else {      
        self.queue(new Buffer('$'+chunk.length + '\r\n' + chunk + '\r\n'))
      }
    })
  })

}

exports.parse = function (opts) {
  opts = opts || {return_buffers: true}
  opts.return_buffers = opts.return_buffers || opts.buffers
  var parser = new Parser(opts), ts
  parser.on('reply', function (data) {
    ts.queue(data)
  })
  return ts = through(function (data) {
    parser.execute(data)
  })
}
