import {
  SET_SITE_TAG_LIST,
  REMOVE_SITE_TAG,
  SET_SITE_TAG,
  SET_PASSWORD_OPTIONS,
} from "./actionTypes";

export const setSiteTagList = siteTagList => ({
  type: SET_SITE_TAG_LIST,
  payload: siteTagList,
});

export const removeSiteTag = siteTag => ({
  type: REMOVE_SITE_TAG,
  payload: siteTag,
});

export const setSiteTag = (siteTag, passwordOptions = null) => ({
  type: SET_SITE_TAG,
  payload: siteTag,
});

export const setPasswordOptions = passwordOptions => ({
  type: SET_PASSWORD_OPTIONS,
  payload: passwordOptions,
});
