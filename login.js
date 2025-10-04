document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm')
  const user = document.getElementById('username')
  const pass = document.getElementById('password')
  const error = document.getElementById('error')

  form.addEventListener('submit', e => {
    e.preventDefault()
    const u = user.value.trim()
    const p = pass.value.trim()
    if (!u || !p) {
      error.hidden = false
      error.textContent = 'Please enter both username and password.'
      return
    }
    // demo: accept any non-empty credentials
    // store a flag and redirect to To-Do List
    localStorage.setItem('todo_logged_in', '1')
    window.location.href = 'To-Do List.html'
  })
})