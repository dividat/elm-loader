'use strict';

const loaderUtils = require('loader-utils');

const glob = require('glob');
const temp = require('temp');
const fs = require('fs');
const spawn = require('child_process').spawn;

function addDependencies(loader) {
    // get dependencies from elm-packages.json
    return new Promise(function(resolve, reject) {
        // TODO: specify location of elm-package.json as option
        var depsGlob;
        try {
            var elmPackage = JSON.parse(fs.readFileSync('./elm-package.json', 'utf8'));

            if (elmPackage['source-directories'].length > 1) {
                depsGlob = '{' + elmPackage['source-directories'].join(',') + '}/**/*.elm'
            } else {
                depsGlob = elmPackage['source-directories'][0] + '/**/*.elm'
            }
        } catch (e) {
            reject(e);
        }

        glob(depsGlob, function(err, files) {
            if (err) {
                return reject();
            }
            files.forEach(loader.addDependency);
            return resolve();
        })
    });
}

function compile(input) {
    return new Promise(function(resolve, reject) {

        // create a temp file for elm-make to write to
        const outputFile = temp.path({
            suffix: '.js'
        });

        // elm-make child process
        const elmMakeOptions = ['--yes', '--output', outputFile, input];
        console.log("Compiling: ", input);
        const p = spawn('elm-make', elmMakeOptions);

        var output = '';

        p.stdout.on('data', (data) => {
            output += data;
        })

        p.stderr.on('data', (data) => {
            output += data;
        });

        p.on('error', (err) => {
            console.error(err);
            return reject(err);
        })

        p.on('close', (code) => {
            if (code != 0) {
                return reject(new Error('elm-make exited with ' + code + '\n' + output));
            }

            fs.readFile(outputFile, (err, data) => {
                if (err) {
                    return reject(err);
                } else {
                    fs.unlinkSync(outputFile);
                    console.log(output);
                    return resolve(data);
                }
            });

        });

    });
}

module.exports = function() {

    var loader = this;
    var callback = loader.async();

    var input = loader.resourcePath;

    // NOTE: currently no options are allowed. Just keeping this here for future development
    var options = loaderUtils.getOptions(loader);

    Promise.all([addDependencies(loader), compile(input)]).then(function(results) {
        var output = results[1];
        return callback(null, output);
    }).catch(function(err) {
        err.message = 'Compiler process exited with error ' + err.message;
        return callback(err);
    });
}
