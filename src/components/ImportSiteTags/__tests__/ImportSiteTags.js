import 'react-native';
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ImportSiteTags from '../ImportSiteTags';
import parser from '../parser';


jest.mock('../parser');

describe('ImportSiteTags', () => {
  const noop = () => {};
  const formattedSiteTags = `
    <option value="dpm8">foo</option>
  `;

  describe('when parser throws', () => {
    it('should display error and hide submit button', () => {
      parser.parseSiteTagsAndOptions.mockImplementationOnce(() => {
        throw 'mock error';
      });
      const { getByPlaceholderText, queryByTestId } = render(
        <ImportSiteTags onCancel={noop} onSubmit={noop} siteTagList={[]} />
      );
      const textInput = getByPlaceholderText('Paste HTML');
      fireEvent.changeText(textInput, formattedSiteTags);

      expect(queryByTestId('error-container')).not.toBeNull();
      expect(queryByTestId('submit-button')).toBeNull();
    });
  });

  describe('when parser returns empty', () => {
    it('should display error and hide submit button', () => {

    });
  });

  describe('when parser returns only existing site tags', () => {
    it('should display error and hide submit button', () => {

    });
  });

  describe('when parser returns some new and some existing site tags', () => {
    it('should display error and show submit button', () => {

    });

    describe('and user hits submit', () => {
      it('should submit only new site tags', () => {

      });
    })
  });

  describe('when there are no issues', () => {
    it('should display no error and show submit button', () => {

    });

    describe('and user hits submit', () => {
      it('should pass site tag options', () => {

      });
    });
  });
});
