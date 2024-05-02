const navList = '#app > div > div.sidebar > div.tabbed-sidebar-block > ul > li'

const selectors = {
  importTab: `${navList}:nth-child(3) > button`,
  usernameInput: '#lastFmUsername',
  periodSelect: '#lastFmPeriodDropdown',
  importButton: '#lastfmImportButton',
  optionsTab: `${navList}:nth-child(2) > button`,
  titlesCheck: '#display-titles',
  widthInput: '#x-axis',
  heightInput: '#y-axis',
  gapInput: '#gap',
  titleInput: '#title',
  numbersCheck: '#show-numbers',
  downloadButton: '#top-bar > button'
}

export default selectors
