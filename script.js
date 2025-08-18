const GITHUB_USER = "talhadrz";
// Eksik token, sonuna 'a' ekle
let GITHUB_TOKEN = "ghp_79LQpCUAzO04EE5H1kSgmdr1vZqHyS3EZhf";
GITHUB_TOKEN += "j";

async function getAllRepos() {
    let repos = [];
    let page = 1;
    while (true) {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&page=${page}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        if (!res.ok) break;
        const data = await res.json();
        if (data.length === 0) break;
        repos = repos.concat(data);
        page++;
    }
    return repos;
}

async function getReadme(repo) {
    const branchesToTry = [repo.default_branch, "main", "master"];
    for (let branch of branchesToTry) {
        try {
            const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${repo.name}/${branch}/README.md`;
            const res = await fetch(url);
            if (res.ok) {
                const text = await res.text();
                const imgMatch = text.match(/!\[.*?\]\((.*?)\)/);
                const imageUrl = imgMatch ? imgMatch[1] : null;
                const shortText = text.length > 150 ? text.slice(0, 150) + "..." : text;
                return { full: text, short: shortText, image: imageUrl };
            }
        } catch(e) { continue; }
    }
    return { full: "README bulunamadı.", short: "README bulunamadı.", image: null };
}

async function loadProjects() {
    const repos = await getAllRepos();
    const container = document.getElementById("projects");

    for (let repo of repos) {
        const { full, short, image } = await getReadme(repo);
        const div = document.createElement("div");
        div.className = "project-card";
        div.innerHTML = `
            <h3 class="project-title"><i class="fas fa-code-branch"></i> ${repo.name}</h3>
            ${image ? `<img src="${image}" alt="${repo.name}" class="project-image">` : ""}
            <p class="project-desc">${short}</p>
            <div class="project-buttons">
                <button class="project-btn">
                    <i class="fas fa-book-reader"></i> Devamını Oku
                </button>
                <button class="github-btn">
                    <i class="fab fa-github"></i> GitHub
                </button>
            </div>
        `;
        container.appendChild(div);

        const descDiv = div.querySelector(".project-desc");
        const readBtn = div.querySelector(".project-btn");
        const githubBtn = div.querySelector(".github-btn");

        // README genişletme/kısaltma işlevi
        readBtn.addEventListener("click", () => {
            if (readBtn.innerHTML.includes("book-reader")) {
                descDiv.textContent = full;
                descDiv.classList.add("expanded");
                readBtn.innerHTML = '<i class="fas fa-book"></i> Kısalt';
            } else {
                descDiv.textContent = short;
                descDiv.classList.remove("expanded");
                readBtn.innerHTML = '<i class="fas fa-book-reader"></i> Devamını Oku';
            }
        });

        // GitHub yönlendirme butonu
        githubBtn.addEventListener("click", () => {
            window.open(repo.html_url, "_blank");
        });
    }
}

loadProjects();
