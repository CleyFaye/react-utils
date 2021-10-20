/* eslint-env node */
const {readFileSync} = require("fs");
const loadGruntTasks = require("load-grunt-tasks");

const license = [
  "/**",
  " * @preserve",
  " * @license",
  ...readFileSync("LICENSE", "utf8").split("\n")
    .map(c => ` * ${c}`),
  " */",
].join("\n");

const OUTPUT_DIR = "lib";

module.exports = grunt => {
  loadGruntTasks(grunt);

  grunt.initConfig({
    clean: [
      OUTPUT_DIR,
    ],
    babel: {
      options: {sourceMap: true},
      lib: {
        options: {
          presets: [
            [
              "@babel/preset-env",
              {
                targets: "last 1 version, > 2%, not dead",
                modules: false,
                useBuiltIns: "usage",
                corejs: 3,
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
    usebanner: {
      options: {banner: license},
      lib: {
        files: [{
          expand: true,
          cwd: OUTPUT_DIR,
          src: "**/*.js",
        }],
      },
    },
  });

  grunt.registerTask("build", [
    "babel:lib",
    "usebanner:lib",
  ]);
  grunt.registerTask("default", ["build"]);
};
