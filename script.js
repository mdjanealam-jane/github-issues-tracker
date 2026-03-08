let issues = [];
let currentTab = 'All';

const loginPage = document.getElementById('login-page');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const issueCard = document.getElementById('issue-card');
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

async function fetchIssues(searchQuery = ''){
    loading.classList.remove('hidden');
    issueCard.innerHTML = '';

    try{
        let url = 'https://phi-lab-server.vercel.app/api/v1/lab/issues';
        if(searchQuery){
            url = `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchQuery}`;
        }
        const response = await fetch(url);
        const result = await response.json();

        issues = result.data || result;
        displayIssues();
    }
    catch (error){
        console.log("error",error);
    }
    finally{
        loading.classList.add('hidden');
    }
}

function displayIssues(){
    issueCard.innerHTML = '';

    const filterData = issues.filter(singleIssue => {
        if(currentTab === 'All')
            return true;
        return singleIssue.status.toLowerCase() === currentTab.toLocaleLowerCase();
    });

    document.getElementById('count-issues').innerHTML = filterData.length;

    filterData.forEach(singleIssue => {
        const isOpen = singleIssue.status.toLowerCase() === 'open';
        const border = isOpen ? 'border-green-500' : 'border-purple-500';

        const HTMLCard = `
        <div class="bg-white p-4 rounded shadow border-t-4 ${border} cursor-pointer" onclick="openmode('${singleIssue.id}')">
            <h3 class="font-bold text-sm mb-2 text-slate-800">${singleIssue.title}</h3>
            <p class= "text-xs text-gray-500 line-clamp-2">${singleIssue.description}</p>
            <div class="mt-4 text-[11px] font-bold uppercase">
                Status: <span class="${isOpen ? 'text-green-500' : 'text-purple-500'}">${singleIssue.status}</span>
            </div>
        </div>
        `;

        issueCard.innerHTML += HTMLCard;
    })
}

const allBtn = document.querySelectorAll('.tab-btn');

allBtn.forEach(btn => {
    btn.addEventListener('click',function(event){
        currentTab = event.target.innerText.trim();
        allBtn.forEach(b => {
            b.classList.remove('bg-purple-800', 'text-white');
            b.classList.add('bg-white', 'text-black');
        });

        event.target.classList.remove('bg-white', 'text-black');
        event.target.classList.add('bg-purple-800', 'text-white');

        displayIssues();
    });
});

let searchBox;
search.addEventListener('input', function(event){
    const searchText = event.target.value;
    clearTimeout(searchBox);

    searchBox = setTimeout(() => {
        fetchIssues(searchText);
    });
});