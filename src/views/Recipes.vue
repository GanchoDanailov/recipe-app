<template>
  <Recipes />
</template>

<script>
import Recipes from '@/components/Recipe/Recipes.vue'

export default {
  props: ['id'],
  components: { Recipes }
}
</script>
