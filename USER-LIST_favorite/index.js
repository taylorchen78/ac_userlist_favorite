const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users'

const user_data = []
const favorite_data = JSON.parse(localStorage.getItem('Myfavorite')) || []

const user_data_panel = document.getElementById('data-panel')
const searchType = document.getElementById('search-type')
const searchForm = document.getElementById('search')
const searchInput = document.getElementById('search-input')
const pagination = document.getElementById('pagination')
const genderFilter = document.getElementById('genderfilter')
const favoriteIcon = document.querySelector('.btn-danger')
const listType = document.getElementById('list-type')

const USER_PER_PAGE = 8
const PAGE_PER_ROW = 10

const SEARCH_BY_NAME = 1
const SEARCH_BY_AGE = 2
const SEARCH_BY_REGION = 3

const GENDER_ALL = 1
const GENDER_MALE = 2
const GENDER_FEMALE = 3

const LIST_ALL = 1
const LIST_FAVORITE = 2

let paginationData = []
let paginationDataByGender = []

let totalPage = 1
let currentPage = 1

let search_type = SEARCH_BY_NAME
let currentGender = GENDER_ALL
let currentList = LIST_ALL

// initial: get whole user data
axios.get(INDEX_URL).then((response => {
  user_data.push(...response.data.results)
  updatePage(user_data, 1, GENDER_ALL)
})).catch(err => console.log(err))

user_data_panel.addEventListener('click', (event => {
  if (event.target.matches('.card-avatar')) {
    showCurrentUserData(event.target.dataset.id)
  }
}))

favoriteIcon.addEventListener('click', (event => {
  if (currentList === LIST_ALL) {
    addFavoriteItem(event.target.dataset.id)
  } else {
    removeFavoriteItem(event.target.dataset.id)
  }
}))

listType.addEventListener('click', (event => {
  if (event.target.textContent === 'All') {
    if (currentList !== LIST_ALL) {
      currentList = LIST_ALL

      listType.firstElementChild.classList.add('active')
      listType.firstElementChild.nextElementSibling.classList.remove('active')

      updatePage(user_data, 1, GENDER_ALL)
    }
  } else if (event.target.textContent === 'My favorite') {
    if (currentList !== LIST_FAVORITE) {
      currentList = LIST_FAVORITE

      listType.firstElementChild.classList.remove('active')
      listType.firstElementChild.nextElementSibling.classList.add('active')

      updatePage(favorite_data, 1, GENDER_ALL)
    }
  }
}))

searchType.addEventListener('click', (event => {
  if (event.target.matches('.select-search-type')) {
    search_type = Number(event.target.value)
  }
}))

searchForm.addEventListener('submit', (event => {
  event.preventDefault()
  const input = searchInput.value.toLowerCase()
  let results = ''
  let input_data = ''

  if (currentList === LIST_ALL) {
    input_data = user_data
  } else {
    input_data = favorite_data
  }

  if (search_type === SEARCH_BY_NAME) {
    results = input_data.filter(
      user => user.name.toLowerCase().includes(input)
    )
  } else if (search_type === SEARCH_BY_AGE) {
    if (input !== '') {
      results = input_data.filter(
        user => user.age === Number(input)
      )
    } else {
      results = input_data
    }
  } else if (search_type === SEARCH_BY_REGION) {
    results = input_data.filter(
      user => user.region.toLowerCase().includes(input)
    )
  }

  updatePage(results, 1, GENDER_ALL)
}))

genderFilter.addEventListener('click', (event => {
  if (event.target.matches('.btn-gender-male')) {
    paginationDataByGender = paginationData.filter(
      user => user.gender === 'male'
    )

    currentGender = GENDER_MALE
    updatePage(paginationDataByGender, 1, GENDER_MALE)
  } else if (event.target.matches('.btn-gender-female')) {
    paginationDataByGender = paginationData.filter(
      user => user.gender === 'female'
    )

    currentGender = GENDER_FEMALE
    updatePage(paginationDataByGender, 1, GENDER_FEMALE)
  } else {
    currentGender = GENDER_ALL
    updatePage(paginationData, 1, GENDER_ALL)
  }
}))

pagination.addEventListener('click', (event => {
  if (event.target.getAttribute("data-page-category") !== null) {
    if (event.target.dataset.pageCategory === "next") {
      currentPage = Math.ceil(currentPage / PAGE_PER_ROW) * PAGE_PER_ROW + 1
    } else if (event.target.dataset.pageCategory === "pre") {
      currentPage = (Math.floor((currentPage / PAGE_PER_ROW) - 1) * PAGE_PER_ROW) + 1
    } else {
      currentPage = Number(event.target.dataset.pageCategory)
    }

    drawPagination(currentPage)

    if (currentGender === GENDER_ALL) {
      getPageData(currentPage)
    } else {
      getPageDataByGender(currentPage, paginationDataByGender)
    }
  }
}))

