<template>
  <v-container>
    <v-layout row>
      <v-flex xs12 sm8 offset-sm2>
        <h4>Create a new Recipe</h4>
      </v-flex>
    </v-layout>

    <v-layout row>
      <v-flex xs12>
        <form @submit.prevent="onCreateRecipe">
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2>
              <v-text-field name="title" label="Title" id="title" v-model="title" required></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2>
              <v-btn raised class="primary" @click="onPickFile">Upload image</v-btn>
              <input
                type="file"
                style="display:none"
                ref="fileInput"
                accept="image/*"
                @change="onFilePicked"
              />
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2>
              <img :src="imageUrl" height="150" />
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2>
              <v-slider
                v-model="difficulty"
                label="Difficulty"
                :tick-labels="ticksLabels"
                :max="3"
                step="1"
                :color="color"
                ticks="always"
                tick-size="8"
              ></v-slider>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2>
              <v-slider
                v-model="doses"
                label="Doses for people"
                :tick-labels="ticksLabelsPeople"
                :max="8"
                step="2"
                ticks="always"
                tick-size="8"
              ></v-slider>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2>
              <v-slider
                v-model="cooking"
                label="Cooking time (mins)"
                step="10"
                thumb-label="always"
                tick-size="8"
              ></v-slider>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2 class="devider">
              <v-divider></v-divider>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2 text-sm-center p-t-5 class="directions">Ingredients</v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2>
              <v-combobox
                v-model="ingredients"
                :items="items"
                label="Add ingredients"
                ingredients
                solo
                multiple
              >
                <template v-slot:selection="data">
                  <v-chip :selected="data.selected" close @input="removeIngredients(data.item)">
                    <strong>{{ data.item }}</strong>
                  </v-chip>
                </template>
              </v-combobox>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2 class="devider">
              <v-divider></v-divider>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2 text-sm-center p-t-5 class="directions">Directions</v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2>
              <div v-for="(row, index) in directions" :key="index">
                <div>
                  Step {{index + 1}}
                  <a
                    v-on:click="removeDirection(index);"
                    style="cursor: pointer"
                  >Remove</a>
                  <v-textarea
                    name="input-7-1"
                    rows="2"
                    v-model="row.direction"
                    value="The Woodman set to work at once, and so sharp was his axe that the tree was soon chopped nearly through."
                  ></v-textarea>
                </div>
              </div>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2 class="text-xs-center">
              <v-btn class="primary" @click="addDirection">Add next step</v-btn>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 sm8 offset-sm2 class="devider">
              <v-divider></v-divider>
            </v-flex>
          </v-layout>

          <v-layout row>
            <v-flex xs12 sm8 offset-sm2>
              <v-btn block class="primary" :disabled="!formIsValid" type="submit">Create Recipe</v-btn>
            </v-flex>
          </v-layout>
        </form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'CreateRecipe',
  data() {
    return {
      title: 'Test',
      imageUrl: '',
      image: null,
      ingredients: ['1/4 cup of suggar'],
      items: [],
      difficulty: 1,
      doses: 1,
      cooking: 1,
      ticksLabels: [
        '',
        'Easy',
        'Medium',
        'Hard'
      ],
      ticksLabelsPeople: [
        '',
        '2',
        '4 ',
        '6',
        '8',
      ],
      directions: [{ direction: "Add your directions here", }]
    }
  },
  computed: {
    formIsValid() {
      return this.title !== '' &&
        this.imageUrl !== '' &&
        this.description !== '' &&
        this.ingredients.length !== 0 &&
        this.directions.length !== 0 &&
        this.difficulty !== 0 &&
        this.doses !== 0 &&
        this.cooking !== 0
    },
    color() {
      if (this.difficulty < 1) return 'indigo'
      if (this.difficulty < 2) return 'teal'
      if (this.difficulty < 3) return 'yellow'
      return 'red'
    },
  },
  methods: {
    onCreateRecipe() {
      if (!this.formIsValid) { return }
      if (!this.imageUrl) {
        console.log('no image')
        return
      }
      let date = new Date();
      const recipeData = {
        title: this.title,
        image: this.image,
        createdDate: date,
        directions: this.directions,
        ingredients: this.ingredients,
        difficulty: this.difficulty,
        doses: this.doses,
        cooking: this.cooking
      }
      this.$store.dispatch('createRecipe', recipeData)
      this.$router.push('/recipes')
    },
    onPickFile() {
      this.$refs.fileInput.click()
    },
    onFilePicked(event) {
      const files = event.target.files
      let filename = files[0].name
      // Preview image
      const fileReader = new FileReader()
      fileReader.addEventListener('load', () => {
        this.imageUrl = fileReader.result
      })
      fileReader.readAsDataURL(files[0])
      this.image = files[0]
    },
    removeIngredients(item) {
      this.ingredients.splice(this.ingredients.indexOf(item), 1)
      this.ingredients = [...this.ingredients]
    },
    addDirection: function () {
      this.directions.push({
        direction: "",
      });
    },
    removeDirection: function (index) {
      this.directions.splice(index, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
h4 {
  text-align: center;
  font-size: 30px;
}
.devider {
  padding-top: 20px;
}
.directions {
  padding: 10px;
  font-size: 25px;
}
</style>
