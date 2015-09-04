module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  var config = {};
  config.compile = {
    "dummy": {
      wrap: 'obogo', // this is your global namespace
      name: "app",
      filename: 'dummy',
      build: 'dist',
      scripts: {
        src: ['src/widgets/dummy/**/*.js'], // search through all JS file in src src directory
        import: ['dummy.*', 'hbd.cloak'], // what files should we import and compile
        // includes: ['src/sideclick/vendor/rocket.js'],
        export: ['dummy'] // hide all from view
      },
      styles: {
        options: {
          paths: ["**/*.less"],
          strictImports: true,
          syncImport: true
        },
        files: {
          'dist/dummy.css': [
            "src/widgets/dummy/**/*.less"
          ]
        }
      },
      templates: [{
        cwd: 'src/widgets',
        src: 'dummy/**/**.html'
      }],
    },

    "widgets": {
      wrap: 'obogo', // this is your global namespace
      name: "app",
      filename: 'widgets',
      build: 'dist',
      scripts: {
        src: ['src/widgets/**/*.js', 'src/shared/**/*.js', '!src/widgets/*/bootstrap.js'], // search through all JS file in src src directory
        import: ['widgets.*', 'shared.*', 'hbd.cloak'], // what files should we import and compile
        export: [''] // hide all from view
      },
      styles: {
        options: {
          paths: ["**/*.less"],
          strictImports: true,
          syncImport: true
        },
        files: {
          'dist/widgets.css': [
            "src/**/*.less"
          ]
        }
      },
      templates: [{
        cwd: 'src/widgets',
        src: '**/**.html',
        options: {
          interval: 500
        }
      }],
    },


    "application": {
      wrap: 'application', // this is your global namespace
      name: "app",
      filename: 'application.dist',
      build: 'dist',
      scripts: {
        src: ['src/application/**/*.js', 'src/shared/**/*.js', '!src/application/widgets/*/bootstrap.js'], // search through all JS file in src src directory
        import: ['application.*', 'hbd.cloak'], // what files should we import and compile
        export: [''] // hide all from global namespace
      },
      styles: {
        options: {
          paths: ["application/**/*.less"],
          strictImports: true,
          syncImport: true
        },
        files: {
          'dist/application.css': [
            "src/application/**/*.less"
          ]
        }
      },
      templates: [{
        cwd: 'src/application',
        src: '**/**.html',
        options: {
          interval: 500
        }
      }],
      loader: {
        url: "/dist/application.dist.js",
        api: "boot",
        filename: "application"
      },
    }
  };

  config.clean = {
    dist: ['dist']
  };

  // This is used to copy dist directory into bower_components for sandbox
  config.copy = {
    main: {
      files: [{
        expand: true,
        src: 'dist/**',
        dest: 'bower_components/hammer-dummy/'
      }]
    }
  };

  // Bumps the version on certain files, puahses changes and tags package
  // IF YOU TOUCH THIS MAKE SURE YOU KNOW WHAT YOU'RE DOING
  // See "grunt-bump" for more information
  config.bump = {
    options: {
      files: ['bower.json', 'dist/package.json', 'dist/dummy.js', 'dist/dummy.min.js'],
      updateConfigs: [],
      commit: true,
      commitMessage: 'Release v%VERSION%',
      commitFiles: ['package.json', 'bower.json', 'dist/package.json', 'dist/dummy.js', 'dist/dummy.min.js'],
      createTag: true,
      tagName: 'v%VERSION%',
      tagMessage: 'Version %VERSION%',
      push: true,
      pushTo: 'origin',
      gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
      globalReplace: false,
      prereleaseName: false,
      regExp: false
    }
  };

  // To watch for changes
  // $ grunt watch
  config.watch = {
    scripts: {
      files: ['src/**/*'],
      tasks: ['default']
    },
  };

  // Unit Tests
  config.jasmine = {
    dummy: {
      src: [
        'node_modules/angular/angular.js',
        'dist/dummy.js'
      ],
      options: {
        specs: ['src/score/test/dummy.js']
      }
    }
  };

  // initialize config
  grunt.initConfig(config);

  // register tasks
  grunt.registerTask('default', ['clean:dist', 'compile']); // , 'copy'
  grunt.registerTask('test', 'jasmine');
};
