export default (difficulty) => {
  switch (difficulty) {
    case 0:
      return 'none'
    case 1:
      return 'Easy'
    case 2:
      return 'Medium'
    case 3:
      return 'Hard'
    default:
      return 'none'
  }
}
