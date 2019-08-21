module.exports = matrix => {
  // Find maximum column widths
  const maxColumnLengths = matrix
    // Get the length of each string in the matrix
    .map(list => list.map(text => text.length))
    // Get the max length from each column
    .reduce((maxLengths, rowLengths) =>
      maxLengths.map((maxLength, index) =>
        Math.max(maxLength, rowLengths[index])
      )
    )

  // Convert matrix to lines of padded, formatted strings
  return matrix.map(list =>
    list.map((text, index) => {
      const length = maxColumnLengths[index]
      const padding = Array(length).join(' ')
      return (text + padding).substring(0, length)
    }).join(' :: ')
  ).join('\n')
}
