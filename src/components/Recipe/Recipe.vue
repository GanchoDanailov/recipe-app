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
          <v-layout row wrap>
            <v-flex xs12 sm7 lg8>
              <v-img :src="recipe.imageUrl" height="400px"></v-img>
            </v-flex>
            <v-flex xs12 sm5 lg4 text-xs-center>
              <div class="recipe-title">
                <h1 class>{{ recipe.title }}</h1>

                <div>
                  <span class="float-right">Difficulty:</span>
                  <span>{{ recipe.difficulty | difficulty }}</span>
                </div>
                <div>
                  <span class="float-right">Doses for:</span>
                  <span>{{ recipe.doses }} people</span>
                </div>
                <div>
                  <span class="float-right">Cooking time:</span>
                  <span>{{ recipe.cooking }} min</span>
                </div>
              </div>
              <div class="rating-component" v-if="userIsAuthenticated" text-xs-center>
                <star-rating
                  v-model="isUserVoted"
                  @rating-selected="setRating"
                  inactive-color="#424242"
                  active-color="#f6d607"
                  :border-width="borderWidth"
                  border-color="#000"
                  class="rating-stars"
                  v-bind:star-size="25"
                  style="margin: 0 auto; width:210px;"
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
                class="like-btn"
                @click="toggleLike()"
                v-bind="color"
                v-if="userIsAuthenticated"
              >
                <v-icon>favorite</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>

          <v-card-text>
            <div class="info--text">{{ recipe.createdDate | date }} - {{ recipe.location }}</div>
          </v-card-text>

          <v-card-text>
            <v-divider></v-divider>
            <v-layout row>
              <v-flex xs12 sm8 offset-sm2 text-xs-center p-t-5 class="subtitle">Ingredients</v-flex>
            </v-layout>
            <v-container fluid grid-list-sm>
              <v-layout row wrap>
                <v-flex v-for="ingredient in recipe.ingredients" :key="ingredient" xs12 sm6 lg4>
                  <v-list-tile>
                    <v-list-tile-action>
                      <v-icon>add_shopping_cart</v-icon>
                    </v-list-tile-action>

                    <v-list-tile-content>
                      <v-list-tile-title>{{ingredient}}</v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-flex>
              </v-layout>
            </v-container>
            <v-divider></v-divider>
            <v-layout row>
              <v-flex xs12 sm8 offset-sm2 text-xs-center p-t-5 class="subtitle">Directions</v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs12>
                <v-timeline align-top>
                  <v-timeline-item v-for="(item, i) in directionsTodo" :key="i" color="#f6d607">
                    <v-card color="#f6d607" dark>
                      <v-card-title class="title" style="color:#424242">Step {{i + 1}}</v-card-title>
                      <v-card-text
                        class="text--primary"
                        style="background: #424242; border: 1px solid #f6d707;"
                      >
                        <p>{{item.direction}}</p>
                        <v-btn
                          color="#f6d607"
                          class="mx-0"
                          outline
                          v-bind:class="{ active: item.done }"
                          v-on:click="check(item)"
                        >
                          <div v-if="item.done">Undone</div>
                          <div v-else>Done</div>
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-flex>
            </v-layout>
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
    borderWidth: 2,
    directionsTodo: []
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
      let recipe = this.$store.getters.loadedRecipe(this.id) || {
        title: '',
        createdDate: '01-01-2019',
        directions: []
      }
      if (recipe.directions.length > 0) {
        recipe.directions.forEach(direction => {
          this.directionsTodo.push({
            id: Math.random().toString(36).substr(2, 9),
            direction: direction.direction,
            done: false
          })
        });

      }
      return recipe
    },
    recipeIsLiked() {
      if (this.recipe.likedUsers) {
        return this.recipe.likedUsers.findIndex(userId => {
          return userId === this.$store.getters.user.id
        }) >= 0
      }
    },
    color() {
      if (this.recipeIsLiked) { return { color: '#f6d607' } }
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
    check(direction) {
      direction.done = !direction.done
    }
  }
}
</script>
<style lang="scss" scoped>
.recipe-title {
  span {
    width: 110px;
    display: inline-block;
    text-align: left;
    font-size: 17px;
  }
  span:not(.float-right) {
    color: #f6d607;
  }
  .float-right {
    // text-align: right;
    margin-right: 10px;
  }
}
h1 {
  margin-bottom: 20px;
}
.like-btn {
  margin-top: 20px;
}
.subtitle {
  font-size: 25px;
  padding: 10px;
}
.active {
  background-color: #f6d607 !important;

  color: #000 !important;
}
</style>
<style lang="scss">
.rating-stars {
  .vue-star-rating {
    margin: 20px auto 0 auto;
  }
}
</style>

