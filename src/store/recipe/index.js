import * as firebase from 'firebase'

export default {
  state: {
    loadedRecipes: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
        id: 'afajfjadfaadfa323',
        title: 'recipe in New York',
        createdDate: new Date(),
        location: 'New York',
        description: 'New York, New York!'
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1556694795-b6423d3d5b28?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80',
        id: 'aadsfhbkhlk1241',
        title: 'recipe in Paris',
        createdDate: new Date(),
        location: 'Paris',
        description: 'It\'s Paris!'
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
    initRealTimeListeners ({ commit, state }) {
      var recipesRef = firebase.database().ref('recipes')
      // recipesRef.on('child_added', snapshot => {
      //   const id = snapshot.key
      //   var recipes = state.loadedRecipes
      //   var isRecipeExist = recipes.find(x => x.id === id)
      //   console.log('isRecipeExist', isRecipeExist)
      //   if (!isRecipeExist) {
      //     console.log('id', id)
      //     console.log('recipes', recipes)
      //     const recipe = { id, ...snapshot.val() }
      //     commit('createRecipe', recipe)
      //     setTimeout(() => {
      //       console.log('recipes after set', state.loadedRecipes)
      //     }, 2000)
      //   } else {
      //     console.log('exist')
      //   }
      // })
      recipesRef.on('child_changed', snapshot => {
        const id = snapshot.key
        const changedRecipe = { id, ...snapshot.val() }
        let _loadedRecipes = Object.assign([], state.loadedRecipes)
        var foundIndex = _loadedRecipes.findIndex(x => x.id === id)
        _loadedRecipes[foundIndex] = changedRecipe
        commit('setLoadedRecipes', _loadedRecipes)
      })
      recipesRef.on('child_removed', function (data) {
        console.log('child_removed', data)
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
      const filename = payload.image.name
      // const ext = filename.slice(filename.lastIndexOf('.'))
      var uploadTask = firebase.storage().ref('recipes/' + filename).put(payload.image)
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
          let _newRecipe = {
            ...recipe,
            imageUrl: downloadURL
          }
          firebase.database().ref('recipes').push(_newRecipe)
            .then(data => {
              const key = data.key
              commit('createRecipe', {
                ...recipe,
                imageUrl: downloadURL,
                id: key
              })
            })
            .catch((error) => {
              console.log(error)
            })
        })
      })

      // Reach out to firebase and store it
      // let imageUrl
      // let key
      // firebase.database().ref('recipes').push(recipe)
      //   .then((data) => {
      //     key = data.key
      //     return key
      //   })
      //   .then(key => {
      //     const filename = payload.image.name
      //     const ext = filename.slice(filename.lastIndexOf('.'))
      //     return firebase.storage().ref('recipes/' + key + ext).put(payload.image)
      //   })
      //   .then(fileData => {
      //     return fileData.ref.getDownloadURL().then(function (_imageUrl) {
      //       imageUrl = _imageUrl
      //       return imageUrl
      //     })
      //   })
      //   .then(imageUrl => {
      //     return firebase.database().ref('recipes').child(key).update({ 'imageUrl': imageUrl })
      //   })
      //   .then(() => {
      //     commit('createRecipe', {
      //       ...recipe,
      //       imageUrl: imageUrl,
      //       id: key
      //     })
      //   })
      //   .catch((error) => {
      //     console.log(error)
      //   })
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
    }
  }
}
