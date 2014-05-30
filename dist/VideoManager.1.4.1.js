/**
 * @module VideoManager
 * @version 1.4.1 - Build: Friday, May 30th, 2014, 19:45:35 GMT
 * @description Creates html `video` tag with `source` and or `img` tag with methods for each instance
 * Auto Constructor (no need to use `new` keyword), to create instance Appends DOM `video` tag to specified element in the DOM
 * And includes methods for each instance.
 * <br />For inital configuration see example below and {@link cfg} configuration object
 * @copyright 2014, PageFX.com
 * @license MIT {@link https://github.com/ddbGit/VideoManager/blob/master/LICENSE.md}
 * @author Dean Dal Bozzo <dean@pagefx.com>
 *
 * @example <caption>Inital configuration</caption>
 * var videoInstance = VideoManager( {
 *       elm          : document.getElementById( 'video_1' ),
 *       width        : '480',
 *       height       : '285',
 *       autoPlay     : true,
 *       idNamePrefix : 'media_',
 *       poster       : {
 *         url   : 'http://pagefx.com/ddbGit/videoManager/Examples/assests/video1.jpg',
 *         title : 'This is title text.',
 *         alt   : 'This is alt text.'
 *       },
 *       video : {
 *         mp4  : { url : 'http://pagefx.com/ddbGit/videoManager/Examples/assests/video1.mp4' },
 *         webm : { url : 'http://pagefx.com/ddbGit/videoManager/Examples/assests/video1.webm' },
 *         ogg  : { url : 'http://pagefx.com/ddbGit/videoManager/Examples/assests/video1.ogv' }
 *       },
 *       onPlayback : {
 *         during : function ( elm ) {
 *           // Do something while playing video
 *           console.log( 'video Millieseconds:', elm.currentTime );
 *         },
 *         ended : function ( ) {
 *           // Do something when video has ended
 *           console.warn( 'video ended' );
 *         },
 *         notSupported : function ( ) {
 *           // Do something if video is not supported for browser
 *           console.warn( 'video Not Supported' );
 *         }
 *       }
 *     } );
 */
