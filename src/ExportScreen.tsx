import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { getSiteTagList } from './redux/selectors';
import ExportSiteTags from './components/ExportSiteTags';
import debugLog from './debug-log';

export default function ExportScreen(props) {
  debugLog('Rendering ExportScreen');
  const { navigation } = props;
  const siteTagList = useSelector(getSiteTagList, shallowEqual);
  const onCancel = () => navigation.goBack();
  return <ExportSiteTags siteTagList={siteTagList} onCancel={onCancel} />;
}