// draw user data
function displayUserData(user_data) {
  let htmlContent = ''
  user_data.forEach(item => {
    htmlContent += `
      <div class="col-sm-3">
        <div class="card mb-2">
          <img src="${item.avatar}" class="card-avatar" alt="Avatar" data-id="${item.id}" data-toggle="modal" data-target="#show-card-modal" width=100%>
          <div class="card-body">
            <h6 class="card-name" style="text-align:center" data-id="${item.id}">${item.name} ${item.surname}</h6>
          </div>
        </div>
      </div>
    `
  })
  user_data_panel.innerHTML = htmlContent
}

// draw pagination
function drawPagination(page) {
  const start = Math.floor((page - 1) / PAGE_PER_ROW) * PAGE_PER_ROW + 1
  let end = Math.ceil(page / PAGE_PER_ROW) * PAGE_PER_ROW
  let htmlContent = ''

  if (end > totalPage) {
    end = totalPage
  }

  const previousDisable = start === 1 || totalPage === 1 ? 'disabled' : ''
  const nextDisable = end === totalPage || totalPage === 1 ? 'disabled' : ''

  // draw previous button
  htmlContent += `
      <li class="page-item ${previousDisable}">
        <a class="page-link" href="javascript:;" data-page-category="pre">Previous</a>
      </li>
    `

  //draw page number button
  for (let i = start; i <= end; i++) {
    htmlContent += `
        <li class="page-item ${i === page ? 'active' : ''}">
          <a class="page-link" href="javascript:;" data-page-category="${i}">${i}</a>
        </li>
      `
  }

  //draw page number button
  htmlContent += `
      <li class="page-item ${nextDisable}">
        <a class="page-link" href="javascript:;" data-page-category="next">Next</a>
      </li>
    `

  pagination.innerHTML = htmlContent
}

// get page data
function getPageData(pageNum, data) {
  paginationData = data || paginationData
  const offset = (pageNum - 1) * USER_PER_PAGE
  const pageData = paginationData.slice(offset, offset + USER_PER_PAGE)
  displayUserData(pageData)
}

// get gender page data
function getPageDataByGender(pageNum, data) {
  paginationDataByGender = data || paginationDataByGender
  const offset = (pageNum - 1) * USER_PER_PAGE
  const pageData = paginationDataByGender.slice(offset, offset + USER_PER_PAGE)
  displayUserData(pageData)
}

// show user full data
function showCurrentUserData(user_id) {
  const url = INDEX_URL + '/' + user_id
  const card_name = document.querySelector('.modal-title')
  const card_avatar = document.getElementById('show-card-avatar')
  const card_email = document.getElementById('show-card-email')
  const card_region = document.getElementById('show-card-region')
  const card_birthday = document.getElementById('show-card-birthday')

  axios.get(url).then((response => {
    const data = response.data

    card_name.innerHTML = `
      <i class="fa ${data.gender === 'male' ? 'fa-mars' : 'fa-venus'} fa-lg" aria-hidden="true"></i>
      <span>${data.name} ${data.surname}</span>
    `

    card_avatar.innerHTML = `
      <img src="${data.avatar}" class="modal-card-avatar" alt="Avatar" width=100%>
    `

    card_email.innerHTML = `
      <i class="fa fa-envelope-o" aria-hidden="true"></i>
      <span>${data.email}</span>
    `
    card_region.innerHTML = `
      <i class="fa fa-globe" aria-hidden="true"></i>
      <span>${data.region}</span>
    `

    card_birthday.innerHTML = `
      <i class="fa fa-birthday-cake" aria-hidden="true"></i>
      <span>${data.birthday} (${data.age})</span>
    `

    favoriteIcon.dataset.id = user_id
    if (currentList === LIST_ALL) {
      favoriteIcon.textContent = 'Add favorite'
    } else {
      favoriteIcon.textContent = 'Remove favorite'
    }

  })).catch(err => console.log(err))

}

// add favorite user
function addFavoriteItem(id) {
  const user = user_data.find(item => item.id === Number(id))

  if (favorite_data.some(item => item.id === Number(id))) {
    alert(`${user.name} ${user.surname} is already in your favorite list.`)
  } else {
    favorite_data.push(user)
    alert(`Added ${user.name} ${user.surname} to your favorite list!`)
  }
  localStorage.setItem('Myfavorite', JSON.stringify(favorite_data))
}

// remove favorite user
function removeFavoriteItem(id) {
  const index = favorite_data.findIndex(item => item.id === Number(id))
  if (index === -1) return

  favorite_data.splice(index, 1)
  localStorage.setItem('Myfavorite', JSON.stringify(favorite_data))

  updatePage(favorite_data, 1, GENDER_ALL)
}

// update page data
function updatePage(list_data, currentPageNum, genderType) {
  totalPage = Math.ceil(list_data.length / USER_PER_PAGE) || 1
  currentPage = currentPageNum
  drawPagination(currentPage)

  if (genderType === GENDER_ALL) {
    getPageData(currentPage, list_data)
  } else {
    getPageDataByGender(currentPage, list_data)
  }
}