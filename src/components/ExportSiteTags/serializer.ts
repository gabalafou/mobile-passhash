import ejs from 'ejs';
import strings from './portable-html-template/strings.json';

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

export async function createPortableHtml(siteTagOptions) {
  return await ejs.renderFile(
    __dirname + '/portable-html-template/index.ejs',
    {
      ...strings,
      siteTagsAndOptions: Object.entries(siteTagOptions).map(
        ([siteTag, options]) => [
          siteTagToString(siteTag, options as any),
          optionsToString(options),
        ]
      ),
    },
    { async: true }
  );
}
