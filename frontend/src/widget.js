(function(){
    const button = document.createElement('div');
    button.id = 'portfolio assistant';
    button.textContent = "Ask Portfolio Assistant";

    Object.assign(button.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "10px 16px",
        borderRadius: "999px",
        cursor: "pointer",
        backgroundColor: "#1e3a8a", // in line with blue theme
        color: "#fff",
        fontSize: "14px",
        zIndex: 9999,
    })
    document.body.appendChild(button);

    //TODO: Add event listener, chat and call to the backend
})();