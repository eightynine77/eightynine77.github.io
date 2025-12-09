document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', e => {
        const link = e.target.closest('.spa-link');
        if (link) {
            e.preventDefault(); 
            const url = link.getAttribute('href');
            navigateTo(url);
        }
    });
    window.addEventListener('popstate', () => {
        loadContent(window.location.pathname);
    });
    attachSpecificPageLogic();
});

function navigateTo(url) {
    history.pushState(null, null, url); 
    loadContent(url);
}

async function loadContent(url) {
    const mainContent = document.getElementById('main-content');
    mainContent.style.opacity = '0.5';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Page not found');
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const newContent = doc.getElementById('main-content').innerHTML;
        mainContent.innerHTML = newContent;
        document.title = doc.title;
        updateActiveNav(url);
        attachSpecificPageLogic();
    } catch (error) {
        console.error('Error loading page:', error);
        mainContent.innerHTML = `<div class="container py-5 text-center"><h3>Error loading content.</h3></div>`;
    } finally {
        mainContent.style.opacity = '1';
    }
}

function updateActiveNav(url) {
    const path = url.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });
}

function attachSpecificPageLogic() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const status = document.getElementById('form-status');
    const data = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            status.innerHTML = '<div class="alert alert-success mt-3">Message sent successfully!</div>';
            form.reset();
        } else {
            const data = await response.json();
            if (Object.hasOwnProperty.call(data, 'errors')) {
                status.innerHTML = `<div class="alert alert-danger mt-3">${data["errors"].map(error => error["message"]).join(", ")}</div>`;
            } else {
                status.innerHTML = '<div class="alert alert-danger mt-3">Oops! There was a problem submitting your form.</div>';
            }
        }
    } catch (error) {
        status.innerHTML = '<div class="alert alert-danger mt-3">Oops! There was a problem submitting your form.</div>';
    }
}