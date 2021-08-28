// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import { initializeApp } from 'firebase/app'
import App from './App'
import router from './router'
import store from '@/store'
import AppDate from '@/components/AppDate'
// import { getDatabase } from 'firebase/firebase-database'

// Import the functions you need from the SDKs you need

Vue.component('AppDate', AppDate)

Vue.config.productionTip = false
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDEKC1d5eCsuh6vI8a2yhQNUex4lRdKFz8',
  authDomain: 'vue-school-forum-3ccfd.firebaseapp.com',
  projectId: 'vue-school-forum-3ccfd',
  databaseURL: 'https://vue-school-forum-3ccfd-default-rtdb.firebaseio.com/',
  storageBucket: 'vue-school-forum-3ccfd.appspot.com',
  messagingSenderId: '107098883830',
  appId: '1:107098883830:web:df625ad2f105fbb2ca4ed7'
}
// Initialize Firebase
initializeApp(firebaseConfig)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
  beforeCreate () {
    store.dispatch('fetchUser', { id: store.state.authId })
  }
})
