import * as firebase from 'firebase'
import db from '../../firebase'

export default {
  state: {
    user: null,
    loading: false,
    error: null
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    }
  },
  actions: {
    signUserUp ({ commit }, payload) {
      commit('setLoading', true)
      commit('clearError')
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(
          obj => {
            commit('setLoading', false)
            const newUser = {
              id: obj.user.uid,
              email: obj.user.email
            }
            db.collection('users').add(newUser).then(() => {
              commit('setUser', newUser)
            })
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
              email: obj.user.email
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
    signUserInWithGoogle ({ commit }) {
      var provider = new firebase.auth.GoogleAuthProvider()
      firebase.auth().signInWithPopup(provider).then(obj => {
        let _user = {
          id: obj.user.uid,
          email: obj.additionalUserInfo.profile.email,
          family_name: obj.additionalUserInfo.profile.family_name,
          given_name: obj.additionalUserInfo.profile.given_name,
          picture: obj.additionalUserInfo.profile.picture,
          locale: obj.additionalUserInfo.profile.locale
        }
        if (!obj.additionalUserInfo.isNewUser) {
          commit('setUser', _user)
        } else {
          db.collection('users').add(_user).then(() => {
            commit('setUser', _user)
          })
        }
      })
    },
    autoSignIn ({ commit }, payload) {
      commit('setUser', {
        id: payload.uid,
        email: payload.email
      })
    },
    fetchUserData ({ commit, getters }, payload) {
      // commit('setLoading', true)
      // firebase.database().ref('/users/' + getters.user.id).once('value')
      //   .then(data => {
      //     const values = data.val()
      //     console.log('values', data.val())
      //     let _likedRecipes = []
      //     let _swapLikedRecipes = {}
      //     for (let key in values) {
      //       _likedRecipes.push(values[key])
      //       _swapLikedRecipes[values[key]] = key
      //     }
      //     const updatedUser = {
      //       id: getters.user.id,
      //       likedRecipes: _likedRecipes,
      //       firebaseKeys: _swapLikedRecipes
      //     }
      //     commit('setLoading', false)
      //     commit('setUser', updatedUser)
      //     // console.log('_likedRecipes', _likedRecipes)
      //     // console.log('_swapLikedRecipes', _swapLikedRecipes)
      //   })
      //   .catch(error => {
      //     console.log(error)
      //     commit('setLoading', false)
      //   })
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
