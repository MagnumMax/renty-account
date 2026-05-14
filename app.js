document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  let isAuthenticated = localStorage.getItem('renty_auth') === 'true';

  const viewLogin = document.getElementById('view-login');
  const viewApp = document.getElementById('view-app');

  // Login Form Elements
  const btnSendCode = document.getElementById('btn-send-code');
  const btnVerifyCode = document.getElementById('btn-verify-code');
  const stepEmail = document.getElementById('login-step-email');
  const stepCode = document.getElementById('login-step-code');

  // Navigation Elements
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page-content');
  const btnLogoutDesktop = document.getElementById('btn-logout');
  const btnLogoutMobile = document.getElementById('btn-logout-mobile');

  // Mobile Drawer Elements
  const btnMobileMenu = document.getElementById('btn-mobile-menu');
  const btnCloseMenu = document.getElementById('btn-close-menu');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');


  // ==========================================
  // INITIALIZATION
  // ==========================================
  function init() {
    if (isAuthenticated) {
      showApp();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    viewApp.classList.add('hidden');
    viewLogin.classList.remove('hidden');
    // Reset login form
    stepEmail.classList.remove('hidden');
    stepCode.classList.add('hidden');
  }

  function showApp() {
    viewLogin.classList.add('hidden');
    viewApp.classList.remove('hidden');
    viewApp.classList.add('flex'); // restore flex layout
    setInitialRoute(); // Ensure correct page is shown when logging in
  }

  // ==========================================
  // AUTH LOGIC (MOCK)
  // ==========================================
  
  // Step 1: Request Code
  btnSendCode.addEventListener('click', () => {
    const emailInput = document.getElementById('login-email').value;
    if (!emailInput) {
      alert('Пожалуйста, введите email');
      return;
    }
    
    // Update email display on next screen
    document.getElementById('display-email').textContent = emailInput;
    
    // Simulate API request
    const originalText = btnSendCode.innerHTML;
    btnSendCode.innerHTML = '<ion-icon name="sync-outline" class="animate-spin"></ion-icon> Отправка...';
    btnSendCode.disabled = true;

    setTimeout(() => {
      stepEmail.classList.add('hidden');
      stepCode.classList.remove('hidden');
      btnSendCode.innerHTML = originalText;
      btnSendCode.disabled = false;
    }, 800);
  });

  // Step 2: Verify Code & Login
  btnVerifyCode.addEventListener('click', () => {
    // Simulate API request
    const originalText = btnVerifyCode.innerHTML;
    btnVerifyCode.innerHTML = '<ion-icon name="sync-outline" class="animate-spin"></ion-icon> Проверка...';
    btnVerifyCode.disabled = true;

    setTimeout(() => {
      localStorage.setItem('renty_auth', 'true');
      isAuthenticated = true;
      btnVerifyCode.innerHTML = originalText;
      btnVerifyCode.disabled = false;
      showApp();
    }, 1000);
  });

  // Logout Logic
  const handleLogout = () => {
    localStorage.removeItem('renty_auth');
    isAuthenticated = false;
    showLogin();
    closeMobileMenu();
  };

  btnLogoutDesktop.addEventListener('click', handleLogout);
  btnLogoutMobile.addEventListener('click', handleLogout);


  // ==========================================
  // PROFILE DROPDOWN LOGIC
  // ==========================================
  const btnProfileDesktop = document.getElementById('btn-profile-desktop');
  const profileDropdownDesktop = document.getElementById('profile-dropdown-desktop');

  if (btnProfileDesktop && profileDropdownDesktop) {
    btnProfileDesktop.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdownDesktop.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!profileDropdownDesktop.contains(e.target) && !btnProfileDesktop.contains(e.target)) {
        profileDropdownDesktop.classList.add('hidden');
      }
    });
  }


  // ==========================================
  // SPA ROUTING LOGIC
  // ==========================================
  
  function navigateTo(targetId, updateUrl = true) {
    // Update active state on nav items
    navItems.forEach(nav => {
      if (nav.getAttribute('data-target') === targetId) {
        nav.classList.add('active', 'text-brand', 'bg-brand/10');
        nav.classList.remove('text-text-muted');
      } else {
        nav.classList.remove('active', 'text-brand', 'bg-brand/10');
        nav.classList.add('text-text-muted');
      }
    });

    // Show target page, hide others
    pages.forEach(page => {
      if (page.id === `page-${targetId}`) {
        page.classList.remove('hidden');
        page.classList.add('block');
      } else {
        page.classList.add('hidden');
        page.classList.remove('block');
      }
    });

    // Update URL hash without jumping
    if (updateUrl) {
      window.history.pushState(null, null, `#${targetId}`);
    }

    // Close mobile menu if open
    closeMobileMenu();
    
    // Close profile dropdown if open
    if (profileDropdownDesktop) {
      profileDropdownDesktop.classList.add('hidden');
    }

    // A11y: Move focus to main content for screen readers
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      navigateTo(targetId);
    });
  });

  // Handle browser Back/Forward buttons
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`page-${hash}`)) {
      navigateTo(hash, false);
    } else {
      navigateTo('dashboard', false);
    }
  });

  // Set initial active nav state visually
  function setInitialRoute() {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`page-${hash}`)) {
      navigateTo(hash, false);
    } else {
      navigateTo('dashboard', false);
    }
  }


  // ==========================================
  // MOBILE MENU LOGIC
  // ==========================================
  function openMobileMenu() {
    mobileDrawerOverlay.classList.remove('hidden');
    // slight delay to allow display:block to apply before animating transform
    requestAnimationFrame(() => {
      mobileDrawer.classList.remove('translate-x-full');
    });
  }

  function closeMobileMenu() {
    mobileDrawer.classList.add('translate-x-full');
    setTimeout(() => {
      mobileDrawerOverlay.classList.add('hidden');
    }, 300); // match transition duration
  }

  btnMobileMenu.addEventListener('click', openMobileMenu);
  btnCloseMenu.addEventListener('click', closeMobileMenu);
  mobileDrawerOverlay.addEventListener('click', closeMobileMenu);

  // ==========================================
  // FINANCE TABS LOGIC
  // ==========================================
  const financeTabs = document.querySelectorAll('.finance-tab');
  const financeContents = document.querySelectorAll('.finance-content');

  financeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active state from all tabs
      financeTabs.forEach(t => {
        t.classList.remove('bg-main', 'text-text-main', 'shadow-sm');
        t.classList.add('text-text-muted');
      });

      // Add active state to clicked tab
      tab.classList.add('bg-main', 'text-text-main', 'shadow-sm');
      tab.classList.remove('text-text-muted');

      // Show related content
      const targetId = tab.id === 'tab-invoices' ? 'content-invoices' : 'content-fines';
      
      financeContents.forEach(content => {
        if (content.id === targetId) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });

  // Run initialization
  init();

});