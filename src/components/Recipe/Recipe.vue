<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <h6 class="primary--text">{{ recipe.title }}</h6>
          </v-card-title>
          <v-img :src="recipe.imageUrl" height="400px"></v-img>
          <v-card-text>
            <div class="info--text">{{ recipe.createdDate | date }} - {{ recipe.location }}</div>
            <div>{{ recipe.description }}</div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="primary">Register</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: ['id'],
  computed: {
    recipe() {
      return this.$store.getters.loadedRecipe(this.id)
    }
  }
}
</script>