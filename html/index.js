let skills = [];
let currentActiveSkill = 1;
let skillsCarousel;
window.onload = (event) => {
    skillsCarousel = document.getElementById("skillsCarousel");
    skills = Array.from(document.getElementsByClassName("skill"));
    let projects = document.getElementsByClassName("project");
    for(let i=0;i<projects.length;i++){
        projects[i].addEventListener("click", expandProject);
    }
    let closeButtons = document.getElementsByClassName("closeButton");
    for(let i=0;i<closeButtons.length;i++){
        closeButtons[i].addEventListener("click", closeProject);
    }
};


function advSkillRight() {
    skills[getRightIndex()].className = "skill skill-inactive";

    skills[currentActiveSkill].className = "skill skill-right";

    currentActiveSkill = getLeftIndex();
    skills[currentActiveSkill].className = "skill skill-active";

    skills[getLeftIndex()].className = "skill skill-left";
}

function advSkillLeft() {
    skills[getLeftIndex()].className = "skill skill-inactive";

    skills[currentActiveSkill].className = "skill skill-left";

    currentActiveSkill = getRightIndex();
    skills[currentActiveSkill].className = "skill skill-active";

    skills[getRightIndex()].className = "skill skill-right";
}

function getLeftIndex() {
    return (currentActiveSkill - 1 + skills.length) % skills.length;
}

function getRightIndex() {
    return (currentActiveSkill + 1) % skills.length;
}

function expandProject(event) {
    // event.currentTarget.parentNode.prepend(event.currentTarget);
    setTimeout(function(node){ 
        node.className = "project"; 
    }, 1, event.currentTarget);
}

function closeProject(event) {
    event.currentTarget.parentNode.classList.add("project-collapsed");
    event.stopPropagation();
}

function showResume(preview) {
    preview.classList.add("hidden");
    let resume = document.getElementById("resume");
    resume.classList.remove("hidden");
    resume.width = resume.clientWidth;

}