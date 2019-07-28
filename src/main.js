import Vue from 'vue'
import App from './App.vue'
import router from './router'
import firebase from 'firebase'
import store from './store'
import DateFilter from './filters/date'
import DifficultyFilter from './filters/difficulty'
import './registerServiceWorker'

import Vuetify from 'vuetify'
import 'vuetify/src/stylus/app.styl'
import AlertCmp from './components/Shared/Alert.vue'

Vue.use(Vuetify)
Vue.filter('date', DateFilter)
Vue.filter('difficulty', DifficultyFilter)
Vue.component('app-alert', AlertCmp)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
  created () {
    // firebase.initializeApp({
    //   apiKey: 'AIzaSyCc8SpbjSY-DfBDHfy5qpHPZcFA-omFsHo',
    //   authDomain: 'recipe-app-12cc7.firebaseapp.com',
    //   databaseURL: 'https://recipe-app-12cc7.firebaseio.com',
    //   projectId: 'recipe-app-12cc7',
    //   storageBucket: 'gs://recipe-app-12cc7.appspot.com/',
    //   messagingSenderId: '506405661568',
    //   appId: '1:506405661568:web:be96802f6d6e4524'
    // })
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.$store.dispatch('autoSignIn', user)
        // this.$store.dispatch('fetchUserData')
      }
    })
    // this.$store.dispatch('initRealTimeListeners')
    this.$store.dispatch('loadRecipes')
  }
}).$mount('#app')
