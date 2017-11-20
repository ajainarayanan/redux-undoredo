#### Redux Undo Redo Reducer
This is the bare bones implementation of undo-redo functionality for any redux stores.

#### Why not use omnidan/redux-undo?
omnidan/redux-undo is an amazing library and I have used it in the past for other projects. The reason I wrote this one is because I needed an independent library that I can use to just have the undo-redo capability as an add-on/enhancer to the already existing redux store.

Anybody who wants this feature doesn't necessarily have to change all subscribers to use the `present` state. A developer shouldn't have to care about the undo-redo capability while writing a reducer/subscribing to store.

#### TL;DR -
Wanted a extendable architecture where undo-redo was just another extension I wanted to add to my store.
Didn't want to change all my subscribers of the same store to use `mystore.getState().something.present` because I have added one reducer that is changing the state's structure. I wanted a library that can play along with others just fine and have `UNDO` & `REDO` actions.

Either you can use the higher-order reducer and,
- Change all your subscribers to use new store structure (present, past & future)
- Have undo or redo operation undo or redo all the reducers that are using higher-order reducers [1].

or
- You can enhance your store to have undo-redo capability
- And `RESET`/cleanup when store is no longer needed.

Either way I feel is a good approach. Its just that I wanted a more enhanceable architecture where I can plug-in reducers and enhancers based on my needs while creating the store.

#### How to use?

`npm install redux-undoredo --save`


The library as it is exports a redux-enhancer. This needs to be passed to `createStore` as something like this,

```js
  import undoredoEnhancer  from 'redux-undoredo';

  let store = createStore(
    rootReducer,
    initialState,
    compose.apply(
      null,
      applyMiddleware.apply(null, middlwares),
      undoredoEnhancer() // <-- this is where the enhancers go.
    )
  )
```

Enhancers are nothing but an extensions to redux store. Its an organic way of adding functionality to the redux store api to enhance its behavior. For more details you could read  the documentation  for [redux-enhancers here](https://github.com/reactjs/redux/blob/master/docs/Glossary.md#store-enhancer)

Once you have enhanced your store you could now dispatch actions like the following,

```js
  ...
  dispatch({type: 'UNDO'});
  ...
  dispatch({type: 'REDO'});
```

The above actions will automatically undo or redo your actions and restore your state.

##### GOTCHAS?

The seamless way to extend the behavior of the store comes with one side-effect that needs to be taken care of while resetting things to normalcy (initial state).

If you are navigating away or is no longer going to use the store you NEED to dispatch a reset action to reset the localStore maintained as part of the enhancer to be reset. So make sure you do ```dispatch({type: 'RESET'})``` before exiting the state or think the store is no longer needed.

##### Due credits :)
The idea of making redux-undoredo was heavily inspired from the idea of redux-devtools. You should definitely check it out if you want to learn more about redux enhancers.

##### Word of caution:
I am still experimenting with the library. I am not sure if this is the right approach or not. So if you are trying to use it.... you have been warned :).

[1] - This is the use case I bumped which made me think about making this library as an enhancer,

configstore.js
```js
const rootReducer = combineReducer({
  nodes: undoable(nodesReducer),
  connections: undoable(connectionsReducer)
});
let store = createStore(
  rootReducer
);
```

Now lets say I add two nodes and connect them together. The state's transition goes something like this,

```js
initialState -  {
  nodes: [],
  connections: []
};

State 1 - {
  nodes: [node1],
  connections: []
};

State 2 - {
  nodes: [node1, node2],
  connections: []
};

State 3 - {
  nodes: [node1, node2],
  connections: [{from: node1, to: node2}]
};
```

Now when I undo my last action and go to back to my previous state, my expectation is to remove just the last connection I created. Something like this,

```js
 Undo State - {
   nodes: [node1, node2],
   connections: []
 };
 ```

 However since you wrapped both nodes and connections with `undoable` now both will handle the undo independently. Instead of my expected state the following state will be resolved,

 ```js
 undoable's version of State - {
   nodes: [node1],
   connections: []
 };
 ```

This is expected as we have an undoable high-order reducer on both nodes and connections.
