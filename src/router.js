import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Signup from './views/Signup.vue'
import Signin from './views/Signin.vue'
import Recipes from './views/Recipes.vue'
import Recipe from './components/Recipe/Recipe.vue'
import CreateRecipe from './components/Recipe/CreateRecipe.vue'
import AuthGuard from './auth-guard'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/recipes',
      name: 'Recipes',
      component: Recipes
    },
    {
      path: '/recipe/new',
      name: 'CreateRecipe',
      component: CreateRecipe,
      beforeEnter: AuthGuard
    },
    {
      path: '/recipes/:id',
      name: 'Recipe',
      props: true,
      component: Recipe
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
      path: '/signin',
      name: 'signin',
      component: Signin
    }
  ]
})
