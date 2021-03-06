import { updateOptions } from '../PasswordOptions';
import type { Options } from '../PasswordOptions';
import { defaultPasswordOptions } from '../../constants';


// Exported site tags look like this in the source code of the
// standalone HTML page generated by the old Firefox extension:
//     <option value="dpmr8">example.com</option>
// The site tag appears between the `option` tags (example.com),
// and the password options are encoded in the `value` attribute (dpmr8).
const exportedSiteTagRe = /<option value=["“]([dpmrg0-9]+)["”]>(.+?)<\/option>/gi;

function parseSiteTagsAndOptions(string) {
  const siteTagOptions = {};

  if (!string || !string.length) {
    return siteTagOptions;
  }

  let matches;
  while (matches = exportedSiteTagRe.exec(string)) {
    let options, siteTag;
    try {
      options = parseOptions(matches[1]);
      siteTag = matches[2];
    } catch (err) {
      continue;
    }

    const bumperMatch = siteTag.match(/:(\d+)$/);
    if (bumperMatch) {
      const maybeBumper = parseInt(bumperMatch[1]);

      // The Firefox extension that this app is based on, whenever the
      // user needed a new password for a given site, she could click a
      // button labeled "bump" and this would append a colon and an integer
      // to the end of the site tag that would get incremented by 1
      // every time that the user clicked bump, e.g.--
      //
      //    example.com [start]
      //    example.com:1 [user clicks "Bump" button because she
      //                   wants new password for the same site]
      //    example.com:2 [user clicks "Bump" again]
      //    ... and so forth
      //
      // Because a site tag could potentially have an http port at the end,
      // like example.com:8080, we cannot assume that a site tag of the
      // form tag:int was "bumped" by the Passhash Firefox extension.
      // But let's make a reasonable assumption that an integer in the
      // range [1, 99] is a bump integer, not a port. It's ok if we make the wrong
      // assumption here because the user should still be able to produce the
      // same password as before. For example, if someone imports a list
      // of site tags and one of the site tags is example.com:88, then it
      // will get imported as site tag "example.com" bumped up to 88
      // in the UI. The user might find it surprising to no longer see
      // the site tag as "example.com:88", but when she enters her
      // master password, she'll get the same generated password as
      // before. I think the only place we run into trouble is in an
      // edge case where the user has already entered example.com, and
      // then tries to import example.com:88, in which case the import of
      // that specific site tag, example.com:88, will be dropped because I
      // decided that imports cannot change any existing site tag
      // configurations, can only add new site tags. I decided to
      // diverge from the Firefox extension in the way that this app handles
      // bumping the password because I think we should support the
      // case where a user wants separate site tags for sites that differ
      // only in port number (example.com:3000 vs example.com:9000). This
      // is a valid use case because these could be totally separate
      // websites with separate logins.
      // I don't think there should be an ambiguity between an HTTP port
      // in the site tag and the new password increment/counter/bumper.
      // The following code may get it wrong in some edge cases way out at
      // the edge, but it will get it right almost all cases, and the
      // consequences of getting in wrong in the edge cases are not severe,
      // so it seems like the sensible thing to do.
      if (maybeBumper > 0 && maybeBumper < 100) {
        options.newPasswordBumper = maybeBumper;
        siteTag = siteTag.slice(0, bumperMatch.index);
      }
    }

    siteTagOptions[siteTag] = options;
  }
  return siteTagOptions;
}

function parseOptions(string: string): Options {
  let options: Options = {
    ...defaultPasswordOptions,
    // the old default password size was 8
    size: 8,
  };

  // Use updateOptions() function to ensure that resulting
  // options object is self-consistent, e.g., if `digitsOnly`
  // is set to true then requireDigit=true, requirePunctuation=false,
  // requireMixedCase=false, noSpecial=true.
  options = updateOptions(options, 'requireDigit', /d/i.test(string));
  options = updateOptions(options, 'requirePunctuation', /p/i.test(string));
  options = updateOptions(options, 'requireMixedCase', /m/i.test(string));
  options = updateOptions(options, 'noSpecial', /r/i.test(string));
  options = updateOptions(options, 'digitsOnly', /g/i.test(string));

  const sizeMatch = string.match(/[0-9]+/);
  if (sizeMatch) {
    options.size = parseInt(sizeMatch[0]);
  }

  return options;
}

export default {
  parseSiteTagsAndOptions,
  parseOptions,
};
