const {Transform} = require('stream')

const Backpressurify = require('..')


test('basic', function(done)
{
  const expected = 'asdf'

  let step = 0

  const duplex = new Transform({
    objectMode: true,
    transform(chunk, _, callback)
    {
      switch(step)
      {
        case 1:
          expect(chunk).toBe(expected)
        break;

        default:
          expect(chunk).toBe('uncork')
      }

      step++

      callback(null, chunk)
    }
  })

  new Backpressurify(duplex)
  .on('data', function(data)
  {
    expect(data).toBe(expected)

    done()
  })
  .write(expected)
})
