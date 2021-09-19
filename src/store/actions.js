import { child, getDatabase, onValue, ref } from 'firebase/database'

export default {
  fetchItem ({ state, commit }, { id, emoji, resource }) {
    console.log('✨', emoji, id)
    // fetch thread
    return new Promise((resolve, reject) => {
      onValue(child(ref(getDatabase(), resource), id), snapshot => {
        commit('setItem', { resource, id: snapshot.key, item: snapshot.val() })
        resolve(state[resource].items[id])
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
