import { helpers as vuelidateHelpers } from 'vuelidate/lib/validators'
import { equalTo, getDatabase, onValue, orderByChild, query, ref } from 'firebase/database'

export const uniqueUsername = value => {
  if (!vuelidateHelpers.req(value)) {
    return true
  }
  return new Promise((resolve, reject) => {
    onValue(query(query(ref(getDatabase(), 'users'), orderByChild('usernameLower')), equalTo(value.toLowerCase())),
      snapshot => resolve(!snapshot.exists()),
      {
        onlyOnce: true
      }
    )
  })
}

export const uniqueEmail = value => {
  if (!vuelidateHelpers.req(value)) {
    return true
  }
  return new Promise((resolve, reject) => {
    onValue(query(query(ref(getDatabase(), 'users'), orderByChild('email')), equalTo(value.toLowerCase())),
      snapshot => resolve(!snapshot.exists()),
      {
        onlyOnce: true
      }
    )
  })
}

export const supportedImageFile = value => {
  if (!vuelidateHelpers.req(value)) {
    return true
  }
  const supported = ['jpg', 'jpeg', 'gif', 'png', 'svg']
  const suffix = value.split('.').pop()
  return supported.includes(suffix)
}

export const responseOk = value => {
  if (!vuelidateHelpers.req(value)) {
    return true
  }
  return new Promise((resolve, reject) => {
    fetch(value)
      .then(response => resolve(response.ok))
      .catch(() => resolve(false))
  })
}
