var mocha = require('mocha');
var expect = require('expect.js');

import {combineReducers, createStore, applyMiddleware, compose} from 'redux';
import undoredoEnhancer from '../dist/redux-undoredo.js';
import { nodes, connections } from './reducers';
import uuid from 'node-uuid';
import { addNode, removeNode, addConnection, resetStore, undoLastAction, redoLastUndoAction} from './action-creators';

var store,
    initialState = {
      nodes: [],
      connections: []
    };

const generateNode = () => {
  let lameid = uuid.v4();
  return {
    id: lameid,
    name: `Node-${lameid}`
  };
};

before(function() {
  store = createStore(
    combineReducers({ nodes, connections }),
    initialState,
    undoredoEnhancer()
  );
});

describe('Base case - Store should work', function() {
  it('Store with a initial state', function() {
    let state = store.getState();
    expect(state).to.eql(initialState);
  });
  it('Modify store - Add a node', function() {
    let node1 = generateNode();
    addNode(node1, store);
    expect(store.getState()).to.eql({
      nodes: [node1],
      connections: []
    });
    resetStore(store);
  });

  it('Modify store - Add a connection', function() {
    let node1 = generateNode(),
        node2 = generateNode();
    let conn1 = {from: node1.id, to: node2.id};
    addNode(node1, store);
    addNode(node2, store);
    addConnection(conn1, store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: [conn1]
    });
    resetStore(store);
  });

  it('Modify store - Remove a node', function() {
    let node1 = generateNode(),
        node2 = generateNode();
    let conn1 = {from: node1.id, to: node2.id};
    addNode(node1, store);
    addNode(node2, store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: []
    });
    removeNode(node1.id, store);
    expect(store.getState()).to.eql({
      nodes: [node2],
      connections: []
    });
    resetStore(store);
  });
});

describe('Enhancer 1 - UNDO should work', function() {
  it('Case 1 - Undo adding a node', function() {
    let node1 = generateNode(),
        node2 = generateNode();
    addNode(node1, store);
    addNode(node2, store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: []
    });
    undoLastAction(store);
    expect(store.getState()).to.eql({
      nodes: [node1],
      connections: []
    });
    undoLastAction(store);
    expect(store.getState()).to.eql(initialState);
    resetStore(store);
  });
  it('Case 2 - Undo adding a connection', function() {
    let node1 = generateNode(),
        node2 = generateNode();
    let conn1 = {from: node1.id, to: node2.id};
    addNode(node1, store);
    addNode(node2, store);
    addConnection(conn1, store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: [conn1]
    });
    undoLastAction(store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: []
    });
    resetStore(store);
  });
});

describe('Enhancer 2 - REDO should work', function() {
  it('Case 1 - Redo removing a node', function() {
    let node1 = generateNode(),
        node2 = generateNode();
    addNode(node1, store);
    addNode(node2, store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: []
    });
    undoLastAction(store);
    expect(store.getState()).to.eql({
      nodes: [node1],
      connections: []
    });
    redoLastUndoAction(store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: []
    });
    resetStore(store);
  });
  it('Case 2 - Redo removing a connection', function() {
    let node1 = generateNode(),
        node2 = generateNode();
    let conn1 = {from: node1.id, to: node2.id};
    addNode(node1, store);
    addNode(node2, store);
    addConnection(conn1, store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: [conn1]
    });
    undoLastAction(store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: []
    });
    redoLastUndoAction(store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: [conn1]
    });
    resetStore(store);
  });
});

// Potentially there could be a lot of possibilities for this case.
// Will do it the hard way of un-earth'ing more bugs when I encounter them.
describe('Enhancer 3 - Mixing UNDO & REDO & Normal operation', function() {
  it ('Case 1 - \"ADD - ADD - UNDO - ADD - REDO\" should work for nodes', function() {
    let node1 = generateNode(),
        node2 = generateNode();
    addNode(node1, store);
    addNode(node2, store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: []
    });
    undoLastAction(store);
    undoLastAction(store);
    expect(store.getState()).to.eql(initialState);
    let node3 = generateNode();
    addNode(node3, store);
    expect(store.getState()).to.eql({
      nodes: [node3],
      connections: []
    });
    redoLastUndoAction(store);
    redoLastUndoAction(store);
    redoLastUndoAction(store);
    expect(store.getState()).to.eql({
      nodes: [node3],
      connections: []
    });
    resetStore(store);
  });
  it('Case 2 - \"ADD - ADD - UNDO - ADD - REDO\" should work for connections', function() {
    let node1 = generateNode(),
        node2 = generateNode();
    let conn1 = {from: node1.id, to: node2.id};
    addNode(node1, store);
    addNode(node2, store);
    addConnection(conn1, store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: [conn1]
    });
    undoLastAction(store);
    let node3 = generateNode(),
        node4 = generateNode();
    let conn2 = {from: node3.id, to: node4.id};
    addConnection(conn2, store);
    redoLastUndoAction(store);
    redoLastUndoAction(store);
    redoLastUndoAction(store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: [conn2]
    });
    resetStore(store);
  });
});

describe('Enhancer 4 - Worst cases', function() {
  it('Case 1 - Should not undo beyond initial state', function() {
    expect(store.getState()).to.eql({
      nodes: [],
      connections: []
    });
    undoLastAction(store);
    undoLastAction(store);
    undoLastAction(store);
    expect(store.getState()).to.eql({
      nodes: [],
      connections: []
    });
  });
  it('Case 2 - Should not undo beyond initial state after undo\'ing all history states', function() {
    let node1 = generateNode(),
        node2 = generateNode();
    addNode(node1, store);
    addNode(node2, store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: []
    });
    undoLastAction(store);
    undoLastAction(store);
    undoLastAction(store);
    undoLastAction(store);
    undoLastAction(store);
    expect(store.getState()).to.eql({
      nodes: [],
      connections: []
    });
    resetStore(store);
  });
  it('Case 3 - Should not redo beyond initial state', function() {
    expect(store.getState()).to.eql({
      nodes: [],
      connections: []
    });
    redoLastUndoAction(store);
    redoLastUndoAction(store);
    redoLastUndoAction(store);
    expect(store.getState()).to.eql({
      nodes: [],
      connections: []
    });
  });
  it('Case 4 - Should not redo beyond current state after redo\'ing all undo states', function() {
    let node1 = generateNode(),
        node2 = generateNode();
    addNode(node1, store);
    addNode(node2, store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: []
    });
    undoLastAction(store);
    expect(store.getState()).to.eql({
      nodes: [node1],
      connections: []
    });
    redoLastUndoAction(store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: []
    });
    redoLastUndoAction(store);
    redoLastUndoAction(store);
    redoLastUndoAction(store);
    redoLastUndoAction(store);
    expect(store.getState()).to.eql({
      nodes: [node1, node2],
      connections: []
    });
    resetStore(store);
  });
});
