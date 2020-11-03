let skills = [];
let indicators = [];
let currentActiveSkill = 1;
let skillsCarousel;
let skillIndicator;
window.onload = (event) => {
    skillsCarousel = document.getElementById("skillsCarousel");
    skillIndicator = document.getElementById("skillIndicator");
    skills = Array.from(document.getElementsByClassName("skill"));
    for(let i=0;i<skills.length;i++){
        let node = document.createElement("i");
        node.className = "fas fa-circle";
        indicators.push(node);
        skillIndicator.prepend(node);
    }
    indicators[1].classList.add("indicator-active");
    document.getElementsByClassName("skill-left")[0].addEventListener("click", advSkillRight);
    document.getElementsByClassName("skill-right")[0].addEventListener("click", advSkillLeft);
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
    skills[getRightIndex()].removeEventListener("click", advSkillLeft);

    skills[currentActiveSkill].className = "skill skill-right";
    skills[currentActiveSkill].addEventListener("click", advSkillLeft);
    indicators[currentActiveSkill].classList.remove("indicator-active");

    currentActiveSkill = getLeftIndex();
    skills[currentActiveSkill].className = "skill skill-active";
    skills[currentActiveSkill].removeEventListener("click", advSkillRight);
    indicators[currentActiveSkill].classList.add("indicator-active");

    skills[getLeftIndex()].className = "skill skill-left";
    skills[getLeftIndex()].addEventListener("click", advSkillRight);
}

function advSkillLeft() {
    skills[getLeftIndex()].className = "skill skill-inactive";
    skills[getLeftIndex()].removeEventListener("click", advSkillRight);

    skills[currentActiveSkill].className = "skill skill-left";
    skills[currentActiveSkill].addEventListener("click", advSkillRight);
    indicators[currentActiveSkill].classList.remove("indicator-active");

    currentActiveSkill = getRightIndex();
    skills[currentActiveSkill].className = "skill skill-active";
    skills[currentActiveSkill].removeEventListener("click", advSkillLeft);
    indicators[currentActiveSkill].classList.add("indicator-active");

    skills[getRightIndex()].className = "skill skill-right";
    skills[getRightIndex()].addEventListener("click", advSkillLeft);
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