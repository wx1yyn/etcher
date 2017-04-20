const stream = require('stream');
const speedometer = require('speedometer');
const debug = require('debug')('progress-stream');

class ProgressStream extends stream.Transform {

  constructor(options) {

    options = options || {};
    // options.objectMode = true;
    // options.highWaterMark = 16;

    super({
      writableObjectMode: true,
      readableObjectMode: true,
    });

    this._eventType = options.type || null;
    this._byteLength = options.length || 0;
    this._timestep = options.time || 500;
    this._speedometer = speedometer(5);
    this._lastSpeed = 0;
    this.bytesRead = 0;
    this._timeStarted = 0;
    this._updateInterval = null;

    this._info = {
      type: this._eventType,
      percentage: ( this.bytesRead / this._byteLength ) * 100,
      transferred: this.bytesRead,
      length: this._byteLength,
      remaining: this._byteLength - this.bytesRead,
      eta: ( this._byteLength - this.bytesRead ) / this._speedometer(),
      runtime: ( Date.now() / 1000 ) - this._timeStarted,
      delta: this._speedometer() - this._lastSpeed,
      speed: this._speedometer(),
      avgSpeed: this.bytesRead / (( Date.now() / 1000 ) - this._timeStarted),
    }

  }

  _updateStats() {

    const speed = this._speedometer()

    this._info.percentage = ( this.bytesRead / this._byteLength ) * 100;
    this._info.transferred = this.bytesRead;
    this._info.length = this._byteLength;
    this._info.remaining = this._byteLength - this.bytesRead;
    this._info.eta = ( this._byteLength - this.bytesRead ) / speed;
    this._info.runtime = ( Date.now() / 1000 ) - this._timeStarted;
    this._info.delta = speed - this._lastSpeed;
    this._info.speed = speed;
    this._info.avgSpeed = this.bytesRead / (( Date.now() / 1000 ) - this._timeStarted);

    this._lastSpeed = speed;
    this._info.eta = this._info.eta = isFinite(this._info.eta) ?
      this._info.eta : Number.MAX_SAFE_INTEGER;

    this.emit('progress', this._info )

  }

  _startInterval() {
    debug('start')
    this._timeStarted = Date.now() / 1000
    this._updateInterval = setInterval(() => {
      this._updateStats()
    }, this._timestep )
    this._updateStats()
  }

  _transform(chunk, encoding, next) {
    if(!this._updateInterval) this._startInterval();
    this.bytesRead += chunk.length;
    this._speedometer(chunk.length);
    this.push(chunk);
    next();
  }

  _flush(done) {
    debug('flush')
    clearInterval(this._updateInterval);
    done();
  }

}

module.exports = ProgressStream
