import { SET_PASSWORD_OPTIONS, REMOVE_SITE_TAG, SET_SITE_TAG } from '../actionTypes';
import { defaultPasswordOptions } from '../../constants';


const createInitialState = () => ({
  siteTag: '',
  passwordOptions: { ...defaultPasswordOptions },
});

export default function(state = createInitialState(), action) {
  switch (action.type) {
    case SET_PASSWORD_OPTIONS: {
      const passwordOptions = action.payload;
      return {
        ...state,
        passwordOptions,
      };
    }
    case REMOVE_SITE_TAG: {
      const siteTag = action.payload;
      return state.siteTag === siteTag ? createInitialState() : state;
    }
    case SET_SITE_TAG: {
      const siteTag = action.payload;
      return {
        ...state,
        siteTag,
      };
    }
    default: {
      return state;
    }
  }
}
