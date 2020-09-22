const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express')

const app = express();

admin.initializeApp();

app.get('/screams', (req, res) => {
  admin
  .firestore()
  .collection('screams')
  .orderBy('createdAt', 'desc')
  .get()
  .then( (data) => {
    let screams = []
    data.forEach((doc) => {
      screams.push({
        screamId: doc.id,
        body: doc.data().body,
        userhandle: doc.data().userhandle,
        createdAt: doc.data().createdAt,
      })
    })
    return res.json(screams)
  })
  .catch( (err) => console.log(err))
})


app.post('/scream',(req, res) => {
  const newScream = {
    body: req.body.body,
    userhandle: req.body.userhandle,
    createdAt: new Date().toISOString()
  };
  admin
    .firestore()
    .collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({message: `Document ${doc.id} Created Successfully`})
    })
    .catch( (err) => {
      res.status(500).json({error: "Something Went Wrong 😱"})
      console.log(err);
    })

})

exports.api = functions.region('europe-west1').https.onRequest(app);