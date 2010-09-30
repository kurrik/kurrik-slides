/**
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
 
/*******************************************************************************
 * ORIENTATION
 ******************************************************************************/
function OrientationSlide(slide) {
  this._slide = $(slide);
  this._lastBeta = 0;
  this._lastGamma = 0;
  
  var orientHandler = $.proxy(this, 'onOrient');
  $(this._slide).bind('focusslide', function(evt){
    $(window).bind('deviceorientation', orientHandler);
  }).bind('blurslide', function(evt) {
    $(window).unbind('deviceorientation', orientHandler);
  });
};

OrientationSlide.prototype.onOrient = function(evt) {
  evt = evt.originalEvent;
  var overThreshold = Math.abs(evt.gamma) > 4 || Math.abs(evt.beta) > 4;
  var gamma = overThreshold ? evt.gamma : 0; 
  var beta = overThreshold ? evt.beta : 0;
  
  if (this._lastGamma != gamma || this._lastBeta != beta) {
    var zindex = 0;
    $('.layer').each(function(index, elem) {
      zindex++;
      var x = Math.round(1.5 * gamma * zindex);
      var y = Math.round(1.5 * beta * zindex);
      $(elem).css('left', x.toString() + 'px')
             .css('top', y.toString() + 'px')
             .css('-webkit-transform', 'rotateY(' + -2.0 * gamma + 'deg) rotateX(' + -2.0 * beta + 'deg)');

    });
    this._lastGamma = gamma;
    this._lastBeta = beta;
  }
};

/*******************************************************************************
 * VIDEO CONTROLLER
 ******************************************************************************/
var VideoSlide = function(slide) {
  this._padding = 50;
  this._mouseX = 0;
  this._mouseY = 0;
  
  this._slide = $(slide);
  this._video = this._slide.find('video');
  this._video
      .bind('canplay', $.proxy(this, 'onVideoLoaded'))
      .bind('play', $.proxy(this, 'onPlayClicked'))
      .bind('ended', $.proxy(this, 'onEnded'));
  
  this._buttonPlay = this._slide.find('.playButton');
  this._buttonPlay
      .bind('click', $.proxy(this, 'onPlayClicked'))
      .addClass('hidden');
  
  this._buttonStop = this._slide.find('.stopButton');
  this._buttonStop
      .bind('click', $.proxy(this, 'onStopClicked'))
      .addClass('hidden');
  
  this._domVideo = this._video.get(0);
  if (this._domVideo.readyState == this._domVideo.HAVE_FUTURE_DATA) {
    this.onVideoLoaded();
  }
};

VideoSlide.prototype.onMouseMove = function(evt) {
  this._mouseX = evt.offsetX;
  this._mouseY = evt.offsetY;
};

VideoSlide.prototype.onEnded = function() {
  var src = this._domVideo.src;
  this._domVideo.src = src;
};

VideoSlide.prototype.onVideoLoaded = function() {
  this._width = this._domVideo.videoWidth;
  this._height = this._domVideo.videoHeight;  
  window.setTimeout($.proxy(this, 'initCanvas'), 10);
};

VideoSlide.prototype.initCanvas = function() {
  this._canvasOutput = $('<canvas></canvas>')
      .addClass('hidden')
      .bind('mousemove', $.proxy(this, 'onMouseMove'));
  var domOutput = this._canvasOutput.get(0);
  domOutput.width = this._width + (this._padding * 2);
  domOutput.height = this._height + (this._padding * 2);
  console.log('setting video dim', domOutput.width, domOutput.height);
  this._domVideo.parentNode.insertBefore(domOutput, this._domVideo);
  
  this._canvasBuffer = $('<canvas></canvas>').addClass('hidden');
  var domBuffer = this._canvasBuffer.get(0);
  domBuffer.width = this._width;
  domBuffer.height = this._height;
  
  this._contextOutput = domOutput.getContext('2d');
  this._contextBuffer = domBuffer.getContext('2d');   
  this._buttonPlay.removeClass('hidden');
};

VideoSlide.prototype.onPlayClicked = function() {
  this._domVideo.play();
  this._buttonPlay.addClass('hidden');
  this._video.addClass('hidden');
  this._buttonStop.removeClass('hidden');
  this._canvasOutput.removeClass('hidden');

  this.processEffectFrame();
  if (!this._interval) {
    this._frame = 0;
    this._interval = window.setInterval($.proxy(this, 'processEffectFrame'), 33);
  }
};

VideoSlide.prototype.onStopClicked = function() {
  this._domVideo.pause();
  this._buttonPlay.removeClass('hidden');
  this._video.removeClass('hidden');
  this._buttonStop.addClass('hidden');
  this._canvasOutput.addClass('hidden');

  window.clearInterval(this._interval);
  this._interval = null;
  this._frame = 0;
};

VideoSlide.prototype.processEffectFrame = function() {
  this._frame += 1;
  this._contextBuffer.drawImage(this._domVideo, 0 ,0);
  var domBuffer = this._canvasBuffer.get(0);
  var domOutput = this._canvasOutput.get(0);
  this._contextOutput.clearRect(0, 0, domOutput.width, domOutput.height);
  var tilesize = 32;
  var tilex = this._width / tilesize;
  var tiley = this._height / tilesize;
  var dw = tilesize;
  var dh = tilesize;
  var sw = tilesize;
  var sh = tilesize;
  for (var x = 0; x < tilex; x++) {
    for (var y = 0; y < tiley; y++) {
      var sx = x * tilesize;
      var sy = y * tilesize;
      var dx = sx + this._padding;
      var dy = Math.round(sy + Math.sin((this._mouseX + x) / 20.0) * 4.0 * x) +
               this._padding;

      this._contextOutput.drawImage(domBuffer, sx, sy, sw, sh, dx, dy, dw, dh);
    }
  }
};