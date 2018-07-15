const {Duplex} = require('stream')


module.exports = class Backpressurify extends Duplex
{
  constructor(duplex, options)
  {
    super({...options, objectMode: true})

    const uncork = process.nextTick.bind(process, this.uncork.bind(this))

    this._remoteCorked = true

    this._duplex = duplex
    .once('close', this.destroy.bind(this))
    .once('end', this.push.bind(this, null))
    .on('error', this.emit.bind(this, 'error'))
    .on('data' , data =>
    {
      switch(data)
      {
        case 'cork'  : return this.cork()
        case 'uncork': return uncork()
      }

      if(!this.push(data))
      {
        this._remoteCorked = true
        this._write('cork')
      }
    })
    .on('drain', uncork)

    this.once('finish', duplex.end.bind(duplex))
    .on('pipe'  , duplex.emit.bind(duplex, 'pipe'))
    .on('unpipe', duplex.emit.bind(duplex, 'unpipe'))
    .cork()
  }

  _destroy(err, callback)
  {
    this._duplex.destroy(err)

    callback()
  }

  _read()
  {
    if(this._remoteCorked)
    {
      this._remoteCorked = false
      this._write('uncork')
    }
  }

  _write(data, encoding, callback)
  {
    if(!this._duplex.write(data, encoding, callback)) this.cork()
  }
}
