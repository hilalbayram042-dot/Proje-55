// Centralized translation logic
document.addEventListener('DOMContentLoaded', () => {
    const languageBtn = document.querySelector('.language-btn');
    const languageDropdown = document.querySelector('.language-dropdown');

    // 1. Dropdown Toggle Logic
    if (languageBtn && languageDropdown) {
        languageBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            languageDropdown.classList.toggle('show');
        });

        languageDropdown.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent page reload
            if (e.target.tagName === 'A') {
                const lang = e.target.getAttribute('data-lang');
                if (lang) {
                    setLanguage(lang);
                    languageDropdown.classList.remove('show');
                }
            }
        });
    }

    // Close the dropdown if clicking outside
    window.addEventListener('click', (event) => {
        if (languageDropdown && languageBtn && !languageDropdown.contains(event.target) && !languageBtn.contains(event.target)) {
            if (languageDropdown.classList.contains('show')) {
                languageDropdown.classList.remove('show');
            }
        }
    });

    // 2. Translation Functions
    async function loadAndTranslate(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Could not fetch ${lang}.json. Status: ${response.status}`);
            }
            const translations = await response.json();

            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[key]) {
                    // Handle title tag separately as it doesn't have textContent
                    if (element.tagName === 'TITLE') {
                        document.title = translations[key];
                    } else {
                        element.textContent = translations[key];
                    }
                }
            });
            
            // Update the page's lang attribute for accessibility and SEO
            document.documentElement.lang = lang;

        } catch (error) {
            console.error(`Error loading or applying translations for '${lang}':`, error);
        }
    }

    function setLanguage(lang) {
        localStorage.setItem('language', lang);
        loadAndTranslate(lang);
    }

    // 3. Initial Load Logic
    // Get language from storage or default to Turkish
    const savedLang = localStorage.getItem('language') || 'tr'; 
    setLanguage(savedLang);
});