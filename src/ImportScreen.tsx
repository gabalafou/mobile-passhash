import React from 'react';
import { shallowEqual, useSelector, useDispatch, useStore } from 'react-redux';
import { getSiteTagList } from './redux/selectors';
import { batchSave } from './helpers';
import ImportSiteTags from './components/ImportSiteTags';
import debugLog from './debug-log';

export default function ImportScreen(props) {
  debugLog('Rendering ImportScreen');

  const { navigation } = props;

  const dispatch = useDispatch();
  const siteTagList = useSelector(getSiteTagList, shallowEqual);

  const onCancel = () => navigation.goBack();

  const onSubmit = (siteTagOptions) => {
    batchSave(siteTagOptions, siteTagList)(dispatch);
    navigation.navigate('Home', {
      shouldScrollToTop: true,
    });
  };

  return (
    <ImportSiteTags
      siteTagList={siteTagList}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}
