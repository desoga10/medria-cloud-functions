const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express')
const app = express();
const firebase = require('firebase')

admin.initializeApp()

const db =  admin.firestore()
db.settings({ ignoreUndefinedProperties: true })


const config = {
  apiKey: "AIzaSyAwuaof9LKBBZPWmCW5Q2HbfSiCWuwojVI",
  authDomain: "medria-e5014.firebaseapp.com",
  databaseURL: "https://medria-e5014.firebaseio.com",
  projectId: "medria-e5014",
  storageBucket: "medria-e5014.appspot.com",
  messagingSenderId: "264317170903",
  appId: "1:264317170903:web:5f76128160bcad36766c92"
}

firebase.initializeApp(config)



app.get('/screams', (req, res) => {
  db
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
  db
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

app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  //Validate Data
  let token, userId;

  db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
      if(doc.exists) {
        return res.status(400).json({handle: 'This Handle Already Exists'})
      } else {
       return firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
      .then((data) => {
        userId = data.user.uid
        return data.user.getIdToken()
    })
      .then( (idToken) => {
        token = idToken
        const userCredentials = {
          email: newUser.email,
          createdAt: new Date().toISOString(),
          handle: newUser.handle,
          userId
        //   email: newUser.email,
        //   password: newUser.password,
        //   confirmPassword: newUser.confirmPassword,
        //   handle: newUser.handle,
        //   userId
        }
        return db.doc(`/users/${newUser.handle}`).set(userCredentials);
      })
      .then( () => {
        return res.status(201).json({token})
        })
      .catch( (err) => {
        console.error(err)
        if (err.code === "auth/email-already-in-use"){
          return res.status(400).json({email: "Email Already Exists"})
        } else {
          return res.status(500).json({error: err.code})
        }
    })
})

exports.api = functions.region('europe-west1').https.onRequest(app);