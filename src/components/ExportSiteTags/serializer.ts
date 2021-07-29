import ejs from 'ejs';
import { readFile } from 'fs/promises';
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
  const template = await readFile(
    __dirname + '/portable-html-template/index.ejs',
    { encoding: 'utf8' }
  );
  return await ejs.renderFile(
    template,
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

// import ejs from 'ejs';
// import strings from './passhash-portable-strings.json';
// import { writeFileSync } from 'fs';

// const siteTagOptions = {
//   '1&1.com': {
//     requireDigit: true,
//     requirePunctuation: false,
//     requireMixedCase: true,
//     noSpecial: false,
//     digitsOnly: false,
//     size: 16,
//     newPasswordBumper: 0,
//   },
//   'abc.com': {
//     requireDigit: true,
//     requirePunctuation: true,
//     requireMixedCase: true,
//     noSpecial: false,
//     digitsOnly: false,
//     size: 8,
//     newPasswordBumper: 0,
//   },
//   'llamablues.com': {
//     requireDigit: true,
//     requirePunctuation: false,
//     requireMixedCase: false,
//     noSpecial: false,
//     digitsOnly: false,
//     size: 16,
//     newPasswordBumper: 3,
//   },
//   'helpforum.net:90': {
//     requireDigit: true,
//     requirePunctuation: true,
//     requireMixedCase: true,
//     noSpecial: true,
//     digitsOnly: false,
//     size: 24,
//     newPasswordBumper: 2,
//   },
// };

// function getSiteTagString(siteTag, { newPasswordBumper }) {
//   return newPasswordBumper > 0 ? `${siteTag}:${newPasswordBumper}` : siteTag;
// }

// ejs.renderFile(
//   __dirname + '/passhash-portable.ejs',
//   {
//     ...strings,
//     siteTagsAndOptions: Object.entries(siteTagOptions).map(
//       ([siteTag, options]) => [
//         getSiteTagString(siteTag, options),
//         getOptionString(options),
//       ]
//     ),
//   },
//   {},
//   (err, str) => {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     console.log(str);
//     writeFileSync(__dirname + '/out.html', str);
//   }
// );
