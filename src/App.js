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
// tip: double quotes needed
const getIssuesOfRepositoryQuery = (organization, repository) =>`
{
  organization(login: "${organization}") {
    name
    url
    repository(name: "${repository}") {
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

// refactor the query variable again to a template literal that defines inline variables
const GET_ISSUES_OF_REPOSITORY = `
query ($organization: String!, $repository: String!, $cursor: String) {
  organization(login: $organization) {
    name
    url
    repository(name: $repository) { 
      name
      url
      issues(first: 5, after: $cursor, states: [OPEN]) {
        edges {
          node {
            id
            title
            url
            reactions(last: 10) {
              edges {
                node {
                  id
                  content
                }
              }
            }
          }
        }
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
}
`;


const getIssuesOfRepository = (path, cursor) => {
  const [organization, repository] = path.split('/');
  return axiosGHGQL.post('', {
    query: GET_ISSUES_OF_REPOSITORY,
    variables: { organization, repository, cursor }, 
  });
};

// const resolveIssuesQuery = queryResult => () => ({
//   organization: queryResult.data.data.organization,
//   errors: queryResult.data.errors,
// });

const resolveIssuesQuery = (queryResult, cursor) => state => {
  const { data, errors } = queryResult.data;
  if (!cursor) {
    return {
    organization: data.organization,
    errors,
    };
  }
  const { edges: oldIssues } = state.organization.repository.issues;
  const { edges: newIssues } = data.organization.repository.issues;
  const updatedIssues = [...oldIssues, ...newIssues];
  return {
    organization: {
      ...data.organization,
      repository: {
        ...data.organization.repository,
        issues: {
        ...data.organization.repository.issues,
        edges: updatedIssues,
        },
      },
    },
    errors,
  };
}

const title = 'React GraphQL Github Client'; 

class App extends React.Component {
  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: null,
    errors: null,
    };
    componentDidMount() {
      this.onFetchFromGitHub(this.state.path);
    }
    onChange = event => {
    this.setState({ path: event.target.value });
    };
    onSubmit = event => {
      this.onFetchFromGitHub(this.state.path);
      event.preventDefault();
  };  
  onFetchFromGitHub = (path, cursor) => {
    getIssuesOfRepository(path, cursor).then(queryResult => 
      this.setState(
        resolveIssuesQuery(queryResult, cursor), 
      ),      
    );      
  };
  onFetchMoreIssues = () => {
    const {
      endCursor,
      } = this.state.organization.repository.issues.pageInfo;
      this.onFetchFromGitHub(this.state.path, endCursor);
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
            onFetchMoreIssues = { this.onFetchMoreIssues }
          />
          : <p>No information yet</p>
        }
      </div>
    );
  }
} // App

const Organization = ({ organization, errors, onFetchMoreIssues, }) => {
  if (errors) {
    return(
      <p>
        <strong>Something went wrong:</strong>
        {
          errors.map(
            error => error.message
          ).join(' ')
        }
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
        onFetchMoreIssues = { onFetchMoreIssues }
      />
    </div>
  )
} // Organization

const Repository = ({ repository, onFetchMoreIssues, }) => 
  <div>
    <p>
      <strong>In Repository: </strong>
      <a href = { repository.url }>{ repository.name }</a>
    </p>

    <ul>
      {
        repository.issues.edges.map(
          issue => (
            <li key = { issue.node.id }>
              <a href = { issue.node.url }>{ issue.node.title }</a>
              <ul>
                {
                  issue.node.reactions.edges.map(
                    reaction => (
                      <li key = { reaction.node.id }>{ reaction.node.content }</li>
                    )
                  )
                }
              </ul>       
              <hr />     
              <button onClick = { onFetchMoreIssues }>More</button>
            </li>
          )
        )        
      }
    </ul>
  </div>


export default App;
