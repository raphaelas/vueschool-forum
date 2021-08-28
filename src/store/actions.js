import { child, getDatabase, onValue, ref, push, update } from 'firebase/database'

export default {
  createPost ({ commit, state }, post) {
    const postId = push(ref(getDatabase(), 'posts')).key
    post.userId = state.authId
    post.publishedAt = Math.floor(Date.now() / 1000)

    const updates = {}
    updates[`posts/${postId}`] = post
    updates[`threads/${post.threadId}/posts/${postId}`] = postId
    updates[`threads/${post.threadId}/contributors/${post.userId}`] = post.userId
    updates[`users/${post.userId}/posts/${postId}`] = postId
    update(ref(getDatabase()), updates)
      .then(() => {
        commit('setItem', { resource: 'posts', item: post, id: postId })
        commit('appendPostToThread', { parentId: post.threadId, childId: postId })
        commit('appendContributorToThread', { parentId: post.threadId, childId: post.userId })
        commit('appendPostToUser', { parentId: post.userId, childId: postId })
        return Promise.resolve(state.posts[postId])
      })
  },

  createThread ({ state, commit, dispatch }, { text, title, forumId }) {
    return new Promise((resolve, reject) => {
      const threadId = push(ref(getDatabase(), 'threads')).key
      const postId = push(ref(getDatabase(), 'posts')).key
      const userId = state.authId
      const publishedAt = Math.floor(Date.now() / 1000)

      const thread = { title, forumId, publishedAt, userId, firstPostId: postId, posts: {} }
      thread.posts[postId] = postId
      const post = { text, publishedAt, threadId, userId }

      const updates = {}
      updates[`threads/${threadId}`] = thread
      updates[`forums/${forumId}/threads/${threadId}`] = threadId
      updates[`users/${userId}/threads/${threadId}`] = threadId

      updates[`posts/${postId}`] = post
      updates[`users/${userId}/posts/${postId}`] = postId
      update(ref(getDatabase()), updates)
        .then(() => {
          // update thread
          commit('setItem', { resource: 'threads', id: threadId, item: thread })
          commit('appendThreadToForum', { parentId: forumId, childId: threadId })
          commit('appendThreadToUser', { parentId: userId, childId: threadId })
          // update post
          commit('setItem', { resource: 'posts', item: post, id: postId })
          commit('appendPostToThread', { parentId: post.threadId, childId: postId })
          commit('appendPostToUser', { parentId: post.userId, childId: postId })

          resolve(state.threads[threadId])
        })
    })
  },

  updatePost ({ state, commit }, { id, text }) {
    return new Promise((resolve, reject) => {
      const post = state.posts[id]
      const edited = {
        at: Math.floor(Date.now() / 1000),
        by: state.authId
      }

      const updates = { text, edited }
      update(child(ref(getDatabase(), 'posts'), id), updates)
        .then(() => {
          commit('setPost', { postId: id, post: { ...post, text, edited } })
          resolve(post)
        })
    })
  },

  updateThread ({ state, commit, dispatch }, { title, text, id }) {
    return new Promise((resolve, reject) => {
      const thread = state.threads[id]
      const post = state.posts[thread.firstPostId]

      const edited = {
        at: Math.floor(Date.now() / 1000),
        by: state.authId
      }

      const updates = {}
      updates[`posts/${thread.firstPostId}/text`] = text
      updates[`posts/${thread.firstPostId}/edited`] = edited
      updates[`threads/${id}/title`] = title
      update(ref(getDatabase()), updates)
        .then(() => {
          commit('setThread', { thread: { ...thread, title }, threadId: id })
          commit('setPost', { postId: thread.firstPostId, post: { ...post, text, edited } })
          resolve(post)
        })
    })
  },

  updateUser ({ commit }, user) {
    commit('setUser', { userId: user['.key'], user })
  },

  fetchCategory: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'categories', id, emoji: '🏷' }),

  fetchForum: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'forums', id, emoji: '🌧' }),

  fetchThread: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'threads', id, emoji: '📃' }),

  fetchPost: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'posts', id, emoji: '📞' }),

  fetchUser: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'users', id, emoji: '🧑' }),

  fetchCategories: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'categories', ids, emoji: '🏷' }),

  fetchForums: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'forums', ids, emoji: '🌧' }),

  fetchThreads: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'threads', ids, emoji: '📃' }),

  fetchPosts: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'posts', emoji: '📞', ids }),

  fetchUsers: ({ dispatch }, { ids }) => dispatch('fetchItems', { resource: 'useres', ids, emoji: '🧑' }),

  fetchAllCategories ({ state, commit }) {
    console.log('🔥', '🏷', 'all')
    return new Promise((resolve, reject) => {
      onValue(ref(getDatabase(), 'categories'), snapshot => {
        const categoriesObject = snapshot.val()
        Object.keys(categoriesObject).forEach(categoryId => {
          const category = categoriesObject[categoryId]
          commit('setItem', { resource: 'categories', id: categoryId, item: category })
        })
        resolve(Object.values(state.categories))
      }, {
        onlyOnce: true
      })
    })
  },

  fetchItem ({ state, commit }, { id, emoji, resource }) {
    console.log('✨', emoji, id)
    // fetch thread
    return new Promise((resolve, reject) => {
      onValue(child(ref(getDatabase(), resource), id), snapshot => {
        commit('setItem', { resource, id: snapshot.key, item: snapshot.val() })
        resolve(state[resource][id])
      }, {
        onlyOnce: true
      })
    })
  },

  fetchItems ({ dispatch }, { ids, resource, emoji }) {
    ids = Array.isArray(ids) ? ids : Object.keys(ids)
    return Promise.all(ids.map(id => dispatch('fetchItem', { id, emoji, resource })))
  }
}
