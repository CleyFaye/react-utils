/*eslint-env node */
const loadGruntTasks = require("load-grunt-tasks");

const OUTPUT_DIR = "lib";

module.exports = grunt => {
  loadGruntTasks(grunt);

  grunt.initConfig({
    clean: [
      OUTPUT_DIR,
    ],
    babel: {
      options: {
        sourceMap: true,
      },
      lib: {
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                targets: "last 1 version, > 2%, not dead",
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
          cwd: "src",
          src: "**/*.js",
          dest: OUTPUT_DIR,
        }],
      },
    },
  });

  grunt.registerTask("build", ["babel:lib"]);
  grunt.registerTask("default", ["build"]);
};