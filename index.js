const {Duplex} = require('stream')


module.exports = class Backpressurify extends Duplex
{
  constructor(duplex, options)
  {
    super({...options, objectMode: true})

    this._duplex = duplex

    this.cork()

    const uncork = () => process.nextTick(this.uncork.bind(this))

    duplex.on('close', this.close.bind(this))
    duplex.on('end'  , this.push.bind(this, null))
    duplex.on('error', this.emit.bind(this, 'error'))
    duplex.on('data' , data =>
    {
      switch(data)
      {
        case 'cork'  : return this.cork()
        case 'uncork': return uncork()
      }

      if(!this.push(message)) this._write('cork')
    })
    duplex.on('drain', uncork)

    this.on('finish', duplex.end .bind(duplex))
    this.on('pipe'  , duplex.emit.bind(duplex, 'pipe'))
    this.on('unpipe', duplex.emit.bind(duplex, 'unpipe'))
  }

  _destroy(err, callback)
  {
    this._duplex.destroy(err)

    callback()
  }

  _read()
  {
    this._write('uncork')
  }

  _write(data, encoding, callback)
  {
    if(!this._duplex.write(data, encoding, callback)) this.cork()
  }
}
