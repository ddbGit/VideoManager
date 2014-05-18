// -------------
//## Auto Constructor
/**
 * Description: VideoManager, Auto Constructor (no need to use `new` keyword), to create instance
 * Appends DOM `video` tag to specified element in the DOM. And includes public methods for instance.
 *
 * @public
 *
 * @return {Object} new object instance
 */
VideoManager = ( function ( ) {
  // -------------
  //### Private

  var doc = document,

      /**
       * setElmAttributes
       *
       * @private
       *
       * @param {Element} elm: elm to attach attribute to
       * @param {String} name: attribute name
       * @param {String} value: value for attribute
       */
      setElmAttributes = function ( elm, name, value ) {
        var propFix = {
              'tabindex'        : 'tabIndex',
              'readonly'        : 'readOnly',
              'for'             : 'htmlFor',
              'class'           : 'className',
              'maxlength'       : 'maxLength',
              'cellspacing '    : 'cellSpacing',
              'cellpadding'     : 'cellPadding',
              'rowspan'         : 'rowSpan',
              'colspan'         : 'colSpan',
              'usemap'          : 'useMap',
              'frameborder'     : 'frameBorder',
              'contenteditable' : 'contentEditable'
            };

        if ( !name || name.constructor !== String ) {
          return;
        }

        name = propFix[name] || name;

        if ( value ) {
          if ( name === 'style' ) {
            elm.style.cssText = value;
          } else if ( elm.setAttribute ) {
            elm.setAttribute( name, value );
          } else {
            elm[ name ] = value;
          }
        }
      },

      /**
       * makeElement
       *
       * @private
       *
       * @param {String} nodeName: name of node
       * @param {Object} opts: options for node
       *
       * @return {Element}
       */
      makeElement = function ( nodeName, opts ) {
        var i    = 0,
            p    = '',
            text = '',
            elm  = doc.createElement( nodeName );

        if ( opts ) {
          if ( opts.children ) {
            while( opts.children[ i ] ) {
              elm.appendChild( opts.children[ i ] );
              i += 1;
            }
          }

          if ( opts.text ) {
            elm.appendChild( doc.createTextNode( opts.text ) );
          }

          for ( p in opts.attributes ) {
            setElmAttributes( elm, p, opts.attributes[p] );
          }
        }
        return elm;
      },

      /**
       * Collection of file types
       *
       * @private
       *
       * @return {Object}
       */
      getFileTypes = function ( ) {
        return {
          ogg  : { mimeType : 'video/ogg',  canPlayType : 'video/ogg; codecs="theora, vorbis"' },
          webm : { mimeType : 'video/webm', canPlayType : 'video/webm; codecs="vp8.0, vorbis"' },
          mp4  : { mimeType : 'video/mp4',  canPlayType : 'video/mp4; codecs="avc1.4D401E, mp4a.40.2"' }
        };
      },

      /**
       * Get Id name
       *
       * @private
       *
       * @param {String} idNamePrefix: id name prefix
       * @param {String} suffix: suffix for id name
       *
       * @return {String}
       */
      getIdName = function ( idNamePrefix, suffix ) {
        return idNamePrefix ? idNamePrefix + suffix : '';
      },

      /**
       * Check if callback is a function
       *
       * @private
       *
       * @param {Function} callback: function for callback
       *
       * @return {Function}
       */
      isCallback = function( callback ) {
        return ( typeof callback === 'function' ) ? callback : function ( ) { };
      },

      /**
       * Check if browser supports `video` tag
       *
       * @private
       *
       * @param {DOM Element} element: video element
       *
       * @return {Boolean}
       */
      isVideoSupported = function ( elm ) {
        return !!elm.canPlayType; // !! used so we get a Boolean value
      },

      /**
       * Set's `video` tag attribute `autoplay` value
       *
       * @private
       *
       * @param {DOM Element} element: video element
       * @param {Boolean} play: `true` will set attribute and value.
       */
      autoPlay = function ( elm, play ) {
        if ( play ) {
          elm.autoplay = true;
        }
      },

      /**
       * Set's `video` tag attribute `loop` value
       *
       * @private
       *
       * @param {DOM Element} element: video element
       * @param {Boolean} loop: `true` will set attribute and value.
       */
      loop = function ( elm, doLoop ) {
        if ( doLoop ) {
          elm.loop = true;
        }
      },

      /**
       * Reset timer
       *
       * @private
       */
      resetVideoPlaying = function ( ) {
        clearInterval( this.videoPlaying );
        this.videoPlaying = null;
      },

      /**
       * Check if source is at end and fire callback
       *
       * @private
       *
       * @param {DOM Element Property} ended: `video` property `ended`
       * @param {Function} fnEnded: callback function to fire when source is reached the end
       */
      playHeadAtEnd = function ( ended, fnEnded ) {
        if ( ended ) {
          resetVideoPlaying.call( this );
          fnEnded();
        }
      },

      /**
       * Check if source is has started and fire callback
       *
       * @private
       *
       * @param {Function} callback: callback function to fire when source has started
       */
      startPlayback = function ( callback ) {
        var that         = this,
            elmVid       = this.elmVid,
            fnDuring     = isCallback( callback.during ),
            fnEnded      = isCallback( callback.ended );

        if ( isVideoSupported( elmVid ) ) {
          if ( this.videoPlaying ) {
            resetVideoPlaying.call( this );
          }

          this.videoPlaying = setInterval( function ( ) {
            fnDuring( elmVid );
            playHeadAtEnd.call( that, elmVid.ended, fnEnded );
          }, 250 );
        }
      },

      /**
       * Builds HTML `video` tag and child tags and append to specified element in the DOM.
       *
       * @private
       *
       * @param {Object} cfg: configuration values
       *
       * Configuration
       * @param {DOM element} elm: DOM element to attach `video` tag to.
       * @param {String} width: pixel width of source.
       * @param {String} height: pixel height of source.
       * @param {Boolean} loop: `true` will loop source when finished.
       * @param {Boolean} autoplay: `true` will start playing source when available.
       * @param {String} video.mp4.url: URL to source file.
       * @param {String} video.ogg.url: URL to source file.
       * @param {String} video.webm.url: URL to source file.
       * @param {String} poster.url: URL to source file.
       * @param {String} poster.alt: text for `img` tag `alt` attribute.
       * @param {String} poster.title: text for `img` tag `title` attribute.
       * @param {String} idNamePrefix: Element `id` name prefix to use when adding `source` or `img` tags.  Will append the media type, to the id name
       * @param {Function} onPlayback.during: Called every 250 milliseconds while source is playing. ( Passes back `video` elm instance. )
       * @param {Function} onPlayback.ended: Called when source has ended.
       * @param {Function} onPlayback.notSupported: Called when browser does not support `video` tag ( Passes back `source` elm instance. )
       */
      build = function ( cfg ) {
        var elmSource    = this.elmSource,
            elmVid       = this.elmVid,
            elmVidWidth  = cfg.width,
            elmVidHeight = cfg.height,
            poster       = cfg.poster,
            onPlayback   = cfg.onPlayback,
            elmVidHolder = cfg.elm,
            idNamePrefix = cfg.idNamePrefix,
            p            = '',
            alt          = '',
            title        = '',
            fileTypes    = getFileTypes();

        if ( isVideoSupported( elmVid ) ) {
          elmVid.width  = elmVidWidth;
          elmVid.height = elmVidHeight;

          for ( p in fileTypes ) {
            if ( fileTypes.hasOwnProperty( p ) ) {
              if ( elmVid.canPlayType( fileTypes[ p ].canPlayType ) !== '' && cfg.video[ p ] ) {
                elmSource[ p ] = makeElement( 'source', { attributes : { 'src' : cfg.video[ p ].url, 'type' : fileTypes[ p ].mimeType, 'id' : getIdName( idNamePrefix, p ) } } );
                elmVid.appendChild( elmSource[ p ] );
              }
            }
          }

          elmVidHolder.appendChild( elmVid );
          autoPlay( elmVid, cfg.autoPlay );
          loop( elmVid, cfg.loop );
          elmVid.load();

          if ( onPlayback ) {
            startPlayback.call( this, onPlayback );
          }
        } else {
          if ( poster && poster.url ) {
            alt   = poster.alt   || alt;
            title = poster.title || title;

            this.elmImg = makeElement( 'img', { attributes : { 'src' : poster.url, 'width' : elmVidWidth, 'height' : elmVidHeight, 'title' : title, 'alt' : alt, 'id' : getIdName( idNamePrefix, 'poster' ) } } );
            elmVidHolder.appendChild( this.elmImg );
          }

          fnNotSupported = isCallback( onPlayback.notSupported );
          fnNotSupported( this.elmImg );

        }
      },

      /**
       * Create instance
       *
       * @private
       *
       * @return {Object} new object instance
       */
      VideoObj = function ( cfg ) {
        this.elmVid       = makeElement( 'video' );
        this.elmImg       = {};
        this.elmSource    = {};
        this.videoPlaying = null;

        build.call( this, cfg );
      };

  // -------------
  //### Public
  VideoObj.prototype = {
    /**
     * Description: Changes source file(s)
     *
     * @public
     *
     * @param {Boolean} loop: `true` will loop source when finished.
     * @param {Boolean} autoplay: `true` will start playing source when available.
     * @param {String} video.mp4.url: URL to source file.
     * @param {String} video.ogg.url: URL to source file.
     * @param {String} video.webm.url: URL to source file.
     * @param {String} poster.url: URL to source file.
     * @param {String} poster.alt: text for `img` tag `alt` attribute.
     * @param {String} poster.title: text for `img` tag `title` attribute.
     * @param {Function} onPlayback.during: Called every 25 milliseconds while source is playing.
     * @param {Function} onPlayback.ended: Called when source has ended.
     */
    change : function ( cfg ) {
      var elmVid       = this.elmVid,
          elmSource    = this.elmSource,
          elmImg       = this.elmImg,
          videoPlaying = this.videoPlaying,
          doLoad       = cfg.restart || false,
          poster       = cfg.poster,
          autoPlay     = cfg.autoPlay,
          loop         = cfg.loop,
          onPlayback   = cfg.onPlayback,
          elm          = {},
          p            = '',
          url          = '',
          fileTypes    = getFileTypes();

      if ( poster && poster.url ) {
        elmImg.src   = poster.url;

        if ( poster.alt ) {
          elmImg.alt = poster.alt;
        }

        if ( poster.title ) {
          elmImg.title = poster.title;
        }
      }

      if ( isVideoSupported( elmVid ) ) {
        for ( p in fileTypes ) {
          if ( fileTypes.hasOwnProperty( p ) ) {
            elm = elmSource[ p ];

            if ( elm ) {
              url     = cfg.video[ p ].url;
              doLoad  = doLoad || elm.src !== url; // if we have a different video, reload
              elm.src = url;
            }
          }
        }

        if ( doLoad ) {
          elmVid.load();

          if ( videoPlaying ) {
            resetVideoPlaying.call( this );
          }
          if ( onPlayback ) {
            startPlayback.call( this, onPlayback );
          }

          if ( typeof autoPlay !== 'undefined' ) {
            if ( autoPlay ) {
              elmVid.play();
            } else {
              elmVid.pause();
            }
          }
        }
      }
    },

    /**
     * Stop playback of source
     *
     * @public
     */
    stopPlayback  : function ( ) {
      var elmVid = this.elmVid;

      if ( isVideoSupported( elmVid ) ) {
        elmVid.pause();
        resetVideoPlaying.call( this );
      }
    },

    /**
     * Get's instance of DOM element
     *
     * @public
     *
     * @return {Object} Instance of DOM object element
     */
    getElm : function ( ) {
      var elmVid = this.elmVid;

      return isVideoSupported( elmVid ) ? elmVid : this.elmImg;
    }
  };

  return function( cfg ) {
    return new VideoObj( cfg );
  };
}( ) );