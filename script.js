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
        if(currentTab === 'All') return true;
        return singleIssue.status?.toLowerCase() === currentTab.toLowerCase();
    });
    document.getElementById('count-issues').innerHTML = filterData.length;
    filterData.forEach(singleIssue => {
        const isOpen = singleIssue.status?.toLowerCase() === 'open';
        const border = isOpen ? 'border-t-green-500' : 'border-t-purple-500';
        const priorityText = (singleIssue.priority || 'LOW').toUpperCase();
        let priorityStyle = 'bg-gray-100 text-gray-500';
        if (priorityText === 'HIGH') priorityStyle = 'bg-red-50 text-red-500';
        if (priorityText === 'MEDIUM') priorityStyle = 'bg-yellow-50 text-yellow-600';

        let labelsHTML = '';
        if(singleIssue.labels && Array.isArray(singleIssue.labels)) {
            singleIssue.labels.forEach(label => {
                let labelStyle = 'bg-slate-50 text-slate-600 border-slate-200';
                let icon = 'fa-tag';

                if (label.toLowerCase().includes('bug')) {
                    labelStyle = 'bg-red-50 text-red-500 border-red-200';
                    icon = 'fa-bug';
                } else if (label.toLowerCase().includes('help')) {
                    labelStyle = 'bg-yellow-50 text-yellow-500 border-yellow-200';
                    icon = 'fa-life-ring';
                } else if (label.toLowerCase().includes('enhancement')) {
                    labelStyle = 'bg-green-50 text-green-500 border-green-200';
                    icon = 'fa-wand-magic-sparkles';
                }

                labelsHTML += `<span class="border ${labelStyle} px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5"><i class="fa-solid ${icon}"></i> ${label}</span>`;
            });
        }

        const dateObj = new Date(singleIssue.createdAt || Date.now());
        const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;

        const HTMLCard = `
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 ${border} cursor-pointer hover:shadow-md transition flex flex-col h-full" onclick="openProblem('${singleIssue.id || singleIssue._id}')">
            
            <div class="flex justify-between items-start mb-3">
                <i class="fa-regular ${isOpen ? 'fa-circle-dot text-green-500' : 'fa-circle-check text-purple-500'} text-lg mt-1"></i>
                <span class="${priorityStyle} px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">${priorityText}</span>
            </div>
            
            <h3 class="font-bold text-slate-800 text-[15px] leading-snug mb-2 line-clamp-2">${singleIssue.title}</h3>
            <p class="text-xs text-gray-500 line-clamp-2 mb-4 flex-grow">${singleIssue.description || 'No description'}</p>
            
            <div class="flex flex-wrap gap-2 mb-4">
                ${labelsHTML}
            </div>
            
            <div class="mt-auto border-t border-gray-100 pt-3 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <span>#${singleIssue.id || '1'} by ${singleIssue.author || 'User'}</span>
                <span>${dateStr}</span>
            </div>
            
        </div>
        `;

        issueCard.innerHTML += HTMLCard;
    });
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
        document.getElementById('assignee').innerText = eachData.assignee || 'Unassigned';

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

        const popupLabels = document.getElementById('popup-labels');
        let modalLabels = '';
        
        if(eachData.labels && Array.isArray(eachData.labels)) {
            eachData.labels.forEach(label => {
                let labelStyle = 'bg-slate-50 text-slate-600 border-slate-200';
                let icon = 'fa-tag';

                if (label.toLowerCase().includes('bug')) {
                    labelStyle = 'bg-red-50 text-red-500 border-red-200';
                    icon = 'fa-bug';
                } else if (label.toLowerCase().includes('help')) {
                    labelStyle = 'bg-yellow-50 text-yellow-500 border-yellow-200';
                    icon = 'fa-life-ring';
                } else if (label.toLowerCase().includes('enhancement')) {
                    labelStyle = 'bg-green-50 text-green-500 border-green-200';
                    icon = 'fa-wand-magic-sparkles';
                }

                modalLabels += `<span class="border ${labelStyle} px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 w-max"><i class="fa-solid ${icon}"></i> ${label}</span>`;
            });
        }
        popupLabels.innerHTML = modalLabels;
    }
    
    catch(error){
        console.log("error", error);
    }
}
closeBtn.addEventListener('click', function(){
    problemElements.classList.add('hidden');
});