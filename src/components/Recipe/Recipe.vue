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
            <div class="rating-component" v-if="userIsAuthenticated">
              <star-rating
                v-model="isUserVoted"
                @rating-selected="setRating"
                inactive-color="#424242"
                active-color="#FFFFFF"
                :border-width="borderWidth"
                border-color="#FFFFFF"
                v-bind:star-size="35"
              />
              Avarage ratting: {{avgRating}}
              <br />
              All reviews: {{totalVotes}}
              <br />
            </div>
            <v-btn
              outline
              large
              fab
              @click="toggleLike()"
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
import db from '../../firebase'
import StarRating from 'vue-star-rating'
import { mapGetters } from 'vuex'

export default {
  props: ['id'],
  data: () => ({
    borderWidth: 4
  }),
  components: {
    StarRating
  },
  created() {
    this.$store.dispatch('fetchRatingsData', this.id)
  },
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    userIsAuthenticated() {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    },

    isUserVoted: {
      get() {
        if (this.$store.getters.user) {
          return this.loadedRating(this.$store.getters.user.id) || 0
        } else { return 0 }
      },
      set() { }
    },
    recipe() {
      return this.$store.getters.loadedRecipe(this.id) || {
        title: '',
        createdDate: '01-01-2019',
        location: ''
      }
    },
    recipeIsLiked() {
      if (this.recipe.likedUsers) {
        return this.recipe.likedUsers.findIndex(userId => {
          return userId === this.$store.getters.user.id
        }) >= 0
      }
    },
    color() {
      if (this.recipeIsLiked) { return { color: 'pink' } }
    },
    ...mapGetters(['loadedRating', 'avgRating', 'totalVotes'])
  },
  methods: {
    toggleLike() {
      const _ids = {
        userId: this.$store.getters.user.id,
        recipeId: this.id
      }
      if (this.recipeIsLiked) {
        this.$store.dispatch('unlikeRecipe', _ids)
      } else {
        this.$store.dispatch('likeRecipe', _ids)
      }
    },
    setRating(value) {
      const payload = {
        userId: this.$store.getters.user.id,
        recipeId: this.id,
        value: value
      }
      this.$store.dispatch('setRating', payload)
    },
  }
}
</script>