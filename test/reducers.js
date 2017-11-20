export function nodes(state = [], action = {}) {
  switch(action.type) {
    case 'ADD-NODE':
      let {id, name} = action.payload.node;
      return [
        ...state,
        { id, name }
      ];
    case 'REMOVE-NODE':
      return state.filter( node => node.id !== action.payload.nodeId );
    case 'MODIFY_NODE': {
      let newState = state.map(node => {
        if (node.id === action.payload.nodeId) {
          return {
            ...node,
            name: action.payload.name
          };
        }
        return node;
      });
      console.log(newState);
      return newState;
    }
    default:
      return state;
  }
}

export function connections(state = [], action = {}) {
  switch(action.type) {
    case 'ADD-CONNECTION':
      let {from, to} = action.payload.connection;
      return [
        ...state,
        { from, to }
      ];
    case 'SET-CONNECTIONS':
      return action.payload.connections;
    default:
      return state;
  }
}
