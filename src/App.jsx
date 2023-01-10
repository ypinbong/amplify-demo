import './App.css';
import { useState, useEffect } from 'react';
import { withAuthenticator, Text, Flex, View, Badge, Button } from '@aws-amplify/ui-react';
import { listTodos } from './graphql/queries'
import { API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './graphql/mutations'

function App({user, signOut}) {
  const [todos, setTodos] = useState([])
  const [todo, setTodo] = useState('')
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
  const submitHandler = () => {
    API.graphql(graphqlOperation(createTodo, {
      input: {
      content: todo,
      }
    }))
  }
  
  return (
    <>
      <Flex direction="column" justifyContent="center" alignItems="center" padding={8}>
        <Text>Welome <b>{user.username}</b><Button variation='link' onClick={signOut}>Sign out</Button></Text>
        <Flex>
          <input onChange={(e)=>setTodo(e.target.value)} />
          <Button onClick={submitHandler}>Add a todo</Button>
        </Flex>
        <Flex direction="column">
          todos.map(item => (
              return item
            )
          )
        </Flex>
      </Flex>
    </>
  );
}

export default withAuthenticator(App);
