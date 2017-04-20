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

const os = require('os');
const events = require('events');
const stream = require('stream');
const fs = require('fs');
const ProgressStream = require('./progress-stream');
const Pipage = require('pipage');
const BlockMap = require('blockmap');
const BlockWriteStream = require('./block-write-stream');
const ChecksumStream = require('./checksum-stream');
const diskpart = require('diskpart');
const debug = require('debug')('image-writer');

class ImageWriter extends events.EventEmitter {

  constructor(options) {

    super();

    this.source = options.image;
    this.target = {
      fd: options.fd,
      path: options.path,
      flags: options.flags,
      mode: options.mode
    }

    this.verifyChecksums = !!options.verify;
    this.blockMap = null;

    if(this.source.transform instanceof stream.PassThrough) {
      this.source.transform = null;
    }

    if(this.source.bmap) {
      debug('bmap')
      this.blockMap = BlockMap.parse(this.source.bmap);
    }

    this.on('step', (name) => {
      debug('step', name )
    })

    this.run()

    debug('target', this.target)

  }

  run() {

    let tasks = [
      ( next ) => {
        this.emit('step', 'clean')
        this.clean(next);
      },
      ( next ) => {
        this.emit('step', 'flash')
        const stream = this.flash()
          .on('end', next)
          .on('error', next)
      },
      ( next ) => {
        this.emit('step', 'verify')
        if(!this.verifyChecksums) return next();
        const stream = this.verify()
          .on('end', next)
          .on('error', next)
      },
    ];

    var run = ( error ) => {
      if( error ) return this.emit('error', error);
      var task = tasks.shift()
      task ? task(run) : this.emit('end', {
        sourceChecksum: this.sourceChecksum
      })
    }

    run()

  }

  clean( next ) {

    if(os.platform() !== 'win32') {
      return next();
    }

    const match = this.target.path.match(/PHYSICALDRIVE(\d+)/i);
    const deviceId = match && match[1];
    const script = [
      'rescan',
      'select disk ' + deviceId,
      'clean',
      'clean',
      'rescan'
    ];

    debug('diskpart', script.join(';') )
    diskpart.evaluate(script, next );

  }

  flash() {

    var pipeline = new Pipage(null, {
      objectMode: true,
      readableObjectMode: true,
      writableObjectMode: true,
    });

    if(this.verifyChecksums) {
      const checksumStream = new ChecksumStream({
        algorithms: [ 'crc32' ]
      });
      pipeline.append(checksumStream);
      checksumStream.on('checksum', (checksum) => {
        this.sourceChecksum = checksum.crc32
        this.emit('checksum', checksum)
      })
    }

    if(this.source.transform) {
      debug('transform')
      pipeline.prepend(this.source.transform)
    }

    const progressStream = new ProgressStream({
      length: this.source.size.original,
      type: 'write'
    });

    progressStream.on('progress', (state) => this.emit('progress', state))

    if(this.source.size.final.estimation) {
      debug('progress:prepend')
      pipeline.prepend(progressStream);
    } else {
      debug('progress:append')
      progressStream._byteLength = this.source.size.final.value
      pipeline.append(progressStream);
    }

    if(this.blockMap) {
      debug('bmap:filter')
      pipeline.append(new BlockMap.FilterStream(this.blockMap, { objectMode: true }));
    }

    const writeStream = new BlockWriteStream(this.target);
    // fs.createWriteStream(this.target.path, this.target);

    pipeline.bind(this.source.stream, 'error');
    pipeline.bind(writeStream, 'error');

    this.source.stream
      .on('end', () => { debug( 'source:end' ) })
      .pipe(pipeline)
      .on('finish', () => { debug( 'pipeline:finish' ) })
      .on('end', () => { debug( 'pipeline:end' ) })
      .pipe(writeStream);
      // .on('end', () => { debug( 'end' ) })
      // .on('finish', () => { debug( 'finish' ) })
      // .on('readable', function() {
      //   debug('readable')
      //   let chunk = null
      //   while(chunk = this.read()) {
      //     // debug('read', chunk.length)
      //   }
      // })

    debug( 'pipeline', pipeline )

    return pipeline;

  }

  verify() {

    var pipeline = new Pipage();

    // progressStream.on('progress', (state) => this.emit('progress', state))
    process.nextTick(() => pipeline.end())

    return pipeline.resume();

  }

}

module.exports = ImageWriter
