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
const TSBUILD_DIR = "build";

// eslint-disable-next-line max-lines-per-function
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
                targets: "> 2% and not dead",
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
          cwd: TSBUILD_DIR,
          src: "**/*.js",
          dest: OUTPUT_DIR,
        }],
      },
    },
    run: {
      tsbuild: {
        cmd: "npx",
        args: ["tsc"],
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
    "run:tsbuild",
    "babel:lib",
    "usebanner:lib",
  ]);
  grunt.registerTask("default", ["build"]);
};
