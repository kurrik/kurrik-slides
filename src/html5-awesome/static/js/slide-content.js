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
function OrientationSlide(slide) {
  this._slide = slide;
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
  var overThreshold = Math.abs(evt.gamma) > 3 || Math.abs(evt.beta) > 3;
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
