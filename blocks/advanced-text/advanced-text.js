export default function init(el) {
    const allHP = document.querySelectorAll('h1, p');
    const regex = /\[(.*?)\]/;

    allHP.forEach((element, index, array) => {
        const content = element.textContent;
        const matches = content.match(regex);
        
        if (matches) {
            const classname = matches[1];
            element.classList.add(classname);
            const updatedElement = content.replace(matches[0], '');
            element.textContent = updatedElement;
        }
    });

}
