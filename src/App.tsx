import React from 'react';
import logo from './logo.svg';
import './App.css';
import { store } from './redux-client';
import { useSelector, Provider, useDispatch } from 'react-redux';
import type { initialState } from './common/redux/state';
import { addTodo, delayAddTodo } from './common/redux/actions';

interface AppProps {}


function Todo() {
  const todos = useSelector((state: typeof initialState) => {
    return state.todos;
  });

  const dispatch = useDispatch();

  console.log(todos);
  return <>

    <button onClick={() => dispatch(addTodo('todo'))} className="btn btn-default">
        ADD TODO
    </button>

    <button onClick={() => dispatch(delayAddTodo('delay todo'))} className="btn btn-default">
      delayAddTodo
    </button>

    {todos.map((item, index) =>
      <div key={index}>{item}</div>
    )}
  </>;
}

function App({}: AppProps) {


  return (
    <Provider store={store}>
       <div className="App">
     
     <div className="toolbar-actions">
       <div className="btn-group">
         <button className="btn btn-default">
           <span className="icon icon-home"></span>
         </button>
         <button className="btn btn-default">
           <span className="icon icon-folder"></span>
         </button>
         <button className="btn btn-default active">
           <span className="icon icon-cloud"></span>
         </button>
         <button className="btn btn-default">
           <span className="icon icon-popup"></span>
         </button>
         <button className="btn btn-default">
           <span className="icon icon-shuffle"></span>
         </button>
       </div>

       <button className="btn btn-default">
         <span className="icon icon-home icon-text"></span>
         Filters
       </button>

       <button className="btn btn-default btn-dropdown pull-right">
         <span className="icon icon-megaphone"></span>
       </button>
     </div>

     <Todo />
   </div>

    </Provider>
  );
}

export default App;
