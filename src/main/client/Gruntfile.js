var sferaWebAppPath = "../resources/webapp";
var sferaDocPath = "../../site/markdown";

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                stripBanners: true,
                sourceMap: true,
                separator: '\n\n'
            },
            client_js: {
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */\n\n',
                },
                src: ['src/lib/Intro.js', 'src/lib/Sfera.js', 'src/lib/*/*.js', '!src/lib/doc/**',
                    'src/lib/components/presets/*.js', 'src/lib/components/base/*.js', 'src/lib/Outro.js'
                ],
                dest: 'dist/sfera-client.js'
            },
            doc_tool: {
                options:{
                    sourceMap: false,
                },
                src: [
                    'resources/doc-tool/Doc_Intro.js',
                    'src/lib/Sfera.js',
                    'src/lib/utils/Utils.js',
                    'src/lib/components/**/*.js',
                    'src/components/*/*.js',
                    '!src/components/*/*.doc*.js',
                    'src/lib/doc/Doc.js',
                    'src/lib/doc/*/*.js',
                    'src/components/*/*.doc*.js',
                    'resources/doc-tool/Doc_Outro.js'
                ],
                dest: 'dist/sfera-doc-tool.js'
            }
        },

        copy: {
            client_js: {
                expand: true,
                cwd: 'dist',
                src: 'sfera-client.*',
                dest: sferaWebAppPath + '/code/'
            },

            custom_intro_js: {
                src: ['src/lib/Custom_Intro.js'],
                dest: sferaWebAppPath + '/code/custom_intro.js'
            },

            custom_outro_js: {
                src: ['src/lib/Custom_Outro.js'],
                dest: sferaWebAppPath + '/code/custom_outro.js'
            },

            components: {
                expand: true,
                cwd: 'src/components',
                src: ['*', '**/*', '!**/*.scss'],
                dest: sferaWebAppPath + '/components/'
            },

            html: {
                expand: true,
                cwd: 'src/html',
                src: ['*', '**/*'],
                dest: sferaWebAppPath + '/html/',
            },

            skins: {
                expand: true,
                cwd: 'src/skins',
                src: ['*/**', '!**/*.scss'],
                dest: sferaWebAppPath + '/skins/'
            },
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> */\n\n'
            },
            client: {
                files: [{
                    expand: true, // Enable dynamic expansion.
                    cwd: sferaWebAppPath + '/code', // Src matches are relative to this path.
                    src: 'sfera-client.js',
                    dest: sferaWebAppPath + '/code', // Destination path prefix.
                    ext: '.min.js', // Dest filepaths will have this extension.
                }]
            },
            components: {
                files: [{
                    expand: true, // Enable dynamic expansion.
                    cwd: sferaWebAppPath + '/components', // Src matches are relative to this path.
                    src: ['*/*.js', '!*/*.doc*.js', '!*/*.min.js'],
                    dest: sferaWebAppPath + '/components', // Destination path prefix.
                    ext: '.min.js', // Dest filepaths will have this extension.
                    //extDot: 'first' // Extensions in filenames begin after the first dot
                }]
            },
        },

        sass: {
            components: {
                style: "compact", //nested, compact, compressed, expanded,
                files: [{
                    expand: true, // Enable dynamic expansion.
                    cwd: 'src/components',
                    src: ['*/*.scss'], // Actual pattern(s) to match.
                    dest: 'src/components',
                    ext: '.css'
                }]
            },

            skins: {
                style: "compact",
                files: [{
                    expand: true, // Enable dynamic expansion.
                    cwd: 'src/skins/',
                    src: '*/*.scss', // Actual pattern(s) to match.
                    dest: 'src/skins',
                    ext: '.css'
                }]
            },

        },

        clean: {
            components_css: {
                expand: true,
                cwd: 'src/components/',
                src: ['*/*.css', '*/*.css.map'],
            },
            skins_css: {
                expand: true,
                cwd: 'src/skins/',
                src: ['*/*.css', '*/*.css.map'],
            },
        },

        execute: {
            options: {
                module: true,
                dest: sferaDocPath+'/components',
                templ: 'resources/doc-tool/templates'
            },
            src: ['dist/sfera-doc-tool.js']
        }

    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-execute');


    grunt.registerTask('compile', ['concat', 'sass', 'copy', 'clean', 'uglify']);
    grunt.registerTask('build_doc', ['concat:doc_tool', 'execute']);
};
