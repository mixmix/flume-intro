const Flume = require('flumedb')
const FlumeLog = require('flumelog-offset')
const codec = require('flumecodec')
const FlumeView = require('flumeview-reduce')

const pull = require('pull-stream')

const log = FlumeLog('demo_log', { codec: codec.json })
const db = Flume(log)

db.get(62, console.log)

pull(
  db.stream(), // source
  pull.map(msg => msg.value.message),
  pull.drain(msg => { // sink
    console.log(msg)
  })
)


