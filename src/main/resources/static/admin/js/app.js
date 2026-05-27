document.addEventListener("DOMContentLoaded", function () {
    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            const wrapper = document.body.querySelector('#wrapper');
            wrapper.classList.toggle('toggled');
            localStorage.setItem('sb|sidebar-toggle', wrapper.classList.contains('toggled'));
        });
    }
});