const Flume = require('flumedb')
const FlumeLog = require('flumelog-offset')
const codec = require('flumecodec')
const FlumeView = require('flumeview-reduce')

const log = FlumeLog('demo_log', { codec: codec.json })
const db = Flume(log)


db.append({ message: 'hi scuttlers' }, (err, data) => {
  if (err) throw err

  console.log(data)
})
