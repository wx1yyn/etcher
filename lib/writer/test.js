const UDIF = require('udif')
const stream = require('stream')
const path = require('path')
const fs = require('fs')
// const mountutils = require('mountutils');
const ImageWriter = require('./index')
const debug = require('debug')('test')

// const imageFile = '/Users/Jonas/Downloads/Etcher-1.0.0-rc.2-darwin-x64.dmg'
const imageFile = 'F:\\Disk Images\\Mac OS Sierra 10.12.3 - InstallESD.dmg'
// const imageFile = 'F:\\Disk Images\\2017-03-02-raspbian-jessie-lite.zip'
const diskPath = '\\\\.\\PhysicalDrive3'

UDIF.getUncompressedSize( imageFile, ( error, uncompressedSize ) => {

  if( error ) throw error;

  // mountutils.unmountDisk(diskPath, (error) => {

    // if( error ) throw error;

    var iw = new ImageWriter({
      // path: '/dev/rdisk2',
      path: diskPath,
      flags: 'rs+',
      verify: true,
      image: {
        stream: fs.createReadStream(imageFile),
        transform: new stream.PassThrough(),
        size: {
          original: fs.statSync(imageFile).size,
          final: {
            estimation: true,
            value: uncompressedSize
          }
        }
      }
    })

    iw.on('progress', (state) => {
      var speed = state.speed / 1024 / 1024
      var avg = state.avgSpeed / 1024 / 1024
      debug('speed', `${speed.toFixed(1)} MB/s (${avg.toFixed(1)} MB/s)` )
      debug('eta', `${( state.eta / 60 ).toFixed()} min` )
    })

    iw.on('done', () => debug('done'))
    iw.on('end', () => debug('end'))
    iw.on('finish', () => debug('finish'))

  // })

})
