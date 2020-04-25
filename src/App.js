import React from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import { token } from './token.js';
const axiosGHGQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${
      process.env.REACT_APP_token
    }`,
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

const getRepositoryOfOrganization = `
{
  organization(login: "the-road-to-learn-react") {
    name
    url
    repository(name: "the-road-to-learn-react") {
      name
      url
    }
  }
}
`;

// will change from template literal variable to () => template literal variable
const getIssuesOfRepository = `
{
  organization(login: "the-road-to-learn-react") {
    name
    url
    repository(name: "the-road-to-learn-react") {
      name
      url
      issues(last: 5) {
        edges {
          node {
            id
            title
            url
          }
        }
      }
    }
  }
}
`;

const title = 'React GraphQL Github Client'; 

class App extends React.Component {
  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: null,
    errors: null,
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
    .post('', { query: getIssuesOfRepository })
    .then(result => 
      this.setState(() => ({
        organization: result.data.data.organization,
        errors: result.data.errors,
      })),      
    );      
  };

  render() {
    const { path, organization, errors } = this.state; 
    return (
      <div>
        <h1>{ title }</h1>
        <form onSubmit = { this.onSubmit }>
          <label htmlFor = 'url'>
            Show open issues for Github
            <input
              id="url"
              type="text"
              value = { path }
              onChange = { this.onChange }
              style = {{ width: '300px' }}
            />
            <button type="submit">Search</button>
          </label>
        </form>
        <hr />
        {
          organization ?  
          <Organization 
            organization = { organization } 
            errors = { errors } 
          />
          : <p>No information yet</p>
        }
      </div>
    );
  }
} // App

const Organization = ({ organization, errors }) => {
  if (errors) {
    return(
      <p>
        <strong>Something went wrong:</strong>
        {errors.map(error => error.message).join(' ')}
      </p>
    )
  }

  return(
    <div>
      <p>
        <strong>Issues from Organization: </strong>
        <a href = { organization.url }>{ organization.name }</a>
      </p>
      <Repository 
        repository = { organization.repository }
      />
    </div>
  )
} // Organization

const Repository = ({ repository }) => 
  <div>
    <p>
      <strong>In Repository: </strong>
      <a href = { repository.url }>{ repository.name }</a>
    </p>

    <ul>
      {
        repository.issues.edges.map(issue => (
          <li key={issue.node.id}>
            <a href={issue.node.url}>{issue.node.title}</a>
          </li>
        ))        
      }
    </ul>
  </div>


export default App;
