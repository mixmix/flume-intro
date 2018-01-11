var Flume = require('flumedb')
var FlumeLog = require('flumelog-offset')
var codec = require('flumecodec')
var pull = require('pull-stream')

var FlumeView = require('flumeview-reduce')

var log = FlumeLog('demo_log', { codec: codec.json })

var db = Flume(log)
  .use('stats', FlumeView(
    2,  //version
    (acc, val) => { // reducer, 
      console.log('+')
      return {
        sum: acc.sum + val,
        squareSum: acc.squareSum + val*val
      }
    },
    (msg) => msg.count, // map, 
    null,  // codec
    { 
      sum: 0,
      squareSum: 0
    } //initial
  ))
  // .use('someOtherView', otherView)


// writing pull-stream
pull(
  pull.values([1,2,3,4,5,6,7]),
  pull.asyncMap((val, cb) => setTimeout(
    () => cb(null, val), 
    500
  )),
  pull.drain(
    val => db.append({ count: val }, (err, seq) => {
      console.log(`FlumeDB.append: appended '${val}' at offset of ${seq} bytes`)
      console.log()
    }),
    () => console.log('DONE: append stream')
  )
)

