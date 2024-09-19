const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j10pchd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

async function run() {
  try {
    await client.connect();
    const database = client.db("antopolis");
    const categoryCollection = database.collection("category");
    const animalCollection = database.collection('animal');

    // Ping the server
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");

    // API endpoint to save a category
    app.post("/api/categories", async (req, res) => {
      const { name } = req.body; // Get the category name from the request body

      try {
        const category = { name }; // Create a new category object
        const result = await categoryCollection.insertOne(category); // Insert the category into the collection

        res.status(201).json({ message: "Category saved successfully", data: result });
      } catch (error) {
        console.error("Error saving category:", error);
        res.status(500).json({ message: "Error saving category" });
      }
    });

    // API endpoint to save an animal
    app.post("/api/animals", upload.single('image'), async (req, res) => {
      const { name } = req.body; // Get the animal name from the request body
      const imagePath = req.file.path; // Get the image path from the request file

      try {
        const animal = { name, image: imagePath }; // Create a new animal object
        const result = await animalCollection.insertOne(animal); // Insert the animal into the collection

        res.status(201).json({ message: "Animal saved successfully", data: result });
      } catch (error) {
        console.error("Error saving animal:", error);
        res.status(500).json({ message: "Error saving animal" });
      }
    });
  } finally {
    // Uncomment the line below if you want to close the client after each request (not recommended in production)
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Antopolis is running");
});

app.listen(port, () => {
  console.log(`Antopolis is running on ${port}`);
});
