function typingText(element, text) {
    let index = 0;
    const typing = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(typing);
        }
    }, 100);
}
