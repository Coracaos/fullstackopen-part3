const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
require('dotenv').config()

const Person = require('./models/person')

morgan.token('post-body', (req, res) => {
  if(req.method === 'POST'){
    return JSON.stringify(req.body)
  }else{
    return null
  }
})

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :response-time ms - :res[content-length] - :post-body'))

app.get('/info', (request, response) => {
  Person.find({})
  .then(contacts => {
    const count = contacts.length
    const date = new Date()
    const currentTime = date.toString()
    response.send(`
      <p>Phonebook has info for ${count}</p> 
      <p>${currentTime}</p>
    `)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(contacts => response.json(contacts))
})

app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id)
  .then(contact => {
    if(contact){
      response.json(contact)
    }else{
      response.status(403).end()
    }
  })
  .catch(error => next(error))

})

app.post('/api/persons', (request, response, next) => {
  const body = request.body 

  if(!body.name){
    return response.status(400).json({
      error: 'name missing'
    })
  }

  if(!body.number){
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const contact = new Person({
    name : body.name,
    number : body.number
  })

  contact.save()
  .then(savedContact => {
    response.json(savedContact)
  })
  .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body 
  const contact = {
    name: body.name,
    number: body.number 
  }

  Person.findByIdAndUpdate(request.params.id, contact, {new: true, runValidators: true, context: 'query'})
  .then(updatedContact => {
    response.json(updatedContact)
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})