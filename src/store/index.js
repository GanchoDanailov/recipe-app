import Vue from 'vue'
import Vuex from 'vuex'
import recipe from './recipe'
import user from './user'
import rating from './rating'
import shared from './shared'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    recipe,
    user,
    shared,
    rating
  }
})
