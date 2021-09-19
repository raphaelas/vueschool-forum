import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword, signInWithPopup, signOut
} from 'firebase/auth'
import { child, getDatabase, onValue, ref } from 'firebase/database'

export default {
  namespaced: true,

  state: {
    authId: null,
    unsubscribeAuthObserver: null
  },
  getters: {
    authUser (state, getters, rootState) {
      return state.authId ? rootState.users.items[state.authId] : null
    }
  },
  actions: {
    initAuthentication ({ dispatch, commit, state }) {
      return new Promise((resolve, reject) => {
        // unsubscribe observer if already listening
        if (state.unsubscribeAuthObserver) {
          state.unsubscribeAuthObserver()
        }
        const unsubscribe = onAuthStateChanged(getAuth(), user => {
          console.log('👣 the user has changed')
          if (user) {
            dispatch('fetchAuthUser')
              .then(dbUser => resolve(dbUser))
          } else {
            resolve(null)
          }
        })
        commit('setUnsubscribeAuthObserver', unsubscribe)
      })
    },

    registerUserWithEmailAndPasssword ({ dispatch }, { email, name, username, password, avatar = null }) {
      return createUserWithEmailAndPassword(getAuth(), email, password)
        .then(userCredential => {
          return dispatch('users/createUser', { id: userCredential.user.uid, email, name, username, password, avatar }, { root: true })
        })
        .then(() => dispatch('fetchAuthUser'))
    },

    signInWithEmailAndPassword (context, { email, password }) {
      return signInWithEmailAndPassword(getAuth(), email, password)
    },

    signInWithGoogle ({ dispatch }) {
      const auth = getAuth()
      const provider = new GoogleAuthProvider(auth)
      signInWithPopup(auth, provider)
        .then(userCredential => {
          const user = userCredential.user
          onValue(child(ref(getDatabase(), 'users'), user.uid), snapshot => {
            if (!snapshot.exists()) {
              return dispatch('users/createUser', {
                id: user.uid,
                name: user.displayName,
                email: user.email,
                username: user.email,
                avatar: user.photoURL
              }, { root: true })
                .then(() => dispatch('fetchAuthUser'))
            }
          },
          { onlyOnce: true })
        })
    },

    signOut ({ commit }) {
      return signOut(getAuth())
        .then(() => {
          commit('setAuthId', null)
        })
    },

    fetchAuthUser ({ dispatch, commit }) {
      const userId = getAuth().currentUser.uid
      return new Promise((resolve, reject) => {
        // check if user exists in the database
        onValue(child(ref(getDatabase(), 'users'), userId), snapshot => {
          if (snapshot.exists()) {
            return dispatch('users/fetchUser', { id: userId }, { root: true })
              .then(user => {
                commit('setAuthId', userId)
                resolve(user)
              })
          } else {
            resolve(null)
          }
        }, {
          onlyOnce: true
        })
      })
    }
  },
  mutations: {
    setAuthId (state, id) {
      state.authId = id
    },

    setUnsubscribeAuthObserver (state, unsubscribe) {
      state.unsubscribeAuthObserver = unsubscribe
    }
  }
}
