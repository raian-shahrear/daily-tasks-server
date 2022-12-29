require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



// MongoDB database
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASS}@cluster0.xnvdy5u.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    // MDB collections
    const tasksCollection = client.db("daily-tasks").collection("tasks");

    // post/create tasks collection
    app.post("/tasks", async(req, res)=> {
      const task = req.body;
      console.log(task)
      const result = await tasksCollection.insertOne(task);
      res.send(result);
    })

    // get tasks by email
    app.get("/tasks", async(req, res)=> {
      const email = req.query.email;
      const query = {
        userEmail: email
      }
      const result = await tasksCollection.find(query).sort({addingTime: -1}).toArray();
      res.send(result);
    })

    // update task as completed
    app.put("/tasks/:id", async(req, res)=> {
      const id = req.params.id;
      const status = req.body.isCompleted;
      const filter = {_id: ObjectId(id)};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          isCompleted: status
        }
      };
      const result = await tasksCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    //delete task
    app.delete("/tasks/:id", async(req, res)=> {
      const id = req.params.id;
      const filter = {_id: ObjectId(id)};
      const result = await tasksCollection.deleteOne(filter);
      res.send(result);
    })
  }
  finally{}
}
run().catch(err => console.log(err.message))



app.get("/", (req, res) => {
  res.send("Daily Tasks server is running...");
})

app.listen(port, ()=> {
  console.log(`Server is running on port: ${port}`);
})