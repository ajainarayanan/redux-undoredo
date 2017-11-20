/*
@flow
*/
type Action = Object;
import equal from 'deep-equal';
import sortKeys from 'sort-keys';

var clone = require('lodash.clonedeep');

const isStateSameAsPresent = (state : ?any, localState : ?any): boolean => {
  let typeOfState = typeof state;
  let sortedState, sortedLocalState;
  switch(typeOfState) {
    case 'object':
      if (Array.isArray(state)) {
        return equal(state, localState, {strict: true});
      } else {
        sortedState = sortKeys(state);
        sortedLocalState = sortKeys(localState || {});
        if (JSON.stringify(sortedState) === JSON.stringify(sortedLocalState)) {
          return true;
        }
        return false;
      }
    default:
      return state === localState;
  }
};

const undoredoReducer = (initialState: ?Object, filterActions : Array<string> = []) => {

  let localHistory : Array<Object> = [];
  let pivot = 0;
  let defaultValue : Object = {};
  // The state has to be an object and we can be certain that this state receives the default value
  // from the previous reducers all the time.
  // We have defaultValue set to {} to full the contract of return value.
  const undoredo = (state : Object, action : Action = {}) : Object => {
    if (filterActions.indexOf(action.type) !== -1) {
      return state;
    }
    switch(action.type) {
      case 'UNDO':
        if (!localHistory.length || !(pivot - 1)) {
          return defaultValue;
        }
        pivot -= 1;
        return clone(localHistory[pivot - 1]);
      case 'REDO':
        if (localHistory.length === pivot) {
          return state;
        }
        pivot += 1;
        return clone(localHistory[pivot - 1]);
      case 'RESET':
        localHistory = [defaultValue];
        pivot = 1;
        return defaultValue;
      // FIXME: This can be better. Need to figure out if there is anyother
      // init events or signals that we can listen to.
      case '@@redux/INIT':
        defaultValue = clone(state);
        return state;
      default:
        if (isStateSameAsPresent(state, localHistory[pivot])) {
          return state;
        }

        localHistory = localHistory.slice(0 , pivot);
        localHistory.push(clone(state));
        pivot += 1;
        return state;
    }
  };
  return undoredo;
};

const reducerWrapper = (finalreducer: Function, preloadedstate: ?Object) => {
  const undoredo = undoredoReducer(preloadedstate, []);
  return (state, action) => [finalreducer, undoredo]
    .reduce((prev, curr) =>
      curr.bind(null, prev(state, action), action))()
}

/*
  Shameless copy paste from redux. To avoid importing the entire library :(
*/
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      name: 'UNDOREDOSTORE'
    }) : compose;

const undoredoEnhancer = () => {
  return (createStore: Function) => {
    return (reducer: Function, preloadedstate : ?Object, enhancer : ?Function) => {
      const localStore = createStore(
        reducerWrapper(reducer, preloadedstate),
        preloadedstate,
        composeEnhancers()
      );
      return {
        ...localStore
      };
    }
  }
};

export default undoredoEnhancer;
