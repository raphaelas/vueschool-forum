// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import { initializeApp } from 'firebase/app'
import App from './App'
import router from './router'
import store from '@/store'
import AppDate from '@/components/AppDate'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
// import { getDatabase } from 'firebase/firebase-database'

// Import the functions you need from the SDKs you need

Vue.component('AppDate', AppDate)

Vue.config.productionTip = false
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}
// Initialize Firebase
initializeApp(firebaseConfig)

onAuthStateChanged(getAuth(), user => {
  if (user) {
    store.dispatch('fetchAuthUser')
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
