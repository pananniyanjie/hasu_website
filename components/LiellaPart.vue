<template>
  <div class="liella-part"><slot /></div>
</template>

<script>
export default {
    name:'liella-part'
}
</script>

<style lang="scss" scoped>
.liella-part {
    &:empty{
      display: none;
    }
    border-radius: 15px;
    background-color: #fff;
    box-shadow: 0 -8px 15px rgba($color: #000000, $alpha: 0.2);
    padding: 25px 20px 15px 20px;
}
</style>