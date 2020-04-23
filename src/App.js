import React from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { token } from './token.js';
const axiosGHGQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${ token }`,
  },
});

const GET_ORGANIZATION = `
{
  organization(login: "the-road-to-learn-react") {
    name
    url
  }
}
`;

const title = 'React GraphQL Github Client'; 

class App extends React.Component {
  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    };
    componentDidMount() {
      this.onFetchFromGitHub();
    }
    onChange = event => {
    this.setState({ path: event.target.value });
    };
    onSubmit = event => {
    // fetch data
    event.preventDefault();
  };  
  onFetchFromGitHub = () => {
    axiosGHGQL
    .post('', { query: GET_ORGANIZATION })
    .then(result => console.log(result));
  };

  render() {
    const { path } = this.state; 
    return (
      <div>
        <h1>{ title }</h1>
        <form onSubmit = { this.onSubmit }>
          <label htmlFor = 'url'>
            Show open issues for Github
            <input
              id="url"
              type="text"
              value={ path }
              onChange={ this.onChange }
              style={{ width: '300px' }}
            />
            <button type="submit">Search</button>
          </label>
        </form>
        <hr />
        {/* result here */}
      </div>
    );
  }
}

export default App;
