/*
@flow
*/
type Action = Object;
import equal from 'deep-equal';
import sortKeys from 'sort-keys';

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
        return localHistory[pivot - 1];
      case 'REDO':
        if (localHistory.length === pivot) {
          return state;
        }
        pivot += 1;
        return localHistory[pivot - 1];
      case 'RESET':
        localHistory = [defaultValue];
        pivot = 1;
        return defaultValue;
      // FIXME: This can be better. Need to figure out if there is anyother
      // init events or signals that we can listen to.
      case '@@redux/INIT':
        defaultValue = state;
        return state;
      default:
        if (isStateSameAsPresent(state, localHistory[pivot])) {
          return state;
        }

        localHistory = localHistory.slice(0 , pivot);
        localHistory.push(state);
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


const undoredoEnhancer = () => {
  return (createStore: Function) => {
    return (reducer: Function, preloadedstate : ?Object, enhancer : ?Function) => {
      const localStore = createStore(
        reducerWrapper(reducer, preloadedstate),
        preloadedstate,
        enhancer
      );
      return {
        ...localStore
      };
    }
  }
};

export default undoredoEnhancer;
