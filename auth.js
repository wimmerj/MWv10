// Autentizace pro přístup k pracovním nástrojům
(function() {
    const CORRECT_PASSWORD = 'ssztplz';
    const SESSION_KEY = 'worktools_authenticated';
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hodin v milisekundách
    
    function checkAuthentication() {
        const authData = localStorage.getItem(SESSION_KEY);
        
        if (authData) {
            try {
                const data = JSON.parse(authData);
                const now = new Date().getTime();
                
                // Kontrola, zda není autentizace prošlá
                if (data.timestamp && (now - data.timestamp) < SESSION_DURATION) {
                    return true;
                }
            } catch (e) {
                // Pokud je data poškozená, vymažeme je
                localStorage.removeItem(SESSION_KEY);
            }
        }
        
        return false;
    }
    
    function setAuthenticated() {
        const authData = {
            authenticated: true,
            timestamp: new Date().getTime()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(authData));
    }
    
    function showMainContent() {
        document.getElementById('auth-overlay').classList.add('auth-hidden');
        document.getElementById('main-content').style.display = 'block';
    }
    
    function showAuthForm() {
        document.getElementById('auth-overlay').classList.remove('auth-hidden');
        document.getElementById('main-content').style.display = 'none';
        document.getElementById('password-input').focus();
    }
    
    function handleAuthSubmit(event) {
        event.preventDefault();
        
        const passwordInput = document.getElementById('password-input');
        const errorDiv = document.getElementById('auth-error');
        const enteredPassword = passwordInput.value;
        
        if (enteredPassword === CORRECT_PASSWORD) {
            setAuthenticated();
            showMainContent();
            errorDiv.textContent = '';
            passwordInput.value = '';
        } else {
            errorDiv.textContent = 'Nesprávné heslo. Zkuste to znovu.';
            passwordInput.value = '';
            passwordInput.focus();
            
            // Animace pro zvýraznění chyby
            passwordInput.style.borderColor = '#ff5722';
            setTimeout(() => {
                passwordInput.style.borderColor = 'rgba(255,255,255,0.3)';
            }, 2000);
        }
    }
    
    // Inicializace při načtení stránky
    document.addEventListener('DOMContentLoaded', function() {
        // Nejdříve skryjeme hlavní obsah
        document.getElementById('main-content').style.display = 'none';
        
        // Kontrola autentizace
        if (checkAuthentication()) {
            showMainContent();
        } else {
            showAuthForm();
        }
        
        // Připojení event listeneru na formulář
        document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
        
        // Enter key pro rychlejší přihlášení
        document.getElementById('password-input').addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                handleAuthSubmit(event);
            }
        });
    });
    
    // Možnost odhlášení (pro testování nebo reset)
    window.logoutWorktools = function() {
        localStorage.removeItem(SESSION_KEY);
        location.reload();
    };
    
})();