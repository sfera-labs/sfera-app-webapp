    Sfera.Components.boot();

    grunt.log.writeln("Loading templates from: "+ options.templ);

    var f = grunt.file.expand(options.templ + "/**/*.md");
    for (var i = 0; i<f.length; i++) {
        grunt.log.writeln("Loading "+f[i]);
        templates[f[i]] = grunt.file.read(f[i]);
    }

    grunt.log.writeln("Creating markdown");

    for (var c in Sfera.Components.Classes) {
        var html = genMD.component(Sfera.Components.Classes[c]);
        if (html) {
            grunt.file.write(options.dest+"/"+c+".md", html);
            grunt.log.writeln("Markdown for "+c+" component created.");
        }
    }
};
