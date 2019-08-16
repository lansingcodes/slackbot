module.exports = (event) => {
  const eventDate = new Date(event.startTime).setHours(0, 0, 0, 0)
  const todaysDate = new Date().setHours(0, 0, 0, 0)
  return eventDate === todaysDate
}
