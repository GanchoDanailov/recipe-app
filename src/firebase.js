import firebase from 'firebase'
import 'firebase/firestore'

const config = {
  apiKey: 'AIzaSyCc8SpbjSY-DfBDHfy5qpHPZcFA-omFsHo',
  authDomain: 'recipe-app-12cc7.firebaseapp.com',
  databaseURL: 'https://recipe-app-12cc7.firebaseio.com',
  projectId: 'recipe-app-12cc7',
  storageBucket: 'gs://recipe-app-12cc7.appspot.com/',
  messagingSenderId: '506405661568',
  appId: '1:506405661568:web:be96802f6d6e4524'
}
const firebaseApp = firebase.initializeApp(config)

const firestore = firebaseApp.firestore()

export default firestore
