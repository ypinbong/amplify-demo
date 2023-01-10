import './App.css';
import { useState, useEffect } from 'react';
import { withAuthenticator, Text, Flex, View, Badge, Button } from '@aws-amplify/ui-react';
import { listTodos } from './graphql/queries'
import { API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './graphql/mutations'

function App({user, signOut}) {
  const [todos, setTodos] = useState([])
  useEffect(() => {
    const fetchTodos = async() => {
      try {
        const res = await API.graphql(graphqlOperation(listTodos))
        console.log('App.jsx ~ Line 14: res', res);
      } catch (err) {
        console.log('App.jsx ~ Line 16: err', err);
      }
      // setTodos(res.data.)
    }
    fetchTodos()
  }, [])
  
  return (
    <>
      <Flex direction="column" padding={8}>
        <Text>Logged in as <b>{user.username}</b><Button variation='link' onClick={signOut}>Sign out</Button></Text>
      </Flex>
      <Button onClick={() => {
        API.graphql(graphqlOperation(createTodo, {
            input: {
            content: window.prompt('content?'),
            }
        }))
      }}>Add todo</Button>
    </>
  );
}

export default withAuthenticator(App);
