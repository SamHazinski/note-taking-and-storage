const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { readFromFile, readAndAppend } = require('./helpers/fsUtils');
const PORT = process.env.PORT || 3001;
const app = express();
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));



app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('/api/notes', (req, res) => {
    console.info(`${req.method} note request recived`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
  });

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request was recieved`);
    const {title, text} = req.body;
    if (title && text){
    const newNote = {
        title, 
        text,
        id: uuidv4(),
    };
    readAndAppend(newNote, './db/db.json');
    const response = {
        status: 'success',
        body: newFeedback,
      };
      res.json(response);
    }

})

app.delete('/api/notes/:id', (req, res) => {
    // Read the db.json file
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Parse the JSON data to an array of notes
        let notes = JSON.parse(data);

        // Find the index of the note with the specified id
        const noteIndex = notes.findIndex(note => note.id === req.params.id);

        // If note with id is found, remove it
        if (noteIndex !== -1) {
            notes.splice(noteIndex, 1);

            // Write the updated notes array back to the db.json file
            fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                res.json({ message: 'Note deleted successfully' });
            });
        } else {
            res.status(404).json({ error: 'Note not found' });
        }
    });
});




app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
