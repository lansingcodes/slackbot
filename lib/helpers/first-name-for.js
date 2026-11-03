module.exports = organizer => {
  if (!organizer || /^[UW][A-Z0-9]+$/.test(organizer)) return 'Organizer'

  return ({
    davin: 'Davin',
    atomaka: 'Andrew',
    leo: 'Leo'
  })[organizer] || organizer.split(/[._-]/)[0].replace(/^./, letter => letter.toUpperCase())
}
