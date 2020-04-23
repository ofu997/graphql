import React from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { token } from '../token.js';
const axiosGHGQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${ token }`,
  },
});

const title = 'React GraphQL Github Client'; 

function App() {
  return (
<div>
  <h1>{ title }</h1>
</div>
  );
}

export default App;
