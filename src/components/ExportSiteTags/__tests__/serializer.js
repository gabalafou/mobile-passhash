import { createPortableHtml } from '../serializer';

const siteTagOptions = {
  '1&1.com': {
    requireDigit: true,
    requirePunctuation: false,
    requireMixedCase: true,
    noSpecial: false,
    digitsOnly: false,
    size: 16,
    newPasswordBumper: 0,
  },
  'abc.com': {
    requireDigit: true,
    requirePunctuation: true,
    requireMixedCase: true,
    noSpecial: false,
    digitsOnly: false,
    size: 8,
    newPasswordBumper: 0,
  },
  'llamablues.com': {
    requireDigit: true,
    requirePunctuation: false,
    requireMixedCase: false,
    noSpecial: false,
    digitsOnly: false,
    size: 16,
    newPasswordBumper: 3,
  },
  'helpforum.net:90': {
    requireDigit: true,
    requirePunctuation: true,
    requireMixedCase: true,
    noSpecial: true,
    digitsOnly: false,
    size: 24,
    newPasswordBumper: 2,
  },
};

describe('createPortableHtml', () => {
  it('should render correctly', () => {
    const html = createPortableHtml(siteTagOptions);
    expect(html).toMatchSnapshot();
  });

  it('should throw if there are any missing strings', () => {
    expect(() => {
      createPortableHtml(siteTagOptions, {
        passhashPortableTitle: 'Password Hasher',
      });
    }).toThrow();
  });
});
