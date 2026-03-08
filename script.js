let issues = [];
let currentTab = 'All';

const loginPage = document.getElementById('login-page');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const issue = document.getElementById('issue');
const loading = document.getElementById('loading');
const tabContainer = document.getElementById('tab-container');
const search = document.getElementById('search');

loginForm.addEventListener('submit',function(event){
    event.preventDefault();

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if(user === 'admin' && pass ==='admin123'){
        loginPage.classList.add('hidden');
        dashboard.classList.remove('hidden');
        fetchIssues();
    }
    else{
        alert('Wrong username or password!!');
    }
});