const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the public folder (CSS, JS, Images)
app.use(express.static('public'));

// Define the root route to serve your HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:3000/`);
});

  
