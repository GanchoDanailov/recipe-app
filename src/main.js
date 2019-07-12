import Vue from 'vue'
import App from './App.vue'
import router from './router'
import * as firebase from 'firebase'
import store from './store'
import './registerServiceWorker'

import Vuetify from 'vuetify'
import 'vuetify/src/stylus/app.styl'
import AlertCmp from './components/Shared/Alert.vue'

Vue.use(Vuetify)

Vue.component('app-alert', AlertCmp)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
  created () {
    firebase.initializeApp({
      apiKey: 'AIzaSyCc8SpbjSY-DfBDHfy5qpHPZcFA-omFsHo',
      authDomain: 'recipe-app-12cc7.firebaseapp.com',
      databaseURL: 'https://recipe-app-12cc7.firebaseio.com',
      projectId: 'recipe-app-12cc7',
      storageBucket: '',
      messagingSenderId: '506405661568',
      appId: '1:506405661568:web:be96802f6d6e4524'
    })
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$store.dispatch('autoSignIn', user)
      }
    })
    // this.$store.dispatch('loadMeetups')
  }
}).$mount('#app')
