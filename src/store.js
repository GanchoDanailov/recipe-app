import Vue from 'vue'
import Vuex from 'vuex'
import * as firebase from 'firebase'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loadedRecipes: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
        id: 'afajfjadfaadfa323',
        title: 'Meetup in New York',
        createdDate: new Date(),
        location: 'New York',
        description: 'New York, New York!'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1556694795-b6423d3d5b28?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80',
        id: 'aadsfhbkhlk1241',
        title: 'Meetup in Paris',
        createdDate: new Date(),
        location: 'Paris',
        description: 'It\'s Paris!'
      }
    ],
    user: null,
    loading: false,
    error: null
  },
  mutations: {
    setLoadedRecipes (state, payload) {
      state.loadedRecipes = payload
    },
    createRecipe (state, payload) {
      state.loadedRecipes.push(payload)
    },
    setUser (state, payload) {
      state.user = payload
    },
    setLoading (state, payload) {
      state.loading = payload
    },
    setError (state, payload) {
      state.error = payload
    },
    clearError (state) {
      state.error = null
    }
  },
  actions: {
    loadRecipes ({ commit }) {
      commit('setLoading', true)
      firebase.database().ref('recipes').once('value')
        .then((data) => {
          console.log('test')
          const recipes = []
          const obj = data.val()
          for (let key in obj) {
            recipes.push({
              id: key,
              title: obj[key].title,
              description: obj[key].description,
              imageUrl: obj[key].imageUrl,
              createdDate: obj[key].createdDate,
              creatorId: obj[key].creatorId
            })
          }
          commit('setLoadedRecipes', recipes)
          commit('setLoading', false)
        })
        .catch(
          (error) => {
            console.log(error)
            commit('setLoading', false)
          }
        )
    },
    createRecipe ({ commit, getters }, payload) {
      const recipe = {
        title: payload.title,
        location: payload.location,
        description: payload.description,
        createdDate: payload.createdDate.toISOString(),
        creatorId: getters.user.id
      }
      // Reach out to firebase and store it
      let imageUrl
      let key
      firebase.database().ref('recipes').push(recipe)
        .then((data) => {
          console.log('data', data)
          key = data.key
          return key
        })
        .then(key => {
          const filename = payload.image.name
          const ext = filename.slice(filename.lastIndexOf('.'))
          return firebase.storage().ref('recipes/' + key + ext).put(payload.image)
        })
        .then(fileData => {
          return fileData.ref.getDownloadURL().then(function (_imageUrl) {
            imageUrl = _imageUrl
            return imageUrl
          })
        })
        .then(imageUrl => {
          console.log('recipe after image', firebase.database().ref('recipes').child(key))
          return firebase.database().ref('recipes').child(key).update({ 'imageUrl': imageUrl })
        })
        .then(() => {
          console.log('recipe', recipe)
          commit('createRecipe', {
            ...recipe,
            imageUrl: imageUrl,
            id: key
          })
        })
        .catch((error) => {
          console.log(error)
        })
    },
    signUserUp ({ commit }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          obj => {
            commit('setLoading', false)
            console.log('obj.user', obj)
            const newUser = {
              id: obj.user.uid,
              registeredRecipes: []
            }
            commit('setUser', newUser)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    signUserIn ({ commit }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(
          obj => {
            commit('setLoading', false)
            console.log('obj.user', obj)
            const newUser = {
              id: obj.user.uid,
              registeredRecipes: []
            }
            commit('setUser', newUser)
          }
        )
        .catch(
          error => {
            commit('setLoading', false)
            commit('setError', error)
            console.log(error)
          }
        )
    },
    autoSignIn ({ commit }, payload) {
      commit('setUser', { id: payload.uid, registeredRecipes: [] })
    },
    logout ({ commit }) {
      firebase.auth().signOut()
      commit('setUser', null)
    },
    clearError ({ commit }) {
      commit('clearError')
    }
  },
  getters: {
    loadedRecipes (state) {
      return state.loadedRecipes
      // .sort((recipeA, recipeB) => {
      //   return recipeA.date > recipeB.date
      // })
    },
    loadedRecipe (state) {
      return (recipeId) => {
        return state.loadedRecipes.find((recipe) => {
          return recipe.id === recipeId
        })
      }
    },
    featuredRecipes (state, getters) {
      return getters.loadedRecipes.slice(0, 5)
    },
    user (state) {
      return state.user
    },
    loading (state) {
      return state.loading
    },
    error (state) {
      return state.error
    }
  }
})
