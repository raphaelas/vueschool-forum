import { countObjectProperties, removeEmptyProperties } from '@/utils'
import { child, getDatabase, ref, set, update } from 'firebase/database'
import Vue from 'vue'
import { makeAppendChildToParentMutation } from '@/store/assetHelpers'

export default {
  namespaced: true,

  state: {
    items: {}
  },
  getters: {
    userPosts: (state, getters, rootState) => id => {
      const user = state.items[id]
      if (user.posts) {
        return Object.values(rootState.posts.items)
          .filter(post => post.userId === id)
      }
      return []
    },

    userThreadsCount: state => id => countObjectProperties(state.items[id].threads),
    userPostsCount: state => id => countObjectProperties(state.items[id].posts)
  },
  actions: {
    createUser ({ state, commit }, { id, email, name, username, avatar = null }) {
      return new Promise((resolve, reject) => {
        const registeredAt = Math.floor(Date.now() / 1000)
        const usernameLower = username.toLowerCase()
        email = email.toLowerCase()
        const user = { avatar, email, name, username, usernameLower, registeredAt }
        console.log(`id: ${id}`)
        set(child(ref(getDatabase(), 'users'), id), user)
          .then(() => {
            commit('setItem', { resource: 'users', id: id, item: user }, { root: true })
            resolve(state.items[id])
          })
      })
    },

    updateUser ({ commit }, user) {
      const updates = {
        avatar: user.avatar,
        username: user.username,
        name: user.name,
        bio: user.bio,
        website: user.website,
        email: user.email,
        location: user.location
      }
      return new Promise((resolve, reject) => {
        update(child(ref(getDatabase(), 'users'), user['.key']), removeEmptyProperties(updates))
          .then(() => {
            commit('setUser', { userId: user['.key'], user })
            resolve(user)
          })
      })
    },

    fetchUser: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'users', id, emoji: '🧑' }, { root: true }),
    fetchUsers: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'useres', ids, emoji: '🧑' }, { root: true })
  },
  mutations: {
    setUser (state, { user, userId }) {
      Vue.set(state.items, userId, user)
    },

    appendPostToUser: makeAppendChildToParentMutation({ parent: 'users', child: 'posts' }),
    appendThreadToUser: makeAppendChildToParentMutation({ parent: 'users', child: 'threads' })
  }
}
