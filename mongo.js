const mongoose = require('mongoose')

if (process.argv.length === 5) {
  savePerson();
} else if (process.argv.length === 3){
  getPersons();
} else {
  console.log('give 1 param (password) to list people or 3 params (password, name, number) to add person');
  process.exit(1)
}

function getModelPerson(){
  const password = process.argv[2]
  const url = `mongodb+srv://admin:${password}@cluster-initial.0asu2hw.mongodb.net/phonebook?retryWrites=true&w=majority`;

  mongoose.set('strictQuery',false)
  mongoose.connect(url)

  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

  return mongoose.model('Person', personSchema)
}

function savePerson(){
  const Person = getModelPerson();
  const newPerson = new Person({
    name: process.argv[3],
    number: process.argv[4]
  });
  newPerson.save().then(result => {
    console.log(`added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
}

function getPersons(){
  const Person = getModelPerson();
  console.log('phonebook:');
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`);
    });
    mongoose.connection.close();
  })
}
