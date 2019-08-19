module.exports = fakeSnapshot => {
  const firestore = {}
  firestore.collection = () => firestore
  firestore.where = () => firestore
  firestore.orderBy = () => firestore
  firestore.get = () => Promise.resolve(fakeSnapshot)
  return Promise.resolve(firestore)
}
