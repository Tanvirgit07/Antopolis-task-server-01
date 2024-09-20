const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const multer = require("multer");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j10pchd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

async function run() {
  try {
    await client.connect();
    const database = client.db("antopolis");
    const categoryCollection = database.collection("category");
    const animalCollection = database.collection("animal");

    // API endpoint to save a category
    app.post("/api/categories", async (req, res) => {
      const { name } = req.body;

      try {
        const category = { name };
        const result = await categoryCollection.insertOne(category);
        res.status(201).json({ message: "Category saved successfully", data: result });
      } catch (error) {
        console.error("Error saving category:", error);
        res.status(500).json({ message: "Error saving category" });
      }
    });

    // API endpoint to fetch all categories
    app.get("/api/categories", async (req, res) => {
      try {
        const categories = await categoryCollection.find({}).toArray();
        res.status(200).json(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories" });
      }
    });

    // API endpoint to fetch all animals
    app.get("/api/animals", async (req, res) => {
      try {
        const animals = await animalCollection.find({}).toArray();
        res.status(200).json(animals);
      } catch (error) {
        console.error("Error fetching animals:", error);
        res.status(500).json({ message: "Error fetching animals" });
      }
    });

    // API endpoint to save an animal
    app.post("/api/animals", upload.single("image"), async (req, res) => {
      const { name } = req.body;
      const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // Use the public path

      try {
        const animal = { name, image: imagePath };
        const result = await animalCollection.insertOne(animal);
        res.status(201).json({ message: "Animal saved successfully", data: result });
      } catch (error) {
        console.error("Error saving animal:", error);
        res.status(500).json({ message: "Error saving animal" });
      }
    });

    console.log("Connected to MongoDB!");
  } finally {
    // Do not close the client in production
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Antopolis is running");
});

app.listen(port, () => {
  console.log(`Antopolis is running on ${port}`);
});
