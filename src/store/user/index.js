import * as firebase from 'firebase'

export default {
  state: {
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
    setUser (state, payload) {
      state.user = payload
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
    }
  },
  getters: {
    user (state) {
      return state.user
    }
  }
}
