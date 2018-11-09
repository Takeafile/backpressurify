# backpressurify

[![Greenkeeper badge](https://badges.greenkeeper.io/Takeafile/backpressurify.svg)](https://greenkeeper.io/)

Wrapper for `Duplex` stream objects to ensure they respect back-pressure

This module add support for back-pressure on `Duplex` stream objects that don't
support it, sending in-wire messages to control the flow. It's specially useful
for network streams to notify the sender end to pause or resume sending info in
case the receiver can't be able to process them as fast, so there's no need to
collapse the network.


## Install

```
npm install backpressurify
```

## API

- *duplex*: `Duplex` stream object to be wrapped
- *options*: options passed to the parent `Duplex` constructor
