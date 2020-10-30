let skills = [];
let currentActiveSkill = 1;
let skillsCarousel;
let height, width;
window.onload = (event) => {
    skillsCarousel = document.getElementById("skillsCarousel");
    height = skillsCarousel.clientHeight;
    width = skillsCarousel.clientWidth;
    skills = Array.from(document.getElementsByClassName("skill"));
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