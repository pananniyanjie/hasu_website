<template>
  <div>
    <b-jumbotron :header="error.statusCode.toString()" :lead="error.statusCode === 404?'找不到页面':'发生了一个错误'" fluid bg-variant="light">
        <p>{{error.message}}</p>
        <b-button variant="outline-secondary" to="/">返回首页</b-button>
    </b-jumbotron>
  </div>
</template>

<script>
export default {
    props: ['error'],
    layout: 'error', // you can set a custom layout for the error page
    mounted(){
        // console.log(this.error)
    }
  }
</script>

<style>

</style>