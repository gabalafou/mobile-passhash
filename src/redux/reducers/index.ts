import { combineReducers } from 'redux';
import siteTagList from './siteTagList';
import hasher from './hasher';

export default combineReducers({ siteTagList, hasher });
