module.exports = (upcomingEvents) => {
  return (robot) => Promise.resolve({
    upcoming: () => Promise.resolve(upcomingEvents)
  })
}
