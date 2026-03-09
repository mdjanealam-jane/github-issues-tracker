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
        <div class="bg-white p-4 rounded shadow border-t-4 ${border} cursor-pointer" onclick="openProblem('${singleIssue.id}')">
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

// tabs
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

// search box
let searchBox;
search.addEventListener('input', function(event){
    const searchText = event.target.value;
    clearTimeout(searchBox);

    searchBox = setTimeout(() => {
        fetchIssues(searchText);
    });
});

// pop-up of problems
const problemElements = document.getElementById('issue');
const closeBtn = document.getElementById('close');

async function openProblem(id) {
    problemElements.classList.remove('hidden');
    document.getElementById('popup-title').innerText = 'Loading....';
    document.getElementById('popup-description').innerText = 'Please Wait...';

    try{
        const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
        const result = await response.json();
        const eachData = result.data || result;

        document.getElementById('popup-title').innerText = eachData.title;
        document.getElementById('popup-description').innerText = eachData.description;
        document.getElementById('author').innerText = eachData.author;
        document.getElementById('assignee').innerText = eachData.assignee

        const date = new Date(eachData.createdAt || Date.now());
        document.getElementById('date').innerText = date.toLocaleDateString('en-GB');

        const priorityColor = document.getElementById('priority');
        const priorityStatus = eachData.priority || 'Medium';
        priorityColor.innerText = priorityStatus;

        if(priorityStatus.toLocaleLowerCase() === 'high'){
            priorityColor.className = 'text-[10px] font-bold px-2 py-1 rounded-full bg-red-500 text-white uppercase' 
        }
        else{
            priorityColor.className = 'text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500 text-white uppercase'
        }

        const status = document.getElementById('popup-status');
        const isOpen = eachData.status?.toLocaleLowerCase() === 'open';
        status.innerText = isOpen? 'Opened' : 'Closed';
        status.className = isOpen ? 'px-3 py-1 rounded-full font-bold text-white bg-green-500' : 'px-3 py-1 rounded-full font-bold text-white bg-purple-500';
    }
    catch(error){
        console.log("error", error);
    }
}
closeBtn.addEventListener('click', function(){
    problemElements.classList.add('hidden');
});