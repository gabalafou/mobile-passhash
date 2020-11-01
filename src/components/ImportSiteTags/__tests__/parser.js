import parser from '../parser';


const { parseSiteTagsAndOptions } = parser;

describe('parseSiteTagsAndOptions', () => {
  describe('with good input', () => {
    it('should return object with site tags as keys and password options as values', () => {
      const goodInput = `
        <option value="dpmr8">foo</option>\n
        <option value="g16">bar:8</option>\n
        <option value="dpm22">baz:8080</option>\n
      `;
      const result = parseSiteTagsAndOptions(goodInput);
      expect(result).toMatchObject({
        foo: {
          newPasswordBumper: 0,
          requireDigit: true,
          requirePunctuation: false,
          requireMixedCase: true,
          noSpecial: true,
          digitsOnly: false,
          size: 8
        },
        bar: {
          newPasswordBumper: 8,
          requireDigit: true,
          requirePunctuation: false,
          requireMixedCase: false,
          noSpecial: true,
          digitsOnly: true,
          size: 16,
        },
        'baz:8080': {
          newPasswordBumper: 0,
          requireDigit: true,
          requirePunctuation: true,
          requireMixedCase: true,
          noSpecial: false,
          digitsOnly: false,
          size: 22,
        },
      });
    });
  });

  describe('with bad input', () => {
    it('should return empty object', () => {
      const badInput = `
        n value="dpmr8">foo</op\ntion><optio
        16">bar:8</oalue="g>\nption<option v
        option>\ntion value="<opdpm22">baz:8080</
      `;
      expect(parseSiteTagsAndOptions(badInput)).toMatchObject({});
    });
  })
});
