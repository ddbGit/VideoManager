module.exports = function ( grunt ) {
  'use strict';

  var pkgJSON = grunt.file.readJSON( 'package.json' ),
      copyrightYear = function ( ) {
        var copyText  = '',
            startYear = +pkgJSON.startYear,        // + used to convert to number type
            thisYear  = +new Date().getFullYear(); // + used to convert to number type

        if ( thisYear > startYear ) {
          copyText = startYear + ' - ';
        }

        return copyText + thisYear;
      },
      bannerCopy = function ( type ) {
        var comment         = [],
            jsdocType       = 'jsdocType',
            commentType     = type === jsdocType ? jsdocType : 'defaultType',
            newLine         = '\n',
            openComment     = '/**\n',
            closeComment    = ' */\n',
            module          = ' * @module <%= pkg.title || pkg.name %>\n',
            version         = ' * @version <%= pkg.version %> - Build: <%= grunt.template.today( "UTC:dddd, mmmm dS, yyyy, HH:MM:ss \'GMT\'" ) %>\n',
            description     = ' * @description ' + pkgJSON.description.replace( /\.\s/g, '\n * ' ),
            copyright       = ' * @copyright ' + copyrightYear() + ', <%= pkg.company %>\n',
            license         = ' * @license <%= pkg.licenses.type %>',
            author          = ' * @author <%= pkg.author.name %>',
            descriptionType = {
              defaultType : '',
              jsdocType   : '\n * <br />For inital configuration see example below and {@link cfg} configuration object'
            },
            licenseType = {
              defaultType : ' <%= pkg.licenses.url %>',
              jsdocType   : ' {@link <%= pkg.licenses.url %>}'
            },
            authorType = {
              defaultType : ' <%= pkg.author.email %>',
              jsdocType   : ' <<%= pkg.author.email %>>'
            },
            example = ' *\n' +
              ' * @example <caption>Inital configuration</caption>\n' +
              ' * var videoInstance = VideoManager( {\n' +
              ' *       elm          : document.getElementById( \'video_1\' ),\n' +
              ' *       width        : \'480\',\n' +
              ' *       height       : \'285\',\n' +
              ' *       autoPlay     : true,\n' +
              ' *       idNamePrefix : \'media_\',\n' +
              ' *       poster       : {\n' +
              ' *         url   : \'http://pagefx.com/ddbGit/videoManager/Examples/assests/video1.jpg\',\n' +
              ' *         title : \'This is title text.\',\n' +
              ' *         alt   : \'This is alt text.\'\n' +
              ' *       },\n' +
              ' *       video : {\n' +
              ' *         mp4  : { url : \'http://pagefx.com/ddbGit/videoManager/Examples/assests/video1.mp4\' },\n' +
              ' *         webm : { url : \'http://pagefx.com/ddbGit/videoManager/Examples/assests/video1.webm\' },\n' +
              ' *         ogg  : { url : \'http://pagefx.com/ddbGit/videoManager/Examples/assests/video1.ogv\' }\n' +
              ' *       },\n' +
              ' *       onPlayback : {\n' +
              ' *         during : function ( elm ) {\n' +
              ' *           // Do something while playing video\n' +
              ' *           console.log( \'video Millieseconds:\', elm.currentTime );\n' +
              ' *         },\n' +
              ' *         ended : function ( ) {\n' +
              ' *           // Do something when video has ended\n' +
              ' *           console.warn( \'video ended\' );\n' +
              ' *         },\n' +
              ' *         notSupported : function ( ) {\n' +
              ' *           // Do something if video is not supported for browser\n' +
              ' *           console.warn( \'video Not Supported\' );\n' +
              ' *         }\n' +
              ' *       }\n' +
              ' *     } );\n';

        comment.push( openComment );
        comment.push( module );
        comment.push( version );
        comment.push( description + descriptionType[ commentType ] + newLine );
        comment.push( copyright );
        comment.push( license + licenseType[ commentType ] + newLine );
        comment.push( author + authorType[ commentType ] + newLine );

        if ( commentType === jsdocType ) {
           comment.push( example );
        }

        comment.push( closeComment );

        return comment.join( '' );
      };

  grunt.initConfig( {
    pkg      : pkgJSON,
    srcPath  : 'src/*.js',
    distPath : 'dist/<%= pkg.name %>.<%= pkg.version %>.',
    jshint : {
      files : '<%= srcPath %>'
    },
    concat : {
      options : {
        banner : bannerCopy( 'jsdocType' )
      },
      dist : {
        src  : '<%= srcPath %>',
        dest : '<%= distPath %>js'
      }
    },
    removelogging : {
      dist : {
        src  : '<%= concat.dist.dest %>',
        dest : '<%= distPath %>nolog.js'
      }
    },
    uglify : {
      options : {
        banner : bannerCopy()
      },
      dist : {
        src  : '<%= removelogging.dist.src.dest %>',
        dest : '<%= distPath %>min.js'
      }
    },
    jsdoc : {
      docstrap : {
        src : [ '<%= concat.dist.dest %>','jsdoc_index.md' ],
        options : {
          destination : 'docs',
            template  : 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
            configure : 'jsdoc.conf.json'
        }
      }
    },
    watch : {
      gruntfile : {
        files : '<%= jshint.files %>',
        tasks : ['jshint']
      }
    }
  } );

  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-concat' );
  grunt.loadNpmTasks( 'grunt-remove-logging' );
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks( 'grunt-jsdoc' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );


  // Tasks
  grunt.registerTask( 'default', [ 'jshint', 'concat', 'removelogging', 'uglify', 'jsdoc' ] );
  grunt.registerTask( 'autopublish', [ 'watch' ] );
};