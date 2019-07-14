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
        title: 'Recipe in New York',
        createdDate: new Date(),
        location: 'New York',
        description: 'New York, New York!'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1556694795-b6423d3d5b28?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80',
        id: 'aadsfhbkhlk1241',
        title: 'Recipe in Paris',
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
    likeRecipe (state, payload) {
      const id = payload.id
      if (state.user.likedRecipes.findIndex(recipe => recipe.id === id) >= 0) { return } state.user.likedRecipes.push(id)
      state.user.firebaseKeys[id] = payload.firebaseKey
    },
    unlikeRecipe (state, payload) {
      const likedRecipes = state.user.likedRecipes
      likedRecipes.splice(likedRecipes.findIndex(recipe => recipe === payload), 1)
      Reflect.deleteProperty(state.user.firebaseKeys, payload)
    },
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
    likeRecipe ({ commit, getters }, payload) {
      commit('setLoading', true)
      const user = getters.user
      firebase.database().ref('/users/' + user.id).child('/likedRecipes/')
        .push(payload)
        .then(data => {
          commit('setLoading', false)
          commit('likeRecipe', { id: payload, 'firebaseKey': data.key })
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    unlikeRecipe ({ commit, getters }, payload) {
      const user = getters.user
      if (!user.firebaseKeys) { return }
      const firebaseKey = user.firebaseKeys[payload]
      firebase.database().ref('/users/' + user.id + '/likedRecipes/').child(firebaseKey)
        .remove()
        .then(() => {
          commit('setLoading', false)
          commit('unlikeRecipe', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    loadRecipes ({ commit }) {
      commit('setLoading', true)
      firebase.database().ref('recipes').once('value')
        .then((data) => {
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
          return firebase.database().ref('recipes').child(key).update({ 'imageUrl': imageUrl })
        })
        .then(() => {
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
            const newUser = {
              id: obj.user.uid,
              likedRecipes: [],
              firebaseKeys: {}
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
            const newUser = {
              id: obj.user.uid,
              likedRecipes: [],
              firebaseKeys: {}
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
      commit('setUser', {
        id: payload.uid,
        likedRecipes: [],
        firebaseKeys: {}
      })
    },
    fetchUserData ({ commit, getters }, payload) {
      commit('setLoading', true)
      firebase.database().ref('/users/' + getters.user.id + '/likedRecipes/').once('value')
        .then(data => {
          const values = data.val()
          let _likedRecipes = []
          let _swapLikedRecipes = {}
          for (let key in values) {
            _likedRecipes.push(values[key])
            _swapLikedRecipes[values[key]] = key
          }
          const updatedUser = {
            id: getters.user.id,
            likedRecipes: _likedRecipes,
            firebaseKeys: _swapLikedRecipes
          }
          commit('setLoading', false)
          commit('setUser', updatedUser)
          // console.log('_likedRecipes', _likedRecipes)
          // console.log('_swapLikedRecipes', _swapLikedRecipes)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
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
        .sort((recipeA, recipeB) => {
          var c = new Date(recipeA.createdDate)
          var d = new Date(recipeB.createdDate)
          return d - c
          // return recipeB.createdDate - recipeA.createdDate
        })
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
