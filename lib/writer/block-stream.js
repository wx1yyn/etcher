/*
 * Copyright 2017 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const stream = require( 'stream' )
const debug = require( 'debug' )( 'block-stream' )

class BlockStream extends stream.Transform {

  constructor( options ) {
    options = Object.assign( {}, BlockStream.defaults, options )
    options.readableObjectMode = true
    super(options)
    this.blockSize = options.blockSize
    this._chunk = Buffer.alloc(0)
  }

  _transform(chunk, encoding, next) {

    // debug( 'transform', chunk.length )

    if( !this._chunk.length && chunk.length === this.blockSize ) {
      this.push(chunk)
      return next()
    }

    chunk = Buffer.concat([ this._chunk, chunk ])

    let block = Buffer.alloc( this.blockSize )
    let offset = 0

    while( chunk.length - offset >= this.blockSize ) {
      chunk.copy( block, 0, offset, offset + this.blockSize )
      this.push( block )
      offset += this.blockSize
    }

    this._chunk = chunk.slice( offset )

    next()

  }

  _flush(done) {

    debug( 'flush' )

    if( this._chunk && this._chunk.length ) {
      debug( 'trail', this._chunk.length )
      const block = Buffer.alloc( this.blockSize, 0 )
      this._chunk.copy( block )
      this._chunk = null
      this.push( block )
    }

    done()

  }

}

BlockStream.defaults = {
  blockSize: 4096
}

module.exports = BlockStream
