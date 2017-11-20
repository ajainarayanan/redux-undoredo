export function addNode(node, _store) {
  _store.dispatch({
    type: 'ADD-NODE',
    payload: { node }
  });
};
export function removeNode (nodeId, _store) {
  _store.dispatch({
    type: 'REMOVE-NODE',
    payload: { nodeId }
  });
};
export function addConnection(connection, _store) {
  _store.dispatch({
    type: 'ADD-CONNECTION',
    payload: { connection }
  });
};
export function resetStore(_store) {
  _store.dispatch({ type: 'RESET' });
};
export function undoLastAction(_store) {
  _store.dispatch({ type: 'UNDO' });
};
export function redoLastUndoAction(_store) {
  _store.dispatch({ type: 'REDO' });
}
export function modifyNode(nodeId, _store, name) {
  _store.dispatch({
    type: 'MODIFY_NODE',
    payload: {
      name,
      nodeId
    }
  });
}
