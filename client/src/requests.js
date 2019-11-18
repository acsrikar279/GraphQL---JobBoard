import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from 'apollo-boost';
import gql from 'graphql-tag';
import { getAccessToken, isLoggedIn } from './auth';

const endpointURL = 'http://localhost:9000/graphql';

const authLink = new ApolloLink((operation, forward) => {
    if(isLoggedIn()){
        // request.headers['authorization'] = 'Bearer '+getAccessToken();
        operation.setContext({
            headers: {
                authorization: 'Bearer '+ getAccessToken()
            }
        });
    }
    return forward(operation);
});

const client = new ApolloClient({
    link: ApolloLink.from([
        authLink,
        new HttpLink({uri: endpointURL}),
    ]),
    cache: new InMemoryCache(),
});

export async function loadJobs(){
    const query =  gql`{
                jobs {
                    id
                    title
                    company {
                        id
                        name
                    }
                }
            }`;
    const {data: {jobs} } = await client.query({query});
    return jobs;
}

export async function loadJob(id){
    const query= gql`query JobQuery($id: ID!){
                job(id: $id) {
                    id
                    title
                    company {
                        id
                        name
                    }
                    description
                }
            }`;
    const {data: {job}} = await client.query({query, variables: {id}});
    
    return job;
}

export async function loadCompany(id){
    const query = gql`query CompanyQuery($id: ID!){
        company(id: $id){
            id
            name
            description
            jobs{
                id
                title
                description
            }
        }
    }`;
    const {data: {company}} = await client.query({query, variables: {id}});
    // const {company} = await graphqlRequest(query, {id});
    return company;
}

export async function createJob(input){
    const mutation = gql`mutation CreateJob($input: CreateJobInput){
        job: createJob(input : $input) {
          id
          title
          company{
            id
            name
          }
        }
      }`;
      const {data: {job}} = await client.mutate({mutation, variables: {input}})
    //   const {job} = await graphqlRequest(mutation, {input});
      return job;
}

// async function graphqlRequest(query, variables={}){
//     const request = {
//         method: 'POST',
//         headers: {
//             'content-type': 'application/json'
//         },
//         body: JSON.stringify({query,variables})
//     };
//     if(isLoggedIn()){
//         request.headers['authorization'] = 'Bearer '+getAccessToken();
//     }
//     const response = await fetch(endpointURL, request);
//     const responseBody = await response.json();
//     if(responseBody.errors){
//         const message = responseBody.errors.map((error) => error.message.join('\n'));
//         throw new Error(message);
//     }
//     return responseBody.data;
// }