import { updateOptions } from '../PasswordOptions';


const OFF = false;
const ON = true;

describe('PasswordOptions', () => {

  describe('updateOptions', () => {

    describe('when turning requireDigit off', () => {

      it('should turn digitsOnly off', () => {
        const options = {
          requireDigit: ON,
          requirePunctuation: OFF,
          requireMixedCase: OFF,
          noSpecial: ON,
          digitsOnly: ON,
        };
        const nextOptions = updateOptions(options, 'requireDigit', OFF);
        const expectedOptions = {
          requireDigit: OFF,
          requirePunctuation: OFF,
          requireMixedCase: OFF,
          noSpecial: ON,
          digitsOnly: OFF,
        };
        expect(nextOptions).toEqual(expectedOptions);
      });
    });

    describe('when turning requireDigit on', () => {

      it('should not change any other options', () => {
        const options = {
          requireDigit: OFF,
          requirePunctuation: ON,
          requireMixedCase: ON,
          noSpecial: OFF,
          digitsOnly: OFF,
        };
        const nextOptions = updateOptions(options, 'requireDigit', ON);
        const expectedOptions = { ...options, requireDigit: ON };
        expect(nextOptions).toEqual(expectedOptions);
      });
    });

    describe('when turning requirePunctuation off', () => {

      it('should not change any other options', () => {
        const options = {
          requireDigit: ON,
          requirePunctuation: ON,
          requireMixedCase: ON,
          noSpecial: OFF,
          digitsOnly: OFF,
        };
        const nextOptions = updateOptions(options, 'requirePunctuation', OFF);
        const expectedOptions = { ...options, requirePunctuation: OFF };
        expect(nextOptions).toEqual(expectedOptions);
      });
    });

    describe('when turning requirePunctuation on', () => {

      it('should turn noSpecial and digitsOnly off', () => {
        const options = {
          requireDigit: ON,
          requirePunctuation: OFF,
          requireMixedCase: OFF,
          noSpecial: ON,
          digitsOnly: ON,
        };
        const nextOptions = updateOptions(options, 'requirePunctuation', ON);
        const expectedOptions = {
          requireDigit: ON,
          requirePunctuation: ON,
          requireMixedCase: OFF,
          noSpecial: OFF,
          digitsOnly: OFF,
        };
        expect(nextOptions).toEqual(expectedOptions);
      });
    });

    describe('when turning requireMixedCase off', () => {

      it('should not change any other options', () => {
        const options = {
          requireDigit: ON,
          requirePunctuation: ON,
          requireMixedCase: ON,
          noSpecial: OFF,
          digitsOnly: OFF,
        };
        const nextOptions = updateOptions(options, 'requireMixedCase', OFF);
        const expectedOptions = { ...options, requireMixedCase: OFF };
        expect(nextOptions).toEqual(expectedOptions);
      });
    });

    describe('when turning requireMixedCase on', () => {

      it('should turn digitsOnly off', () => {
        const options = {
          requireDigit: ON,
          requirePunctuation: OFF,
          requireMixedCase: OFF,
          noSpecial: ON,
          digitsOnly: ON,
        };
        const nextOptions = updateOptions(options, 'requireMixedCase', ON);
        const expectedOptions = {
          requireDigit: ON,
          requirePunctuation: OFF,
          requireMixedCase: ON,
          noSpecial: ON,
          digitsOnly: OFF,
        };
        expect(nextOptions).toEqual(expectedOptions);
      });
    });

    describe('when turning noSpecial off', () => {

      it('should turn digitsOnly off', () => {
        const options = {
          requireDigit: ON,
          requirePunctuation: OFF,
          requireMixedCase: OFF,
          noSpecial: ON,
          digitsOnly: ON,
        };
        const nextOptions = updateOptions(options, 'noSpecial', OFF);
        const expectedOptions = {
          requireDigit: ON,
          requirePunctuation: OFF,
          requireMixedCase: OFF,
          noSpecial: OFF,
          digitsOnly: OFF,
        };
        expect(nextOptions).toEqual(expectedOptions);
      });
    });

    describe('when turning noSpecial on', () => {

      it('should turn requirePunctuation off', () => {
        const options = {
          requireDigit: ON,
          requirePunctuation: ON,
          requireMixedCase: ON,
          noSpecial: OFF,
          digitsOnly: OFF,
        };
        const nextOptions = updateOptions(options, 'noSpecial', ON);
        const expectedOptions = {
          requireDigit: ON,
          requirePunctuation: OFF,
          requireMixedCase: ON,
          noSpecial: ON,
          digitsOnly: OFF,
        };
        expect(nextOptions).toEqual(expectedOptions);
      });
    });

    describe('when turning digitsOnly off', () => {

      it('should not change any other options', () => {
        const options = {
          requireDigit: ON,
          requirePunctuation: OFF,
          requireMixedCase: OFF,
          noSpecial: ON,
          digitsOnly: ON,
        };
        const nextOptions = updateOptions(options, 'digitsOnly', OFF);
        const expectedOptions = { ...options, digitsOnly: OFF };
        expect(nextOptions).toEqual(expectedOptions);
      });
    });

    describe('when turning digitsOnly on', () => {

      it('should turn on noSpecial and requireDigit, turn off requirePunctuation and requireMixedCase', () => {
        const options = {
          requireDigit: OFF,
          requirePunctuation: ON,
          requireMixedCase: ON,
          noSpecial: OFF,
          digitsOnly: OFF,
        };
        const nextOptions = updateOptions(options, 'digitsOnly', ON);
        const expectedOptions = {
          requireDigit: ON,
          requirePunctuation: OFF,
          requireMixedCase: OFF,
          noSpecial: ON,
          digitsOnly: ON,
        };
        expect(nextOptions).toEqual(expectedOptions);
      });
    });

  });
});
