// @codegen
// This is a compile-time file to be used with Babel codegen macro.
// See: https://github.com/kentcdodds/codegen.macro

const ejs = require('ejs');
const { readFileSync } = require('fs');
const { escapeXML } = ejs;

const read = (path) =>
  readFileSync(require.resolve('./portable-html-template/' + path), {
    encoding: 'utf8',
  });

const mainTemplatePath = 'passhash-portable.html';
const templatePaths = [
  mainTemplatePath,
  // None of the following are actually EJS templates but they are included by
  // the main template, so they have to be compiled too
  'passhash-portable.css',
  'passhash-portable.js',
  'portable-blurb.html',
  '../../../lib/paj/sha1.js',
  '../../../lib/wijjo/passhash-common.js',
];

const compiledTemplates = {};

function escapeFn(markup, ...args) {
  if (markup === undefined) {
    throw new Error('Empty string not allowed');
  }
  return escapeXML(markup, ...args);
}
escapeFn.toString = function () {
  return (
    Function.prototype.toString.call(this) +
    ';\nvar escapeXML = ' +
    escapeXML.toString()
  );
};

templatePaths.forEach((path) => {
  const template = read(path);
  compiledTemplates[path] = ejs.compile(template, {
    client: true,
    strict: true,
    localsName: 'data',
    compileDebug: false,
    escape: escapeFn,
  });
});

module.exports = (varName) =>
  `${varName} = {\n` +
  Object.entries(compiledTemplates)
    .map(([path, fn]) => {
      return `"${path}": ${fn.toString()}`;
    })
    .join(', \n') +
  '};\n' +
  // alias the main template
  `${varName}.main = ${varName}['${mainTemplatePath}'];\n`;
