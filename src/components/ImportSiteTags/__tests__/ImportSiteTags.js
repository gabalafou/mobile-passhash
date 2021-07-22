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
      const { getByTestId, queryByTestId } = render(
        <ImportSiteTags onCancel={noop} onSubmit={noop} siteTagList={[]} />
      );
      const textInput = getByTestId('text-input');
      fireEvent.changeText(textInput, formattedSiteTags);

      expect(queryByTestId('error-container')).not.toBeNull();
      expect(queryByTestId('submit-button')).toBeNull();
    });
  });

  describe('when parser returns empty', () => {
    it('should display error and hide submit button', () => {
      parser.parseSiteTagsAndOptions.mockImplementationOnce(() => {
        return {};
      });
      const { getByTestId, queryByTestId } = render(
        <ImportSiteTags onCancel={noop} onSubmit={noop} siteTagList={[]} />
      );
      const textInput = getByTestId('text-input');
      fireEvent.changeText(textInput, formattedSiteTags);

      expect(queryByTestId('error-container')).not.toBeNull();
      expect(queryByTestId('submit-button')).toBeNull();
    });
  });

  describe('when parser returns only existing site tags', () => {
    it('should display error and hide submit button', () => {
      parser.parseSiteTagsAndOptions.mockImplementationOnce(() => {
        return {
          existingSiteTag: { /* password options */ },
        };
      });
      const { getByTestId, queryByTestId } = render(
        <ImportSiteTags onCancel={noop} onSubmit={noop} siteTagList={['existingSiteTag']} />
      );
      const textInput = getByTestId('text-input');
      fireEvent.changeText(textInput, formattedSiteTags);

      expect(queryByTestId('error-container')).not.toBeNull();
      expect(queryByTestId('submit-button')).toBeNull();
    });
  });

  describe('when parser returns some new and some existing site tags', () => {
    beforeEach(() => {
      parser.parseSiteTagsAndOptions.mockImplementationOnce(() => {
      return {
          existingSiteTag: { /* password options */ },
          newSiteTag: { /* password options */ },
        };
      });
    });

    it('should display error and show submit button', () => {
      const { getByTestId, queryByTestId, queryByText } = render(
        <ImportSiteTags onCancel={noop} onSubmit={noop} siteTagList={['existingSiteTag']} />
      );
      const textInput = getByTestId('text-input');
      fireEvent.changeText(textInput, formattedSiteTags);
      expect(queryByTestId('error-container')).not.toBeNull();
      expect(queryByText('Import 1 site tag')).not.toBeNull();
    });

    describe('and user hits submit', () => {
      it('should submit only new site tags', () => {
        const onSubmit = jest.fn();
        const { getByTestId, queryByTestId } = render(
          <ImportSiteTags onCancel={noop} onSubmit={onSubmit} siteTagList={['existingSiteTag']} />
        );
        const textInput = getByTestId('text-input');
        fireEvent.changeText(textInput, formattedSiteTags);
        fireEvent.press(queryByTestId('submit-button'));

        expect(onSubmit).toHaveBeenCalledWith({
          newSiteTag: expect.anything(),
        });
      });
    })
  });

  describe('when there are no issues', () => {
    beforeEach(() => {
      parser.parseSiteTagsAndOptions.mockImplementationOnce(() => {
        return {
          foo: { a: 'z' },
          bar: { size: 16 },
        };;
      });
    });

    it('should display no error and show submit button', () => {
      const { getByTestId, queryByTestId, queryByText } = render(
        <ImportSiteTags onCancel={noop} onSubmit={noop} siteTagList={['existingSiteTag']} />
      );
      const textInput = getByTestId('text-input');
      fireEvent.changeText(textInput, formattedSiteTags);
      expect(queryByTestId('error-container')).toBeNull();
      expect(queryByText('Import 2 site tags')).not.toBeNull();
    });

    describe('and user hits submit', () => {
      it('should pass site tag options', () => {
        const onSubmit = jest.fn();
        const { getByTestId, queryByTestId } = render(
          <ImportSiteTags onCancel={noop} onSubmit={onSubmit} siteTagList={['existingSiteTag']} />
        );
        const textInput = getByTestId('text-input');
        fireEvent.changeText(textInput, formattedSiteTags);
        fireEvent.press(queryByTestId('submit-button'));

        expect(onSubmit).toHaveBeenCalledWith({
          foo: { a: 'z' },
          bar: { size: 16 },
        });
      });
    });
  });
});
