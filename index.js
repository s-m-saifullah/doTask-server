const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("doTask Server is Running");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.f1cm5cm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const taskCollection = client.db("doTask").collection("tasks");
    app.post("/tasks", async (req, res) => {
      const task = req.body;
      console.log(task);

      const result = await taskCollection.insertOne(task);

      res.send(result);
    });

    app.get("/tasks", async (req, res) => {
      const queryStr = req.query.q;
      const query = queryStr === "completed";
      const filter = { completed: query };
      const cursor = taskCollection.find(filter);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: ObjectId(id),
      };

      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const completedStr = req.query.completed;
      const completed = completedStr === "true";
      const filter = {
        _id: ObjectId(id),
      };

      const options = {
        upsert: true,
      };

      const updatedTask = {
        $set: {
          completed: completed,
        },
      };

      const result = await taskCollection.updateOne(
        filter,
        updatedTask,
        options
      );

      res.send(result);
    });

    app.patch("/tasks/edit/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const task = data.task;
      const query = {
        _id: ObjectId(id),
      };
      const updateTask = {
        $set: {
          task: task,
        },
      };
      const options = {
        upsert: true,
      };

      const result = await taskCollection.updateOne(query, updateTask, options);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err));

app.listen(port, () => {
  console.log(`doTask Server is Running on Port ${port}`);
});