const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

morgan.token('post-body', (req, res) => {
  if(req.method === 'POST'){
    return JSON.stringify(req.body)
  }else{
    return null;
  }
})

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :response-time ms - :res[content-length] - :post-body'))

let contacts = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
  const count = contacts.length
  const date = new Date()
  const currentTime = date.toString()
  response.send(`
  <p>Phonebook has info for ${count}</p>
  <p>${currentTime}</p>
  `)
})

app.get('/api/persons', (request, response) => {
  response.json(contacts)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const contact = contacts.find(c => c.id === id)
  if(contact){
    response.json(contact)
  }else{
    response.status(404).end()
  }
})

const generateId = () => {
  return Math.ceil(Math.random() * 10000000)
}

app.post('/api/persons', (request, response) => {
  const body = request.body 

  if(!body.name){
    return response.status(400).json({
      error: 'name missing'
    })
  }

  const matchByName = c => c.name.toUpperCase() == body.name.toUpperCase()

  if(contacts.some(matchByName)){
    return response.status(400).json({
      error: 'name must be unique'
    })
  }
  
  if(!body.number){
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const contact = {
    id : generateId(),
    name : body.name,
    number : body.number
  }

  contacts = contacts.concat(contact)
  response.json(contact)

})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  contacts = contacts.filter(c => c.id !== id)
  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})