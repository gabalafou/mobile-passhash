import React from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { getSiteTagList } from './redux/selectors';
import { setSiteTag } from './redux/actions';
import { deleteSiteTag } from './helpers';
import * as fuzzy from 'fuzzy';
import naturalSort from 'natural-sort';
import SearchView from './components/SearchView';
import SiteTag from './components/SiteTag';
import debugLog from './debug-log';

export default function SearchSiteTags(props) {
  debugLog('Rendering SearchScreen');

  const { navigation, route } = props;
  const { siteTag = '' } = route.params || {};

  const dispatch = useDispatch();
  const siteTagList = useSelector(getSiteTagList, shallowEqual);

  const [query, setQuery] = React.useState(siteTag);

  // Search existing site tags for matches
  const sortedSiteTagList = React.useMemo(
    () => [...siteTagList].sort(naturalSort()),
    [siteTagList]
  );
  const siteTagMatches = React.useMemo(
    () => fuzzy.filter(query, sortedSiteTagList).map(({ string }) => string),
    [sortedSiteTagList, query]
  );

  const onCancel = React.useCallback(
    () => navigation.navigate('Home'),
    [navigation]
  );
  const onSubmit = React.useCallback(
    (siteTag) => {
      dispatch(setSiteTag(siteTag));
      navigation.navigate('Home');
    },
    [navigation, dispatch]
  );
  const onDelete = React.useCallback(
    (siteTag) => {
      if (siteTag === query) {
        setQuery('');
      }
      deleteSiteTag(siteTag, siteTagList)(dispatch);
    },
    [query, siteTag, siteTagList, dispatch]
  );

  return (
    <SearchView
      query={query}
      onChangeQuery={setQuery}
      results={siteTagMatches}
      // Note (gab): I think the SearchView should have the same placeholder
      // as SiteTag as a way to reenforce the connection between the two
      // fields in the UI
      placeholder={SiteTag.placeholder}
      onCancel={onCancel}
      onSubmit={onSubmit}
      onDelete={onDelete}
    />
  );
}
