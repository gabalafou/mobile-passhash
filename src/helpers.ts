import * as Storage from './storage';
import siteTagListReducer from './redux/reducers/siteTagList';
import {
  setSiteTagList,
  setPasswordOptions,
  removeSiteTag,
} from './redux/actions';
import { defaultPasswordOptions } from './constants';
import debugLog from './debug-log';

function getSiteTags() {
  return Storage.getItemAsync('siteTagList');
}

export function loadSiteTags() {
  return (dispatch) => {
    debugLog('Loading site tags');
    const siteTagListPromise = getSiteTags();
    siteTagListPromise.then((siteTagList) => {
      debugLog('Site tags loaded');
      if (siteTagList) {
        dispatch(setSiteTagList(siteTagList));
      }
    });
  };
}

export function getOptions(siteTag) {
  return Storage.getItemAsync('options__' + siteTag);
}

export function loadOptions(siteTag) {
  return (dispatch) => {
    const optionsPromise = getOptions(siteTag);
    optionsPromise.then((storedOptions) => {
      if (storedOptions) {
        dispatch(
          setPasswordOptions({ ...defaultPasswordOptions, ...storedOptions })
        );
      }
    });
  };
}

function _saveSiteTag(siteTag, options) {
  if (!siteTag) {
    return;
  }

  // Save options for site tag
  Storage.setItemAsync('options__' + siteTag, options);
}

export function saveSiteTag(siteTag, options, siteTagList) {
  return (dispatch) => {
    batchSave({ [siteTag]: options }, siteTagList)(dispatch);
  };
}

// This function seems necessary in order to achieve
// fast, responsive UI when importing many site tags
export function batchSave(siteTagOptions, siteTagList) {
  return (dispatch) => {
    const siteTags = Object.keys(siteTagOptions);
    siteTags.forEach((siteTag) => {
      const options = siteTagOptions[siteTag];
      _saveSiteTag(siteTag, options);
    });
    const setSiteTagListAction = setSiteTagList([...siteTagList, ...siteTags]);
    dispatch(setSiteTagListAction);
    const nextSiteTagList = siteTagListReducer(
      siteTagList,
      setSiteTagListAction
    );
    Storage.setItemAsync('siteTagList', nextSiteTagList);
  };
}

export function deleteSiteTag(siteTag, siteTagList) {
  return (dispatch) => {
    if (!siteTag) {
      return;
    }

    // Delete options for site tag
    dispatch(removeSiteTag(siteTag));
    Storage.deleteItemAsync('options__' + siteTag);

    // Delete site tag from site tag list
    const siteTagIndex = siteTagList.indexOf(siteTag);
    if (siteTagIndex > -1) {
      const nextSiteTagList = [
        ...siteTagList.slice(0, siteTagIndex),
        ...siteTagList.slice(siteTagIndex + 1),
      ];
      Storage.setItemAsync('siteTagList', nextSiteTagList);
    }
  };
}

// Instead of getting the options for a single site tag this helper gets the
// options object for each of the site tags passed in.
//
// Returns promise for an object that maps each site tag to its corresponding
// options
export async function mapSiteTagsToOptions(siteTags) {
  const siteTagOptions = {};
  // use Promise.all to lookup options for each site tag in parallel
  await Promise.all(
    siteTags.map(async (siteTag) => {
      siteTagOptions[siteTag] = await getOptions(siteTag);
    })
  );
  return siteTagOptions;
}
