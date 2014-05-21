module.exports = function ( grunt ) {
  'use strict';

  var pkgJSON = grunt.file.readJSON( 'package.json' );

  grunt.initConfig( {
    pkg      : pkgJSON,
    copyYear : ( function ( ) {
      var copyText  = '',
          startYear = +pkgJSON.startYear,
          thisYear  = +new Date().getFullYear();

      if ( thisYear > startYear ) {
        copyText = startYear + ' - ';
      }

      return copyText + thisYear;
    }( ) ),
    srcPath  : 'src/*.js',
    distPath : 'dist/<%= pkg.name %>.<%= pkg.version %>.',
    banner   : '/* <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
      ' * <%= pkg.description %>\n' +
      '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
      ' * Copyright (c) <%= copyYear %>, <%= pkg.company %>\n' +
      ' * Free to use under the <%= pkg.licenses.type %> license.\n' +
      ' * <%= pkg.licenses.url %>\n' +
      ' *\n' +
      ' * Build: <%= grunt.template.today( "UTC:dddd, mmmm dS, yyyy, HH:MM:ss \'GMT\'" ) %>\n' +
      ' */\n',
    jshint : {
      files : '<%= srcPath %>'
    },
    concat : {
      options : {
        banner : '<%= banner %>\n\n'
      },
      dist : {
        src  : '<%= srcPath %>',
        dest : '<%= distPath %>js'
      }
    },
    removelogging : {
      options : {
        banner : '<%= banner %>'
      },
      dist : {
        src  : '<%= concat.dist.dest %>',
        dest : '<%= distPath %>nolog.js'
      }
    },
    uglify : {
      options : {
        banner : '<%= banner %>'
      },
      dist : {
        src  : '<%= removelogging.dist.src.dest %>',
        dest : '<%= distPath %>min.js'
      }
    },
    watch : {
      gruntfile : {
        files : '<%= jshint.files %>',
        tasks : ['jshint']
      }
    }
  } );

  grunt.loadNpmTasks( 'grunt-contrib-concat' );
  grunt.loadNpmTasks( 'grunt-contrib-jshint' );
  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-remove-logging' );

  // Tasks
  grunt.registerTask( 'default', [ 'jshint', 'concat', 'removelogging', 'uglify' ] );
  grunt.registerTask( 'autopublish', [ 'watch' ] );
};