window.addEventListener('DOMContentLoaded', event => {
    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled'); // A class to control sidebar visibility
            
            // For the main wrapper logic
            const wrapper = document.getElementById('wrapper');
            if (wrapper) {
                wrapper.classList.toggle('toggled');
            }
        });
    }
});
