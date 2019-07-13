<template>
  <v-container>
    <v-layout row wrap v-for="recipe in recipes" :key="recipe.id" class="mb-2">
      <v-flex xs12 sm10 md8 offset-sm1 offset-md2>
        <v-card>
          <v-container fluid>
            <v-layout row>
              <v-flex xs5 sm4 md3>
                <v-img :src="recipe.imageUrl" height="130px"></v-img>
              </v-flex>
              <v-flex xs7 sm8 md9>
                <v-card-title primary-title>
                  <div>
                    <h5 class="white--text mb-0">{{ recipe.title }}</h5>
                    <div>{{ recipe.createdDate | date }}</div>
                  </div>
                </v-card-title>
                <v-card-actions>
                  <v-btn flat :to="'/recipes/' + recipe.id">
                    <v-icon left light>arrow_forward</v-icon>View recipe
                  </v-btn>
                </v-card-actions>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  computed: {
    recipes() {
      return this.$store.getters.loadedRecipes
    }
  }
}
</script>