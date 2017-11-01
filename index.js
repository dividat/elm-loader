'use strict';

const loaderUtils = require('loader-utils');

const glob = require('glob');
const temp = require('temp');
const fs = require('fs');
const spawnSync = require('child_process').spawnSync;

function addDependencies(loader) {
    // get dependencies from elm-packages.json
    // TODO: specify location of elm-package.json as option
    var depsGlob;
    var elmPackage = JSON.parse(fs.readFileSync('./elm-package.json', 'utf8'));

    if (elmPackage['source-directories'].length > 1) {
        depsGlob = '{' + elmPackage['source-directories'].join(',') + '}/**/*.elm'
    } else {
        depsGlob = elmPackage['source-directories'][0] + '/**/*.elm'
    }

    glob.sync(depsGlob).forEach(loader.addDependency);
}

function compile(input) {
    const outputFile = temp.path({
        suffix: '.js'
    });

    const elmMakeOptions = ['--yes', '--output', outputFile, input];
    console.log("Compiling: ", input);
    const res = spawnSync('elm-make', elmMakeOptions);

    if (res.error) {
        throw res.error;
    }
    if (res.status !== 0) {
        throw new Error('elm-make exited with ' + code + '\n' + res.output);
    }

    const data = fs.readFileSync(outputFile);
    fs.unlinkSync(outputFile);
    console.log(res.stdout.toString('utf8'));
    return data;
}

module.exports = function() {

    var loader = this;

    var input = loader.resourcePath;

    // NOTE: currently no options are allowed. Just keeping this here for future development
    var options = loaderUtils.getOptions(loader);

    addDependencies(loader);
    return compile(input);

}
