const navList = '#app > div > div.sidebar > div.tabbed-sidebar-block > ul > li'

const selectors = {
  importTab: `${navList}:nth-child(3) > button`,
  usernameInput: '#lastFmUsername',
  periodSelect: '#lastFmPeriodDropdown',
  importButton: '#lastfmImportButton',
  optionsTab: `${navList}:nth-child(2) > button`,
  titlesCheck:
    'div.tabbed-sidebar-block > div.sidebar-content > div.options-list > label:nth-child(4) > span.switch', // '#showTitles',
  widthInput: '#chartWidth',
  heightInput: '#chartHeight',
  gapInput: '#gap',
  titleInput: '#title',
  numbersCheck:
    'div.tabbed-sidebar-block > div.sidebar-content > div.options-list > label:nth-child(16) > span.switch', // '#showNumbers',
  downloadButton: '#top-bar > button'
}

export default selectors
