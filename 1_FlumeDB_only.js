var Flume = require('flumedb')
var FlumeLog = require('flumelog-offset')
var codec = require('flumecodec')
var pull = require('pull-stream')
var path = require('path')

var log = FlumeLog(path.join(__dirname, 'flumelog'), { 
  codec: codec.json
})

var db = Flume(log)

pull(
  db.stream({ live: true }),
  pull.drain(
    viewState => {
      console.log('FlumeDB.stream:', viewState)
      console.log()
    }, 
    () => console.log('DONE: db stream')
  )
)

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

