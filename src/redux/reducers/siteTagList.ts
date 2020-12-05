import { SET_SITE_TAG_LIST, ADD_SITE_TAG, REMOVE_SITE_TAG } from "../actionTypes";

const initialState = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_SITE_TAG_LIST: {
      const siteTagList = action.payload;
      return siteTagList;
    }
    case ADD_SITE_TAG: {
      const siteTag = action.payload;
      return [...state, siteTag];
    }
    case REMOVE_SITE_TAG: {
      const siteTag = action.payload;
      return state.filter(value => value !== siteTag);
    }
    default:
      return state;
  }
}
