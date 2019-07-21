import Vue from 'vue'
import db from '../../firebase'

export default {
  state: {
    loadedRatings: []
  },
  mutations: {
    setRating (state, { recipeId, userId, value }) {
      const index = state.loadedRatings.findIndex((rating) => rating.userId === userId)
      if (index >= 0) {
        // update rating
        Vue.set(state.loadedRatings[index], 'value', value)
      } else {
        // add rating
        state.loadedRatings.push({ userId, recipeId, value })
      }
    },
    setLoadedRatings (state, payload) {
      state.loadedRatings = payload
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
    fetchRatingsData ({ commit }, payload) {
      commit('setLoading', true)
      let ratingsRef = db.collection('ratings')

      ratingsRef.where('recipeId', '==', payload).get().then(querySnapshot => {
        const ratings = []
        querySnapshot.forEach(doc => {
          ratings.push({
            userId: doc.data().userId,
            recipeId: doc.data().recipeId,
            value: doc.data().value
          })
        })
        commit('setLoadedRatings', ratings)
        commit('setLoading', false)
      })
    },
    setRating ({ commit }, { userId, recipeId, value }) {
      commit('setLoading', true)
      const dock = recipeId + '_' + userId
      db.collection('ratings').doc(dock).set({ userId, recipeId, value })
        .then(() => {
          commit('setRating', { userId, recipeId, value })
        })
        .catch(error => {
          console.error('Error adding rating: ', error)
        })
    }
  },
  getters: {
    loadedRatings (state) {
      return state.loadedRatings
    },
    loadedRating (state) {
      return (userId) => {
        const rating = state.loadedRatings.find(rating => rating.userId === userId)
        if (rating) {
          return rating.value
        } else {
          return 0
        }
      }
    },
    totalVotes (state) {
      return state.loadedRatings.length
    },
    avgRating (state) {
      if (state.loadedRatings.length) {
        const ratings = state.loadedRatings
        return ratings.reduce((total, next) => total + next.value, 0) / ratings.length
      } else {
        return 'No reviews yet'
      }
    }
  }
}