VideoManager = ( function ( ) {
  var doc = document,
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
      // Collection of file types
      getFileTypes = function ( ) {
        return {
          ogg  : { mimeType : 'video/ogg',  canPlayType : 'video/ogg; codecs="theora, vorbis"' },
          webm : { mimeType : 'video/webm', canPlayType : 'video/webm; codecs="vp8.0, vorbis"' },
          mp4  : { mimeType : 'video/mp4',  canPlayType : 'video/mp4; codecs="avc1.4D401E, mp4a.40.2"' }
        };
      },
      getIdName = function ( idNamePrefix, suffix ) {
        return idNamePrefix ? idNamePrefix + suffix : '';
      },
      isCallback = function( callback ) {
        return ( typeof callback === 'function' ) ? callback : function ( ) { };
      },
      // Check if browser supports `video` tag
      isVideoSupported = function ( elm ) {
        return !!elm.canPlayType; // !! used so we get a Boolean value
      },
      // Set's `video` tag attribute `autoplay` value
      autoPlay = function ( elm, play ) {
        if ( play ) {
          elm.autoplay = true;
        }
      },
      // Set's `video` tag attribute `loop` value
      loop = function ( elm, doLoop ) {
        if ( doLoop ) {
          elm.loop = true;
        }
      },
      // Reset timer
      resetVideoPlaying = function ( ) {
        clearInterval( this.videoPlaying );
        this.videoPlaying = null;
      },
      // Check if source is at end and fire callback
      playHeadAtEnd = function ( ended, fnEnded ) {
        if ( ended ) {
          resetVideoPlaying.call( this );
          fnEnded();
        }
      },
      // Check if source is has started and fire callback
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
       * @typedef cfg
       * @type {object}
       *
       * @property {element} elm: DOM element to attach `video` tag to.
       * @property {string} width: pixel width of source.
       * @property {string} height: pixel height of source.
       * @property {boolean} loop: `true` will loop source when finished.
       * @property {boolean} autoplay: `true` will start playing source when available.
       * @property {string} video.mp4.url: URL to source mp4 file.
       * @property {string} video.ogg.url: URL to source (ogg|ogv) file.
       * @property {string} video.webm.url: URL to source webm file.
       * @property {string} poster.url: URL to source file.
       * @property {string} poster.alt: text for `img` tag `alt` attribute.
       * @property {string} poster.title: text for `img` tag `title` attribute.
       * @property {string} idNamePrefix: Element `id` name prefix to use when adding `source` or `img` tags.  Will append the media type, to the id name
       * @property {callback-during} onPlayback.during: Called every 250 milliseconds while `source` is playing.
       * @property {callback-ended} onPlayback.ended: Called when `source` has ended.
       * @property {callback-notSupported} onPlayback.notSupported: Called when browser does not support `video` tag.
       */

      /**
       * Called every 250 milliseconds while source is playing.
       * @callback callback-during
       * @param {element} elm DOM element instance of `source`
       */

      /**
       * Called when source has ended.
       * @callback callback-ended
       */

      /**
       * Called when browser does not support `video` tag
       * @callback callback-notSupported
       * @return {element} DOM element instance of `source`
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
      VideoObj = function ( cfg ) {
        this.elmVid       = makeElement( 'video' );
        this.elmImg       = {};
        this.elmSource    = {};
        this.videoPlaying = null;

        build.call( this, cfg );
      };

  /**
   * @memberof module:VideoManager
   * @alias module:VideoManager.prototype
   */
  VideoObj.prototype = {
    /**
     * @typedef change/cfg
     * @type {object}
     *
     * @property {boolean} loop: `true` will loop source when finished.
     * @property {boolean} autoplay: `true` will start playing source when available.
     * @property {string} video.mp4.url: URL to source file.
     * @property {string} video.ogg.url: URL to source file.
     * @property {string} video.webm.url: URL to source file.
     * @property {string} poster.url: URL to source file.
     * @property {string} poster.alt: text for `img` tag `alt` attribute.
     * @property {string} poster.title: text for `img` tag `title` attribute.
     * @property {callback-during} onPlayback.during: Called every 25 milliseconds while source is playing.
     * @property {callback-ended} onPlayback.ended: Called when source has ended.
     */

    /**
     * change Changes source file
     * @param  { change/cfg } cfg configuration object
     *
     * @example <caption>Change configuration</caption>
     * videoInstance.change( {
     *   poster   : {
     *     url   : 'http://pagefx.com/ddbGit/videoManager/Examples/assests/video2.jpg',
     *     title : 'This is title text.',
     *     alt   : 'This is alt text.'
     *   },
     *   video    : {
     *     mp4  : { url : 'http://pagefx.com/ddbGit/videoManager/Examples/assests/video2.mp4' },
     *     webm : { url : 'http://pagefx.com/ddbGit/videoManager/Examples/assests/video2.webm' },
     *     ogg  : { url : 'http://pagefx.com/ddbGit/videoManager/Examples/assests/video2.ogv' }
     *   },
     *   onPlayback : {
     *     during : function ( elm ) {
     *       // Do something while playing video
     *       console.log( 'change() ', 'Millieseconds:', elm.currentTime);
     *     },
     *     ended  : function ( ) {
     *       // Do something when video has ended
     *       console.log( 'change() ',' ended');
     *     },
     *     notSupported : function ( ) {
     *       // Do something if video is not supported for browser
     *       console.log( 'change() ',' Not Supported' );
     *     }
     *   }
     * } );
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
     * stopPlayback Stop playback of source
     * @example
     * videoInstance.stopPlayback();
     */
    stopPlayback  : function ( ) {
      var elmVid = this.elmVid;

      if ( isVideoSupported( elmVid ) ) {
        elmVid.pause();
        resetVideoPlaying.call( this );
      }
    },

    /**
     * getElm Get's instance of DOM `video` element
     *
     * @return {element} Instance of DOM `video` element
     *
     * @example
     * videoInstance.getElm();
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