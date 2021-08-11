import type { Options } from '../PasswordOptions';
import strings from './portable-html-template/strings.json';
import codegen from 'codegen.macro';

type TemplateFunction = (
  data: Object,
  escapeFn?: (markup: any) => string,
  includeFn?: (path: string, data: Object) => string | void
) => string;

let compiledTemplates: {
  [path: string]: TemplateFunction;
} = {
  // placeholder
  main: (_) => '',
};
codegen.require('./portable-html-template-codegen.js', 'compiledTemplates');

const portableHtmlTemplateFn = (data) => {
  const templateFn = compiledTemplates.main;
  const includeFn = (path, data) => {
    const subTemplateFn = compiledTemplates[path];
    if (subTemplateFn) {
      return subTemplateFn(data);
    }
  };
  return templateFn(data, null, includeFn);
};

function optionsToString(options) {
  let str = '';
  if (options.requireDigit) str += 'd';
  if (options.requirePunctuation) str += 'p';
  if (options.requireMixedCase) str += 'm';
  if (options.noSpecial) str += 'r';
  if (options.digitsOnly) str += 'g';
  str += String(options.size);
  return str;
}

function siteTagToString(siteTag, { newPasswordBumper }) {
  return newPasswordBumper > 0 ? `${siteTag}:${newPasswordBumper}` : siteTag;
}

type SiteTagOptions = {
  [siteTag: string]: Options;
};

export function createPortableHtml(
  siteTagOptions: SiteTagOptions,
  _strings = strings
) {
  const siteTagsAndOptions = Object.entries(siteTagOptions).map(
    ([siteTag, options]) => [
      siteTagToString(siteTag, options),
      optionsToString(options),
    ]
  );
  return portableHtmlTemplateFn({
    ..._strings,
    siteTagsAndOptions,
  });
}
