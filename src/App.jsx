import './App.css';
import { useState, useEffect } from 'react';
import { withAuthenticator, Text, Flex, View, Badge, Button, TextAreaField } from '@aws-amplify/ui-react';
import { listTodos } from './graphql/queries'
import { API, graphqlOperation } from 'aws-amplify'
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations'
import { onCreateTodo, onUpdateTodo, onDeleteTodo } from './graphql/subscriptions';

function App({user, signOut}) {
  const [todos, setTodos] = useState([])
  const [todo, setTodo] = useState('')
  const [errMsg, setErrMsg] = useState('')

  const fetchTodos = async() => {
    try {
      const res = await API.graphql(graphqlOperation(listTodos))
      setTodos(res.data.listTodos.items)
    } catch (err) {
      console.log('App.jsx ~ Line 16: err', err);
    }
  }
  
  const submitHandler = async() => {
    if (!todo) {
      setErrMsg("Please enter task!")
      return
    }
    // const { username } = user
    try {
      const res = await API.graphql(graphqlOperation(createTodo, {
        input: {
          content: todo
        }
      }))
      if (res.data.createTodo.content) {
        setTodo('')
      }
    } catch (err) {
      console.log('App.jsx ~ line 31: err', err);
    }
  }
  
  const deleteHandler = async(id) => {
    API.graphql(graphqlOperation(deleteTodo, {
      input: { id }
    }))
  }

  useEffect(() => {
    fetchTodos()
    const createSub = API.graphql(graphqlOperation(onCreateTodo)).subscribe({
      next: ({ value }) => { setTodos((todos) => [...todos, value.data.onCreateTodo]) }
    })

    const updateSub = API.graphql(graphqlOperation(onUpdateTodo)).subscribe({
      next: ({ value }) => {
        setTodos(todos => {
          const toUpdateIndex = todos.findIndex(item => item.id === value.data.onUpdateTodo.id)
          if (toUpdateIndex === - 1) { // If the todo doesn't exist, treat it like an "add"
            return [...todos, value.data.onUpdateTodo]
          }
          return [...todos.slice(0, toUpdateIndex), value.data.onUpdateTodo, ...todos.slice(toUpdateIndex + 1)]
        })
      }
    })

    const deleteSub = API.graphql(graphqlOperation(onDeleteTodo)).subscribe({
      next: ({ value }) => {
        setTodos(todos => {
          const toDeleteIndex = todos.findIndex(item => item.id === value.data.onDeleteTodo.id)
          return [...todos.slice(0, toDeleteIndex), ...todos.slice(toDeleteIndex + 1)]
        })
      }
    })

    return () => {
      createSub.unsubscribe()
      updateSub.unsubscribe()
      deleteSub.unsubscribe()
    }
  }, [])
  return (
    <>
      <Flex direction="column" justifyContent="center" alignItems="center" padding={8}>
        <div>Welome <b style={{textTransform: 'capitalize'}}>{user.username}</b><Button variation='link' onClick={signOut}>Sign out</Button></div>
        <Flex direction="column">
          <TextAreaField value={todo} onChange={(e)=>setTodo(e.target.value)} />
          {errMsg&&<Text color="red" textAlign="center">{errMsg}</Text>}
          <Button style={{background: '#047d95', color: '#fff'}} onClick={submitHandler}>Add a todo</Button>
        </Flex>
        <Flex direction="column" textAlign="center" width={'300px'}>
          {todos.length?todos?.map(item => {
            return (
              <Flex direction="column" textAlign="left" border="1px solid #767676" borderRadius={'2px'} padding={8} key={item.id}>
                <Text fontWeight={'bold'}>{item.content}</Text>
                <View>
                  👨‍👩‍👦‍👦 {item?.owners?.map(owner => <Badge margin={4}>{owner}</Badge>)}
                </View>
                <Button onClick={async () => {
                  API.graphql(graphqlOperation(updateTodo, {
                    input: {
                      id: item.id,
                      owners: [...item?.owners, window.prompt('Share with whom?')]
                    }
                  }))
                }}>Share ➕</Button>
                <Button style={{background: '#000', color: '#fff'}} onClick={()=>deleteHandler(item.id)}>Delete</Button>
              </Flex>
            )
          }):<Text>No Todo's to display!</Text>}
        </Flex>
      </Flex>
    </>
  );
}

export default withAuthenticator(App);
