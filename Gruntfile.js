module.exports = function(grunt) {

  var config = {};
  // config.hammer = {
  //   "dummy": {
  //     name: 'dummy', // the name of the package
  //     build: 'dist', // build directory
  //     scripts: { // compiles JS files into a single build file
  //       cwd: 'src', // current working directory
  //       src: ['**/*.js'], // search through all JS file in src src directory
  //       import: ['dummy', 'widgets.*'] // what files should we import and compile
  //     },
  //     styles: { // compiles LESS files into style.css
  //       src: 'src/**/*.less' // location of LESS files
  //     },
  //     templates: { // compiles HTML templates into templates.js
  //       cwd: 'src/widgets', // current working directory
  //       src: '**/*.html' // search for all HTML files
  //     },
  //     assets: { // copies assets required to use this package
  //       cwd: 'src', // current working directory
  //       //  src: ['vendor/**/*.svg', 'vendor/**/*.js', 'vendor/**/*.css', '!vendor/**/*.min.js'] // do not include minified
  //       src: ['vendor/**/*.svg', 'vendor/**/*.js', 'vendor/**/*.css'] // files to include
  //     }
  //   }
  // };

  config.compile = {
    "dummy": { // side click admin
      wrap: 'obogo',
      name: "app",
      filename: 'dummy',
      build: 'dist',
      scripts: {
        // inspect: ['sandbox/index.html'],
        // ignorePatterns: false,
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
      // loader: {
      //   //url: "##CDNURL##/sideclick-admin/sideclick.min.js",
      //   url: "##CDNURL##/sideclick-admin-widget.js",
      //   api: "init boot on shutdown update show hide showMessages showNewMessage registerModule",
      //   filename: "sideclick-admin"
      // },
      // assets: {
      //   files: [{
      //     expand: true,
      //     src: ['src/**/*.svg', 'src/**/*.png', 'src/**/*.gif', 'src/**/*.jpg', 'src/**/*.mp3', 'src/**/*.css'],
      //     dest: '##BUILD_PATH##/assets/',
      //     filter: 'isFile',
      //     flatten: true
      //   }]
      // },
      // services: options.services
    },

    "all": { // side click admin
      wrap: 'obogo',
      name: "app",
      filename: 'widgets',
      build: 'dist',
      scripts: {
        // inspect: ['sandbox/index.html'],
        // ignorePatterns: false,
        src: ['src/**/*.js', '!src/widgets/*/app.js'], // search through all JS file in src src directory
        import: ['widgets.*', 'hbd.cloak'], // what files should we import and compile
        // includes: ['src/sideclick/vendor/rocket.js'],
        // export: ['dummy', 'dummer'] // hide all from view
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
        src: '**/**.html'
      }],
      // loader: {
      //   //url: "##CDNURL##/sideclick-admin/sideclick.min.js",
      //   url: "##CDNURL##/sideclick-admin-widget.js",
      //   api: "init boot on shutdown update show hide showMessages showNewMessage registerModule",
      //   filename: "sideclick-admin"
      // },
      // assets: {
      //   files: [{
      //     expand: true,
      //     src: ['src/**/*.svg', 'src/**/*.png', 'src/**/*.gif', 'src/**/*.jpg', 'src/**/*.mp3', 'src/**/*.css'],
      //     dest: '##BUILD_PATH##/assets/',
      //     filter: 'isFile',
      //     flatten: true
      //   }]
      // },
      // services: options.services
    }
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

  // load tasks
  grunt.loadNpmTasks('hbjs');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-bump');
  // grunt.loadNpmTasks('grunt-hammer');

  // register tasks
  grunt.registerTask('default', ['compile', 'copy']);
  grunt.registerTask('test', 'jasmine');
};
