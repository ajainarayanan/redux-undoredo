#### Redux Undo Redo Reducer
This is the bare bones implementation of undo-redo functionality for any redux stores.

#### Why not use omnidan/redux-undo?
omnidan/redux-undo is an amazing library and I have used it in the past for other projects. The reason I wrote this one is because I needed an independent reducer, that is not a wrapper/higher-order reducer for another reducer.

#### TL;DR -
Didn't want to change all my reducers of the same store to use `mystore.getState().something.present` because I have added one reducer that is changing the states' structure. I wanted a reducer that can play along with others just fine and have `UNDO` & `REDO` actions.

##### GOTCHAS?

###### TL;DR -
  Either you can use the higher-order reducer and change all your reducers to use new store structure (present, past & future) or you can reduce your reducers to be used in parallel and not change the existing reducers.

  Either way I feel is a good approach. Its just that I was too lazy to modify all my reducers & hence reducing my reducers for undo-redo.

#### How to use?

If you want multiple functions as part of your reducer then you need to reduce your reducers while passing it to the `combineReducers` function in `Redux`. So this reducer has to be the last in that case as it has to be executed at the end to capture change in the state(s) and perform an `UNDO` and `REDO` actions appropriately.

You could either use `reduce-reducers` or you could simple implement it yourselves in your `configureStore` if you have one before creating a `Redux` store.

A Naive implementation would look something like this,

```
//app.js
const reducersMap = {
  nodes: [ otherReducer, undoRedoReducer([], filterActions) ],
  graph: [ graphReducer ]
}
var mystore = configureStore(reducersMap);

//store.js
const defaultNodesReducer = (state = [], action = {}) => { ... }
const connections = (state = [], action = {}) => { ... }
const defaultGraphReducer = (state = {}, action = {}) => { ... }
const defaultReducersMap = () => {
  return {
    nodes: [ (state = [], action = {}) => state ],
    graph: [ (state = {}, action = {}) => state ]
  }
};

let combinedReducers = (reducersMap = defaultReducersMap()) => {
  let nodesReducers = [defaultNodesReducer].concat(reducersMap['nodes']);
  let graphReducers = [defaultGraphReducer].concat(reducersMap['graph']);

  return combineReducers({
    nodes: (state, action) => {
      return nodesReducers
        .reduce((prev, curr) => curr.bind(null, prev(state, action), action))();
    },
    connections,
    graph: (state, action) => {
      return graphReducers
        .reduce((prev, curr) => curr.bind(null, prev(state, action), action))();
    }
  });

};

export default configureStore(reducersMap) {
  let store = createStore(
    combinedReducers(reducersMap),
    data,
    applyMiddleware.apply(null, middlewares)
  );
  return store;
}

```
