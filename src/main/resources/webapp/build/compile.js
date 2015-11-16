Object.makeDeepCopy = function(src) {
        if (src instanceof Array) {
                var a = [], i = src.length;
                while (--i >= 0)
                        a[i] = Object.makeDeepCopy(src[i]);
                return a;
        }
        if (src === null)
                return null;
        if (src instanceof Function) {
                return src; // can't deep-copy those
        }
        if (src instanceof Date)
                return new Date(src);
        if (src instanceof Object) {
                var i, dest = {};
                for (i in src)
                        dest[i] = Object.makeDeepCopy(src[i]);
                return dest;
        }
        return src;
}

var MOZ_SourceMap = sourceMap;

// compressed file name, files object, source map content
function compile(filename, files, sourceMap) {
    var res = {
        output:"",
        output_filename:filename,
        map:"",
        map_filename:filename+".map"

    }; // result

    var source_map_options = {
        file : filename
    };

    var beautifier_options = {
        indent_start: 0, // start indentation on every line (only when `beautify`)
        indent_level: 4, // indentation level (only when `beautify`)
        quote_keys: false, // quote all keys in object literals?
        space_colon: true, // add a space after colon signs?
        ascii_only: false, // output ASCII-safe? (encodes Unicode characters as ASCII)
        inline_script: false, // escape script
        width: 80, // informative maximum line width (for beautified output)
        max_line_len: 32000, // maximum line length (for non-beautified output)
        screw_ie8: false, // output IE-safe code?
        beautify: false, // beautify output?
        source_map: true, // output a source map
        bracketize: false, // use brackets every time?
        comments: false, // output comments?
        semicolons: true // use semicolons to separate statements? (otherwise, newlines)
    };

    var opts = {
        compress: true,
        mangle: true
    };

    var compressor_options = {
        sequences: true,
        properties: true,
        dead_code: true,
        drop_debugger: true,
        unsafe: true,
        unsafe_comps: false,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        hoist_funs: true,
        hoist_vars: false,
        if_return: true,
        join_vars: true,
        cascade: true,
        side_effects: true,
        warnings: true,
    };

    var toplevelSourceMap = UglifyJS.SourceMap();

    var ast = null; // UglifyJS.parse(code);
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        ast = UglifyJS.parse(file.code, {
            filename: file.name,
            toplevel: ast
        });
    }
    // files.forEach(function(file) {
    //     ast = UglifyJS.parse(file.code, {
    //         filename: file.name,
    //         toplevel: ast
    //     });
    // });

    if (true || opts.lint || opts.compress) {
        ast.figure_out_scope();
    }
    if (opts.lint) {
        ast.scope_warnings();
    }
    if (opts.compress) {
        ast = ast.transform(UglifyJS.Compressor(compressor_options));
    }
    if (opts.mangle) {
        ast.figure_out_scope();
        ast.compute_char_frequency();
        ast.mangle_names();
    }
    var codegen = Object.makeDeepCopy(beautifier_options);
    codegen.source_map = toplevelSourceMap;
    if (opts.beautify) {
        codegen.beautify = true;
    }

    res.output = ast.print_to_string(codegen);
    res.output += "\n" + "//# sourceMappingURL=code.js.map";

    res.map = toplevelSourceMap.toString();

    return res;
}
