var Flume = require('flumedb')
var FlumeLog = require('flumelog-offset')
var codec = require('flumecodec')
var FlumeReduce = require('flumeview-reduce')
var pull = require('pull-stream')
var path = require('path')

var log = FlumeLog(path.join(__dirname, 'flumelog'), { 
  codec: codec.json
})

var flumeView = FlumeReduce(
  1.0, 
  //reducer
  (acc, val) => {
    if (!acc) acc = { sum: 0, sqSum: 0 }

    var newAcc = {
      sum: acc.sum + val,
      sqSum: acc.sqSum + val*val 
    }
    // console.log('FlumeView (in reducer): new state', newAcc)
    return newAcc
  },
  //map
  (entry) => entry.count
)

var db = Flume(log)
  .use('sumer', flumeView)

pull(
  db.stream({ live: true }),
  pull.drain(
    viewState => console.log('FlumeDB.stream:', viewState) 
  )
)

// this stream is returning mapped values (not map-reduced values D:)
pull(
  db.sumer.stream({ live: true }),
  pull.drain(
    viewState => console.log('FlumeView.stream:', viewState), 
    () => console.log('DONE: view stream')
  )
)

pull(
  pull.values([1,2,3,4,5,6,7]),
  pull.asyncMap((val, cb) => setTimeout(
    () => cb(null, val), 
    500
  )),
  pull.drain(val => db.append({ count: val }, (err, seq) => {
    console.log(`FlumeDB.append: appended '${val}' at offset of ${seq} bytes`)

    db.sumer.get((err, finalState) => {
      console.log()
      console.log('FlumeView State:', finalState)
      console.log()
    })
  }))
)


