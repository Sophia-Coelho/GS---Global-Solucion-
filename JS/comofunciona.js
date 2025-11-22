document.addEventListener('DOMContentLoaded', function() {
    
    const flipContainers = document.querySelectorAll('.flip-container');

    flipContainers.forEach(container => {
        container.addEventListener('click', function() {
            this.classList.toggle('flip');
        });
    });

    const botaoComecar = document.getElementById('btn-comecar');
    if (botaoComecar) {
        botaoComecar.addEventListener('click', function() {
            window.location.href = "Cadastro.html"; 
        });
    }
});