/*eslint-env node */
const loadGruntTasks = require("load-grunt-tasks");

const ES5_DIR = "es5";

module.exports = grunt => {
  loadGruntTasks(grunt);

  grunt.initConfig({
    clean: [
      ES5_DIR,
    ],
    babel: {
      options: {
        sourceMap: true,
      },
      es5: {
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                targets: "last 1 version, not dead",
                modules: false,
                useBuiltIns: "usage",
                corejs: 2,
              },
            ],
            "@babel/preset-react",
          ],
        },
        files: [{
          expand: true,
          cwd: "lib",
          src: "**/*.js",
          dest: ES5_DIR,
        }],
      },
    },
  });

  grunt.registerTask("default", ["babel:es5"]);
  grunt.registerTask("build", ["babel:es5"]);
};