import * as firebase from 'firebase'
import db from '../../firebase'

export default {
  state: {
    loadedRecipes: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
        id: 'afajfjadfaadfa323',
        title: 'recipe in New York',
        createdDate: new Date(),
        directions: 'New York, New York!'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1556694795-b6423d3d5b28?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80',
        id: 'aadsfhbkhlk1241',
        title: 'recipe in Paris',
        createdDate: new Date(),
        directions: 'It\'s Paris!'
      }
    ]
  },
  mutations: {
    setLoadedRecipes (state, payload) {
      state.loadedRecipes = payload
    },
    createRecipe (state, payload) {
      state.loadedRecipes.push(payload)
    },
    likeRecipe (state, { recipeId, userId }) {
      const recipe = state.loadedRecipes.find((recipe) => recipe.id === recipeId)
      if (recipe.likedUsers.findIndex(user => user === userId) >= 0) { return }
      recipe.likedUsers.push(userId)
    },
    unlikeRecipe (state, { recipeId, userId }) {
      const recipe = state.loadedRecipes.find((recipe) => recipe.id === recipeId)
      var index = recipe.likedUsers.indexOf(userId)
      if (index > -1) { recipe.likedUsers.splice(index, 1) }
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
    likeRecipe ({ commit }, { userId, recipeId }) {
      commit('setLoading', true)
      let _recipe = db.collection('recipes').doc(recipeId)
      _recipe.update({
        likedUsers: firebase.firestore.FieldValue.arrayUnion(userId)
      })
        .then(() => commit('likeRecipe', { userId, recipeId }))
        .then(() => commit('setLoading', false))
    },
    unlikeRecipe ({ commit }, { userId, recipeId }) {
      commit('setLoading', true)
      let _recipe = db.collection('recipes').doc(recipeId)
      _recipe.update({
        likedUsers: firebase.firestore.FieldValue.arrayRemove(userId)
      })
        .then(() => commit('unlikeRecipe', { userId, recipeId }))
        .then(() => commit('setLoading', false))
    },
    initRealTimeListeners ({ commit, state }) {

    },
    loadRecipes ({ commit }) {
      commit('setLoading', true)
      db.collection('recipes').get().then(querySnapshot => {
        const recipes = []
        querySnapshot.forEach(doc => {
          recipes.push({
            id: doc.id,
            title: doc.data().title,
            directions: doc.data().directions,
            imageUrl: doc.data().imageUrl,
            createdDate: doc.data().createdDate,
            creatorId: doc.data().creatorId,
            likedUsers: doc.data().likedUsers,
            ingredients: doc.data().ingredients,
            difficulty: doc.data().difficulty,
            doses: doc.data().doses,
            cooking: doc.data().cooking
          })
        })
        commit('setLoadedRecipes', recipes)
        commit('setLoading', false)
      })
    },
    createRecipe ({ commit, getters }, payload) {
      commit('setLoading', true)
      let _recipe = {
        title: payload.title,
        directions: payload.directions,
        createdDate: payload.createdDate.toISOString(),
        creatorId: getters.user.id,
        likedUsers: [],
        ingredients: payload.ingredients,
        difficulty: payload.difficulty,
        doses: payload.doses,
        cooking: payload.cooking
      }
      const filename = payload.image.name
      let uploadTask = firebase.storage().ref('recipes/' + filename).put(payload.image)
      uploadTask.on('state_changed', function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log('Upload is ' + progress + '% done')
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused')
            break
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running')
            break
        }
      }, function (error) {
        console.log('error', error)
      }, function () {
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          let _tmpRecipe = {
            ..._recipe,
            imageUrl: downloadURL
          }
          db.collection('recipes').add(_tmpRecipe)
            .then(docRef => {
              commit('createRecipe', {
                ..._tmpRecipe,
                id: docRef.id
              })
            }).then(() => { commit('setLoading', false) })
        })
      })
    }
  },
  getters: {
    loadedRecipes (state) {
      return state.loadedRecipes
        .sort((recipeA, recipeB) => {
          var c = new Date(recipeA.createdDate)
          var d = new Date(recipeB.createdDate)
          return d - c
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
    }
  }
}
