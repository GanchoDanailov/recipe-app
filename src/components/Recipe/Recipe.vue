<template>
  <v-container>
    <!-- <v-layout>
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular
          indeterminate
          class="primary--text"
          :width="7"
          :size="70"
          v-if="loading"
        ></v-progress-circular>
      </v-flex>
    </v-layout>-->
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <h1 class="primary--text">{{ recipe.title }}</h1>
          </v-card-title>
          <v-img :src="recipe.imageUrl" height="400px"></v-img>
          <v-card-text>
            <v-rating
              v-model="rating"
              background-color="dark lighten-3"
              color="dark"
              size="34"
              v-if="userIsAuthenticated"
            ></v-rating>

            <v-btn
              outline
              large
              fab
              @click="toggleLike(recipe.id)"
              v-bind="color"
              v-if="userIsAuthenticated"
            >
              <v-icon>favorite</v-icon>
            </v-btn>
            <div class="info--text">{{ recipe.createdDate | date }} - {{ recipe.location }}</div>
            <div>{{ recipe.description }}</div>
          </v-card-text>
          <!-- <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="primary">Like</v-btn>
          </v-card-actions>-->
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: ['id'],
  data: () => ({
    rating: 4,
    isLiked: false
  }),
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    userIsAuthenticated() {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    },
    recipe() {
      return this.$store.getters.loadedRecipe(this.id) || {
        title: '',
        createdDate: '01-01-2019',
        location: ''
      }
    },
    recipeIsLiked() {
      if (this.$store.getters.user) {
        return this.$store.getters.user.likedRecipes.findIndex(recipeId => {
          return recipeId === this.id
        }) >= 0
      }
    },
    color() {
      if (this.recipeIsLiked) {
        return {
          color: 'pink'
        }
      }
    }
  },
  methods: {
    toggleLike() {
      // this.isLiked = !this.isLiked
      if (this.recipeIsLiked) {
        this.$store.dispatch('unlikeRecipe', this.id)
      } else {
        this.$store.dispatch('likeRecipe', this.id)
      }
    }
  }
}
</script>